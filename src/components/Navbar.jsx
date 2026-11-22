import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Phone, ShoppingCart, User, X } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { clinic } from '../data/clinic'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'Our Doctor' },
  { to: '/services', label: 'Services' },
  { to: '/shop', label: 'Shop' },
  { to: '/contact', label: 'Contact' },
]

const linkClass = ({ isActive }) =>
  `rounded-full px-3.5 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-brand-100 text-brand-800' : 'text-ink-700 hover:bg-brand-50 hover:text-brand-700'
  }`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const { count } = useCart()
  // the admin does not see the shop or the cart
  const visibleLinks = isAdmin ? links.filter((l) => l.to !== '/shop') : links
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // close the mobile menu when the page changes
  useEffect(() => setOpen(false), [pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/90 backdrop-blur">
      <div className="hidden bg-brand-800 text-brand-50 sm:block">
        <div className="container-x flex items-center justify-between py-1.5 text-xs">
          <span>{clinic.emergencyNote}</span>
          <a href={`tel:+${clinic.phoneRaw}`} className="flex items-center gap-1.5 font-semibold hover:text-white">
            <Phone size={13} /> {clinic.phone}
          </a>
        </div>
      </div>

      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {visibleLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Link to="/cart" className="btn-ghost relative !px-3" aria-label={`Cart, ${count} items`}>
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="hidden items-center gap-1 lg:flex">
              {isAdmin ? (
                <Link to="/admin" className="btn-primary btn-sm">
                  <LayoutDashboard size={15} /> Admin
                </Link>
              ) : (
                <Link to="/orders" className="btn-outline btn-sm">
                  <User size={15} /> My orders
                </Link>
              )}
              <button onClick={handleLogout} className="btn-ghost btn-sm" aria-label="Log out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/login" className="btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn-primary btn-sm">Sign up</Link>
            </div>
          )}

          <button
            className="btn-ghost !px-3 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-sand-200 bg-white lg:hidden">
          <nav className="container-x flex flex-col gap-1 py-3" aria-label="Mobile">
            {visibleLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-wrap gap-2 border-t border-sand-200 pt-3">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="btn-primary btn-sm">Admin panel</Link>
                  ) : (
                    <Link to="/orders" className="btn-outline btn-sm">My orders</Link>
                  )}
                  <button onClick={handleLogout} className="btn-ghost btn-sm">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline btn-sm">Log in</Link>
                  <Link to="/register" className="btn-primary btn-sm">Sign up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
