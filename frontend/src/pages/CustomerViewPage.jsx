import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { customerApi } from '../api/customerApi'
import {
  Pencil, ArrowLeft, User, Phone, MapPin, Users, Calendar, CreditCard,
} from 'lucide-react'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={16} color="var(--accent)" />
          <span className="card-title">{title}</span>
        </div>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="detail-field">
      <label>{label}</label>
      <div className="detail-value">{value || <span style={{ color: 'var(--text-muted)' }}>—</span>}</div>
    </div>
  )
}

export default function CustomerViewPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    customerApi
      .getById(id)
      .then((r) => setCustomer(r.data))
      .catch((e) => { toast.error(e.message); navigate('/customers') })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) {
    return (
      <div className="loading-overlay" style={{ marginTop: 80 }}>
        <div className="spinner" />
        Loading customer…
      </div>
    )
  }

  if (!customer) return null

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => navigate('/customers')}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>{customer.name}</h1>
            <p>NIC: {customer.nicNumber}</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/customers/${id}/edit`)}
        >
          <Pencil size={15} /> Edit Customer
        </button>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information" icon={User}>
        <div className="detail-grid">
          <Field label="Full Name"     value={customer.name} />
          <Field label="NIC Number"    value={customer.nicNumber} />
          <Field label="Date of Birth" value={customer.dateOfBirth} />
        </div>
      </Section>

      {/* Phone Numbers */}
      <Section title="Mobile Numbers" icon={Phone}>
        {customer.mobileNumbers && customer.mobileNumbers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customer.mobileNumbers.map((m, i) => (
              <div key={m.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-blue">{i + 1}</span>
                <span style={{ fontFamily: 'monospace' }}>{m.number}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No mobile numbers on record.
          </p>
        )}
      </Section>

      {/* Addresses */}
      <Section title="Addresses" icon={MapPin}>
        {customer.addresses && customer.addresses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {customer.addresses.map((a, i) => (
              <div key={a.id || i} className="address-card">
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.875rem' }}>
                  Address {i + 1}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                  {a.addressLine1 && <div>{a.addressLine1}</div>}
                  {a.addressLine2 && <div>{a.addressLine2}</div>}
                  {(a.cityName || a.countryName) && (
                    <div>{[a.cityName, a.countryName].filter(Boolean).join(', ')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No addresses on record.
          </p>
        )}
      </Section>

      {/* Family Members */}
      <Section title="Family Members" icon={Users}>
        {customer.familyMembers && customer.familyMembers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customer.familyMembers.map((f) => (
              <Link
                key={f.id}
                to={`/customers/${f.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              >
                <div
                  style={{
                    width: 34, height: 34,
                    borderRadius: '50%',
                    background: 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent)',
                    flexShrink: 0,
                  }}
                >
                  {f.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{f.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    NIC: {f.nicNumber}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No family members linked.
          </p>
        )}
      </Section>
    </>
  )
}
