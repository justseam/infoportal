#!/usr/bin/env python3
"""InfoPORTAL AI-assistant cost model, grounded in measured payload sizes."""

# ---- Anthropic API pricing, $ per 1M tokens (cached 2026-06-24 model table) ----
# Sonnet 5 intro pricing ($2/$10) ran through 2026-08-31 and has now expired.
PRICING = {
    "Opus 5":    {"in": 5.00, "out": 25.00},
    "Sonnet 5":  {"in": 3.00, "out": 15.00},
    "Haiku 4.5": {"in": 1.00, "out":  5.00},
}
CACHE_READ = 0.10   # cache reads ~0.1x base input
CACHE_WRITE_5M = 1.25
CACHE_WRITE_1H = 2.00

# Minimum cacheable prefix, per model. A shorter prefix silently does NOT cache —
# no error, just cache_creation_input_tokens: 0. This bites the tool-use
# architecture on Haiku, whose 1.5k prefix falls under the 4096 floor.
CACHE_MIN = {"Opus 5": 512, "Sonnet 5": 1024, "Haiku 4.5": 4096}

# ---- Measured from the live app (chars / 3.6) ----
FULL_CATALOG   = 19_017   # 126 docs, all 352 versions w/ changelog notes
SLIM_CATALOG   =  4_810   # 126 docs, latest version only
HELP_ARTICLES  =  4_219   # 43 help articles, full text
INVOICES       =  1_145   # 12 months
INSTRUCTIONS   =    600   # system prompt prose
TOOL_DEFS      =    900   # ~6 tool schemas

QUESTION   =   40    # avg user question
ANSWER     =  420    # avg final answer (prose + small table)
TOOL_CALL  =   90    # assistant emitting a tool_use block
TOOL_RESULT = 260    # avg tool result (stale-check measured 23; doc lists larger)

QUESTIONS_PER_SESSION = 8
TOOL_FRACTION = 0.6   # share of questions needing a tool round-trip


def money(x: float) -> str:
    return f"${x:,.4f}" if x < 1 else f"${x:,.2f}"


def cost(model: str, cached_in: int, cache_writes: int, fresh_in: int, out: int,
         ttl_mult: float) -> float:
    p = PRICING[model]
    return (
        cache_writes / 1e6 * p["in"] * ttl_mult
        + cached_in   / 1e6 * p["in"] * CACHE_READ
        + fresh_in    / 1e6 * p["in"]
        + out         / 1e6 * p["out"]
    )


def architecture_a(model: str, ttl_mult: float, use_cache: bool = True):
    """Naive: whole repository stuffed into the system prompt on every call."""
    prefix = FULL_CATALOG + HELP_ARTICLES + INVOICES + INSTRUCTIONS
    calls = QUESTIONS_PER_SESSION
    history = 0
    cached_in = fresh_in = out = 0
    cache_writes = prefix if use_cache else 0
    for i in range(calls):
        if use_cache:
            if i > 0:
                cached_in += prefix
        else:
            fresh_in += prefix
        fresh_in += history + QUESTION
        out += ANSWER
        history += QUESTION + ANSWER
    return cost(model, cached_in, cache_writes, fresh_in, out, ttl_mult), calls, prefix


def architecture_b(model: str, ttl_mult: float):
    """Tool-use: model queries the repository through tools; tiny prefix."""
    prefix = INSTRUCTIONS + TOOL_DEFS
    cacheable = prefix >= CACHE_MIN[model]
    tool_qs = round(QUESTIONS_PER_SESSION * TOOL_FRACTION)
    plain_qs = QUESTIONS_PER_SESSION - tool_qs
    calls = tool_qs * 2 + plain_qs
    history = 0
    cached_in = fresh_in = out = 0
    cache_writes = prefix if cacheable else 0
    first = True
    for i in range(QUESTIONS_PER_SESSION):
        needs_tool = i < tool_qs
        for leg in range(2 if needs_tool else 1):
            if not cacheable:
                fresh_in += prefix          # below the floor — billed in full every call
            elif first:
                first = False
            else:
                cached_in += prefix
            fresh_in += history + (QUESTION if leg == 0 else TOOL_RESULT)
            out += TOOL_CALL if (needs_tool and leg == 0) else ANSWER
            history += (QUESTION if leg == 0 else TOOL_RESULT)
            history += TOOL_CALL if (needs_tool and leg == 0) else ANSWER
    return cost(model, cached_in, cache_writes, fresh_in, out, ttl_mult), calls, prefix


print("=" * 78)
print(f"InfoPORTAL — cost per AI-assistant session ({QUESTIONS_PER_SESSION} questions)")
print("=" * 78)

for label, fn, ttl, cached in [
    ("A. Full repo in prompt, NO caching",      architecture_a, CACHE_WRITE_1H, False),
    ("A. Full repo in prompt, 1h cache",        architecture_a, CACHE_WRITE_1H, True),
    ("B. Tool-use, 1h cache  (recommended)",    architecture_b, CACHE_WRITE_1H, True),
]:
    print(f"\n{label}")
    for model in PRICING:
        if fn is architecture_a:
            c, calls, prefix = fn(model, ttl, cached)
        else:
            c, calls, prefix = fn(model, ttl)
        print(f"   {model:<10} {money(c):>10}   ({calls} API calls, {prefix:,}-tok prefix)")

# Monthly rollups on the recommended architecture
print("\n" + "=" * 78)
print("Monthly cost — architecture B (tool-use), by usage")
print("=" * 78)
print(f"{'users':>8} {'sess/user/mo':>13} {'sessions':>10}   " + "  ".join(f"{m:>10}" for m in PRICING))
for users, spm in [(10, 4), (25, 8), (50, 12), (200, 8)]:
    sessions = users * spm
    row = []
    for model in PRICING:
        c, _, _ = architecture_b(model, CACHE_WRITE_1H)
        row.append(f"{money(c * sessions):>10}")
    print(f"{users:>8} {spm:>13} {sessions:>10}   " + "  ".join(row))

print("\nNote: token counts are character-based estimates (~3.6 chars/token).")
print("Verify exactly with client.messages.count_tokens() before quoting a customer.")
