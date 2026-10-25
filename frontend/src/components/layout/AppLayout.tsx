import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Camera,
  Clock,
  FileText,
  FlaskConical,
  Home,
  Menu,
  Package,
  X,
} from 'lucide-react'
import { Brand } from '../Brand'
import { cn } from '../../lib/cn'

const NAV = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/products', label: 'My Products', icon: Package },
  { to: '/routine', label: 'My Routine', icon: Clock },
  { to: '/scan', label: 'Scan a Product', icon: Camera },
  { to: '/ingredients', label: 'Ingredient Explorer', icon: FlaskConical },
  { to: '/analysis', label: 'Analysis Results', icon: FileText },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sage-soft text-sage-deep'
                : 'text-ink-soft hover:bg-sage-wash hover:text-ink',
            )
          }
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="border-t border-line px-3 py-4">
        <p className="px-1 text-[11px] leading-relaxed text-ink-faint">
          SkinSync is educational and does not replace professional medical
          advice.
        </p>
      </div>
    </div>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface/70 backdrop-blur lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-ink-soft hover:bg-sage-wash"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-lift">
            <div className="flex items-center justify-between px-5 py-6">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-ink-soft hover:bg-sage-wash"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
