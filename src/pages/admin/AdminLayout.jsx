import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ReceiptText } from 'lucide-react'

const tabs = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ReceiptText },
  { to: '/admin/products', label: 'Products', icon: Package },
]

export default function AdminLayout() {
  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Admin panel</span>
          <h1 className="mt-2 text-3xl font-semibold">Clinic shop management</h1>
        </div>
      </div>
      <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-sand-200 pb-px" aria-label="Admin sections">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-900'
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  )
}
