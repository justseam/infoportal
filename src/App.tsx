import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession } from './state/session'
import type { Role } from './data/types'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Repository } from './pages/Repository'
import { DocumentDetail } from './pages/DocumentDetail'
import { Assistant } from './pages/Assistant'
import { Billing } from './pages/Billing'
import { Help } from './pages/Help'
import { Admin } from './pages/Admin'
import { AIUsage } from './pages/AIUsage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { persona } = useSession()
  if (!persona) return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { persona } = useSession()
  if (!persona) return <Navigate to="/" replace />
  if (!roles.includes(persona.role)) return <Navigate to="/app" replace />
  return <>{children}</>
}

const DOC_ROLES: Role[] = ['document', 'admin', 'super']
const ADMIN_ROLES: Role[] = ['admin', 'super']
/** AI cost data is Super Admin only — not visible to Internal Admin. */
const SUPER_ONLY: Role[] = ['super']

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="repository" element={<RequireRole roles={DOC_ROLES}><Repository /></RequireRole>} />
        <Route path="repository/:id" element={<RequireRole roles={DOC_ROLES}><DocumentDetail /></RequireRole>} />
        <Route path="assistant" element={<RequireRole roles={DOC_ROLES}><Assistant /></RequireRole>} />
        <Route path="billing" element={<RequireRole roles={DOC_ROLES}><Billing /></RequireRole>} />
        <Route path="help" element={<Help />} />
        <Route path="admin" element={<RequireRole roles={ADMIN_ROLES}><Admin /></RequireRole>} />
        <Route path="ai-usage" element={<RequireRole roles={SUPER_ONLY}><AIUsage /></RequireRole>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
