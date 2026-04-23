import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CustomerForm from '../components/customer/CustomerForm'
import { customerApi } from '../api/customerApi'

export default function CustomerCreatePage() {
  const navigate   = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await customerApi.create(data)
      toast.success(`Customer "${data.name}" created successfully!`)
      navigate(`/customers/${res.data.id}`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Add New Customer</h1>
          <p>Fill in the details below to register a customer</p>
        </div>
      </div>
      <CustomerForm onSubmit={handleSubmit} isLoading={loading} />
    </>
  )
}
