import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',            label: 'Rankings' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/monthly',     label: 'Monthly HOF' },
  { to: '/admin',       label: 'Admin' }
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <nav className="border-b border-[#1f2937] bg-[#111827] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-8 h-16">
        <Link to="/" className="text-[#00aaff] font-bold text-xl tracking-tight">
          TM<span className="text-white">Ratings</span>
        </Link>
        <div className="flex gap-6">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors ${
                pathname === to
                  ? 'text-[#00aaff]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
