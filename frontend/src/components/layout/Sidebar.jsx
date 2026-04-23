import { NavLink, useNavigate } from 'react-router-dom'
import {
  Users, UserPlus, Upload, LayoutDashboard, ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    section: 'Overview',
    links: [
      { to: '/customers', label: 'All Customers', icon: Users, end: true },
    ],
  },
  {
    section: 'Manage',
    links: [
      { to: '/customers/create', label: 'Add Customer',   icon: UserPlus },
      { to: '/bulk-upload',      label: 'Bulk Upload',    icon: Upload },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">C</div>
        <div>
          <div className="sidebar-brand-text">CMS</div>
          <div className="sidebar-brand-sub">Customer Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ section, links }) => (
          <div key={section}>
            <div className="sidebar-section-label">{section}</div>
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
