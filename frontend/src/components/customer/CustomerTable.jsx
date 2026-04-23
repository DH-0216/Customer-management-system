import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Eye, Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

/**
 * CustomerTable
 * Props:
 *   data        - array of CustomerSummaryDTO
 *   page        - current page (0-indexed)
 *   totalPages  - total pages from backend
 *   totalElements
 *   pageSize
 *   onPageChange(newPage)
 *   loading
 */
export default function CustomerTable({
  data = [],
  page = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 20,
  onPageChange,
  loading = false,
}) {
  const navigate   = useNavigate()
  const [sorting, setSorting] = useState([])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        size: 60,
        cell: ({ row }) => (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span style={{ fontWeight: 600 }}>{getValue()}</span>
        ),
      },
      {
        accessorKey: 'nicNumber',
        header: 'NIC Number',
        cell: ({ getValue }) => (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'dateOfBirth',
        header: 'Date of Birth',
        cell: ({ getValue }) => getValue() || '—',
      },
      {
        accessorKey: 'mobileCount',
        header: 'Phones',
        cell: ({ getValue }) => {
          const v = getValue()
          return v > 0 ? (
            <span className="badge badge-blue">{v}</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>—</span>
          )
        },
      },
      {
        accessorKey: 'addressCount',
        header: 'Addresses',
        cell: ({ getValue }) => {
          const v = getValue()
          return v > 0 ? (
            <span className="badge badge-green">{v}</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>—</span>
          )
        },
      },
      {
        accessorKey: 'familyCount',
        header: 'Family',
        cell: ({ getValue }) => {
          const v = getValue()
          return v > 0 ? (
            <span className="badge badge-yellow">{v}</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>—</span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-ghost btn-sm btn-icon"
              title="View"
              onClick={(e) => { e.stopPropagation(); navigate(`/customers/${row.original.id}`) }}
            >
              <Eye size={15} />
            </button>
            <button
              className="btn btn-ghost btn-sm btn-icon"
              title="Edit"
              onClick={(e) => { e.stopPropagation(); navigate(`/customers/${row.original.id}/edit`) }}
            >
              <Pencil size={15} />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  const startItem = page * pageSize + 1
  const endItem   = Math.min((page + 1) * pageSize, totalElements)

  const getSortIcon = (col) => {
    if (!col.getCanSort()) return null
    const sorted = col.getIsSorted()
    if (!sorted) return <ChevronsUpDown size={13} className="sort-icon" />
    return sorted === 'asc'
      ? <ChevronUp size={13} className="sort-icon" />
      : <ChevronDown size={13} className="sort-icon" />
  }

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getIsSorted() ? 'sorted' : ''}
                    style={{ width: header.column.columnDef.size }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {getSortIcon(header.column)}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="loading-overlay">
                    <div className="spinner" />
                    Loading customers…
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <h3>No customers found</h3>
                    <p>Try adjusting your search or add a new customer.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/customers/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalElements > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {startItem}–{endItem} of {totalElements} customers
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => onPageChange(0)}
              title="First page"
            >«</button>
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              title="Previous page"
            >‹</button>

            {/* Page number pills */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const mid   = Math.min(Math.max(page, 2), totalPages - 3)
              const start = Math.max(0, mid - 2)
              return start + i
            }).map((p) => (
              <button
                key={p}
                className={`page-btn${p === page ? ' active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              title="Next page"
            >›</button>
            <button
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(totalPages - 1)}
              title="Last page"
            >»</button>
          </div>
        </div>
      )}
    </div>
  )
}
