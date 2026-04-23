import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CustomerForm from '../components/customer/CustomerForm'
import { customerApi } from '../api/customerApi'

export default function CustomerEditPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [defaults, setDefaults] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    customerApi
      .getById(id)
      .then((r) => {
        const c = r.data
        setDefaults({
          name:        c.name,
          dateOfBirth: c.dateOfBirth ? new Date(c.dateOfBirth) : null,
          nicNumber:   c.nicNumber,
          mobileNumbers: (c.mobileNumbers || []).map((m) => ({ number: m.number })),
          addresses:   (c.addresses || []).map((a) => ({
            addressLine1: a.addressLine1 || '',
            addressLine2: a.addressLine2 || '',
            countryId:   String(a.countryId || ''),
            cityId:      String(a.cityId    || ''),
          })),
          familyMemberIds: (c.familyMembers || []).map((f) => f.id),
        })
      })
      .catch((e) => {
        toast.error(e.message)
        navigate('/customers')
      })
      .finally(() => setFetching(false))
  }, [id, navigate])

  const handleSubmit = async (data) => {
    setSaving(true)
    try {
      await customerApi.update(id, data)
      toast.success('Customer updated successfully!')
      navigate(`/customers/${id}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (fetching) {
    return (
      <div className="loading-overlay" style={{ marginTop: 80 }}>
        <div className="spinner" />
        Loading customer…
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Edit Customer</h1>
          <p>Update the customer information below</p>
        </div>
      </div>
      <CustomerForm
        defaultValues={defaults}
        onSubmit={handleSubmit}
        isLoading={saving}
        customerId={Number(id)}
      />
    </>
  )
}
