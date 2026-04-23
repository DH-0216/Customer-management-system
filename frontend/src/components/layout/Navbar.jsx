import { useLocation } from 'react-router-dom'

const TITLES = {
  '/customers':        { title: 'Customers',        sub: 'View and manage all customers' },
  '/customers/create': { title: 'Add Customer',     sub: 'Fill in the details to register a new customer' },
  '/bulk-upload':      { title: 'Bulk Upload',       sub: 'Import multiple customers from an Excel file' },
}

function getTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.endsWith('/edit')) return { title: 'Edit Customer', sub: 'Update customer information' }
  if (/\/customers\/\d+/.test(pathname)) return { title: 'Customer Details', sub: 'View full customer profile' }
  return { title: 'CMS', sub: '' }
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { title, sub } = getTitle(pathname)

  return (
    <header className="navbar">
      <div>
        <div className="navbar-title">{title}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub}</div>}
      </div>
    </header>
  )
}
