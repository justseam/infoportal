export function Logo({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const ink = variant === 'light' ? '#ffffff' : '#242f42'
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-teal text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
          <path d="M13 3v5h5M8 13h8M8 17h5" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight" style={{ color: ink }}>
        Info<span style={{ color: variant === 'light' ? '#7fd2f5' : '#2463d0' }}>PORTAL</span>
      </span>
    </div>
  )
}
