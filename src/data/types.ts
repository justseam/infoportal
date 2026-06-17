export type Role = 'help' | 'document' | 'admin' | 'super'

export const ROLE_LABEL: Record<Role, string> = {
  help: 'Standard Help User',
  document: 'Document User',
  admin: 'Internal Admin',
  super: 'Super Admin',
}

export interface Client {
  id: string
  name: string
  shortName: string
  cid: string // InfoIMAGE client id
  accent: string // brand accent hex for white-label tint
  members: number
}

export interface Persona {
  id: string
  name: string
  title: string
  email: string
  role: Role
  clientId: string | null // null = internal staff (sees all clients)
}

export type DocCategory =
  | 'Contracts'
  | 'SOWs'
  | 'Legal'
  | 'Statement Designs'
  | 'Notice Designs'
  | 'Tax Forms'
  | 'Statements'
  | 'Assets'

export const CATEGORIES: DocCategory[] = [
  'Contracts',
  'SOWs',
  'Legal',
  'Statement Designs',
  'Notice Designs',
  'Tax Forms',
  'Statements',
  'Assets',
]

export type FileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'png' | 'jpg' | 'indd'

export interface DocVersion {
  v: number
  date: string // ISO
  author: string
  sizeKB: number
  note: string // changelog for this version
}

export interface Doc {
  id: string
  clientId: string
  name: string
  category: DocCategory
  fileType: FileType
  tags: string[]
  versions: DocVersion[] // newest last
}

export interface InvoiceLine {
  service: 'Print' | 'Postage' | 'eStatements+' | 'Composition' | 'Insert Mgmt'
  qty: number
  amount: number
}

export interface Invoice {
  id: string
  clientId: string
  period: string // 'YYYY-MM'
  lines: InvoiceLine[]
  total: number
}

export interface HelpArticle {
  id: string
  title: string
  category: string
  excerpt: string
  body: string
  tags: string[]
}

export interface AuditEntry {
  id: string
  time: string
  user: string
  action: 'login' | 'upload' | 'download' | 'edit' | 'view' | 'permission'
  target: string
  clientId: string | null
}

export interface Notification {
  id: string
  time: string
  text: string
  docId?: string
  read: boolean
}
