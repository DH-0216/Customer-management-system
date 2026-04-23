import { useEffect, useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { masterApi } from '../../api/customerApi'

export default function AddressList({ control, register, errors, setValue }) {
  const [countries, setCountries] = useState([])
  const [citiesByIdx, setCitiesByIdx] = useState({})

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  })

  // Load countries once
  useEffect(() => {
    masterApi.getCountries().then((r) => setCountries(r.data)).catch(() => {})
  }, [])

  const handleCountryChange = async (index, countryId) => {
    setValue(`addresses.${index}.cityId`, '')
    if (!countryId) return
    try {
      const r = await masterApi.getCities(countryId)
      setCitiesByIdx((prev) => ({ ...prev, [index]: r.data }))
    } catch {
      setCitiesByIdx((prev) => ({ ...prev, [index]: [] }))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {fields.map((field, index) => (
        <div key={field.id} className="address-card">
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-danger address-card-remove"
            onClick={() => remove(index)}
            title="Remove address"
          >
            <Trash2 size={14} />
          </button>

          <div className="form-grid form-grid-2" style={{ marginBottom: 12 }}>
            {/* Address Line 1 */}
            <div className="form-group">
              <label>Address Line 1</label>
              <input
                type="text"
                placeholder="Street, building..."
                {...register(`addresses.${index}.addressLine1`)}
              />
            </div>

            {/* Address Line 2 */}
            <div className="form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                placeholder="Apt, suite, floor..."
                {...register(`addresses.${index}.addressLine2`)}
              />
            </div>
          </div>

          <div className="form-grid form-grid-2">
            {/* Country */}
            <div className="form-group">
              <label>Country</label>
              <select
                {...register(`addresses.${index}.countryId`)}
                onChange={(e) => {
                  register(`addresses.${index}.countryId`).onChange(e)
                  handleCountryChange(index, e.target.value)
                }}
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="form-group">
              <label>City</label>
              <select {...register(`addresses.${index}.cityId`)}>
                <option value="">Select city</option>
                {(citiesByIdx[index] || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="add-item-btn"
        onClick={() =>
          append({
            addressLine1: '',
            addressLine2: '',
            countryId: '',
            cityId: '',
          })
        }
      >
        <Plus size={14} /> Add address
      </button>
    </div>
  )
}
