import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuditEntry, Notification, Persona } from '../data/types'
import { AUDIT, CLIENTS, NOTIFICATIONS, PERSONAS } from '../data/mock'

interface SessionValue {
  persona: Persona | null
  /** which client's data is in view. For staff personas this is selectable. */
  activeClientId: string | null
  setActiveClientId: (id: string | null) => void
  login: (personaId: string) => void
  logout: () => void
  isStaff: boolean
  notifications: Notification[]
  markAllRead: () => void
  audit: AuditEntry[]
  logActivity: (action: AuditEntry['action'], target: string) => void
}

const Ctx = createContext<SessionValue | null>(null)

let auditSeq = 1000
const STORE_KEY = 'infoportal.session'

function loadStored(): { personaId: string; activeClientId: string | null } | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const stored = loadStored()
  const initialPersona = stored ? (PERSONAS.find((p) => p.id === stored.personaId) ?? null) : null
  const [persona, setPersona] = useState<Persona | null>(initialPersona)
  const [activeClientId, setActiveClientId] = useState<string | null>(
    stored?.activeClientId ?? initialPersona?.clientId ?? null,
  )

  // keep the session in localStorage so a refresh doesn't drop you to login
  useEffect(() => {
    if (persona) {
      localStorage.setItem(STORE_KEY, JSON.stringify({ personaId: persona.id, activeClientId }))
    } else {
      localStorage.removeItem(STORE_KEY)
    }
  }, [persona, activeClientId])

  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS)
  const [audit, setAudit] = useState<AuditEntry[]>(AUDIT)

  const isStaff = persona?.role === 'admin' || persona?.role === 'super'

  const login = useCallback((personaId: string) => {
    const p = PERSONAS.find((x) => x.id === personaId) ?? null
    setPersona(p)
    // clients see their own; staff default to the first client
    setActiveClientId(p?.clientId ?? CLIENTS[0].id)
    if (p) {
      auditSeq += 1
      setAudit((prev) => [
        {
          id: `a${auditSeq}`,
          time: new Date().toISOString(),
          user: p.name,
          action: 'login',
          target: 'InfoPORTAL (SSO via InfoTRAC)',
          clientId: p.clientId,
        },
        ...prev,
      ])
    }
  }, [])

  const logout = useCallback(() => {
    setPersona(null)
    setActiveClientId(null)
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const logActivity = useCallback(
    (action: AuditEntry['action'], target: string) => {
      if (!persona) return
      auditSeq += 1
      setAudit((prev) => [
        {
          id: `a${auditSeq}`,
          time: new Date().toISOString(),
          user: persona.name,
          action,
          target,
          clientId: activeClientId,
        },
        ...prev,
      ])
    },
    [persona, activeClientId],
  )

  const value = useMemo<SessionValue>(
    () => ({
      persona,
      activeClientId,
      setActiveClientId,
      login,
      logout,
      isStaff,
      notifications,
      markAllRead,
      audit,
      logActivity,
    }),
    [persona, activeClientId, login, logout, isStaff, notifications, markAllRead, audit, logActivity],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSession must be used within SessionProvider')
  return v
}
