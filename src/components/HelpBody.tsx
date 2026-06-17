/** Renders a help article body: blank-line paragraphs, "• " bullets,
 *  "1. " numbered steps, "## " subheads, and **bold** spans. */
export function HelpBody({ body }: { body: string }) {
  const blocks = body.split('\n').filter((l) => l.trim().length > 0)
  const out: React.ReactNode[] = []
  let list: { kind: 'ul' | 'ol'; items: string[] } | null = null

  const flush = () => {
    if (!list) return
    if (list.kind === 'ul') {
      out.push(
        <ul key={`ul-${out.length}`} className="ml-1 space-y-1.5">
          {list.items.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
              <span>{inline(it)}</span>
            </li>
          ))}
        </ul>,
      )
    } else {
      out.push(
        <ol key={`ol-${out.length}`} className="ml-1 space-y-1.5">
          {list.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-brand-blue">
                {i + 1}
              </span>
              <span>{inline(it)}</span>
            </li>
          ))}
        </ol>,
      )
    }
    list = null
  }

  for (const raw of blocks) {
    const line = raw.trim()
    const bullet = line.match(/^[•\-]\s+(.*)$/)
    const step = line.match(/^\d+\.\s+(.*)$/)
    const head = line.match(/^##\s+(.*)$/)
    if (bullet) {
      if (!list || list.kind !== 'ul') {
        flush()
        list = { kind: 'ul', items: [] }
      }
      list.items.push(bullet[1])
    } else if (step) {
      if (!list || list.kind !== 'ol') {
        flush()
        list = { kind: 'ol', items: [] }
      }
      list.items.push(step[1])
    } else if (head) {
      flush()
      out.push(
        <h3 key={`h-${out.length}`} className="pt-1 text-sm font-bold text-brand-navy">
          {head[1]}
        </h3>,
      )
    } else {
      flush()
      out.push(
        <p key={`p-${out.length}`} className="text-sm leading-relaxed text-ink">
          {inline(line)}
        </p>,
      )
    }
  }
  flush()

  return <div className="space-y-3">{out}</div>
}

function inline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((p, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-brand-navy">{p}</strong> : <span key={i}>{p}</span>))
}
