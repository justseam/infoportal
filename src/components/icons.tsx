type P = { className?: string }
const base = (className = 'h-5 w-5') => ({
  className,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IconGrid = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)
export const IconFolder = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
)
export const IconSparkles = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
    <path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z" />
  </svg>
)
export const IconReceipt = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
)
export const IconLifebuoy = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" />
  </svg>
)
export const IconShield = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="M9.5 12l1.8 1.8L15 10" />
  </svg>
)
export const IconBell = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
)
export const IconSearch = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" />
  </svg>
)
export const IconDownload = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 4v10m0 0 4-4m-4 4-4-4" />
    <path d="M5 19h14" />
  </svg>
)
export const IconClock = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
export const IconLogout = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 12H3m0 0 4-4m-4 4 4 4" />
  </svg>
)
export const IconClose = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const IconSend = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4 12 20 4l-6 16-3-7z" />
  </svg>
)
export const IconLock = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)
export const IconChevron = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)
export const IconArticle = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M7 3h7l5 5v13a0 0 0 0 1 0 0H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M13 3v5h5M9 13h6M9 17h4" />
  </svg>
)
export const IconThumbUp = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" />
    <path d="M7 11l4-8a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7" />
  </svg>
)
export const IconThumbDown = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M7 13V4H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1z" />
    <path d="M7 13l4 8a2 2 0 0 0 2-2v-4h5a2 2 0 0 0 2-2.3l-1.2-6A2 2 0 0 0 16.8 4H7" />
  </svg>
)
export const IconGauge = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 18a9 9 0 1 1 18 0" />
    <path d="M12 18l4.5-5" />
    <circle cx="12" cy="18" r="1.4" />
  </svg>
)
export const IconChat = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l.8-5.5A8 8 0 1 1 21 12z" />
  </svg>
)
