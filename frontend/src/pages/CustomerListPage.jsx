import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Upload, Search, Users, FileSpreadsheet, RefreshCw } from 'lucide-react'
import CustomerTable from '../components/customer/CustomerTable'
import { customerApi } from '../api/customerApi'
import { toast } from 'react-toastify'

const PAGE_SIZE = 20

export default function CustomerListPage() {
  const navigate = useNavigate()
  const [data,    setData]    = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [page,    setPage]    = useState(0)
  const [search,  setSearch]  = useState('')
  const [query,   setQuery]   = useState('')          // debounced
  const [loading, setLoading] = useState(false)

  const fetchCustomers = useCallback(async (p, q) => {
    setLoading(true)
    try {
      const r = await customerApi.getAll({ page: p, size: PAGE_SIZE, search: q })
      setData(r.data)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(0) }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { fetchCustomers(page, query) }, [page, query, fetchCustomers])

  return (
    <>
      {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>
            <Users size={22} color="var(--accent)" />
          </div>
          <div>
            <div className="stat-value">{data.totalElements.toLocaleString()}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
            <FileSpreadsheet size={22} color="var(--success)" />
          </div>
          <div>
            <div className="stat-value">{data.totalPages}</div>
            <div className="stat-label">Pages</div>
          </div>
        </div>
      </div>

      {/* Page actions */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>All Customers</h1>
          <p>Search, view and manage your customer records</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/bulk-upload')}>
            <Upload size={15} /> Bulk Upload
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/customers/create')}>
            <UserPlus size={15} /> Add Customer
          </button>
        </div>
      </div>

      {/* Search + Refresh */}
      <div
        style={{
          display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center',
        }}
      >
        <div className="search-bar">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or NIC…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => fetchCustomers(page, query)}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <CustomerTable
          data={data.content}
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </>
  )
}
