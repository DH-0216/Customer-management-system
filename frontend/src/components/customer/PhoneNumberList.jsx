import { useFieldArray } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'

export default function PhoneNumberList({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mobileNumbers',
  })

  return (
    <div>
      <div className="dynamic-list">
        {fields.map((field, index) => (
          <div key={field.id} className="dynamic-list-item">
            <div className="input-group" style={{ flex: 1 }}>
              <input
                type="tel"
                placeholder={`Mobile number ${index + 1}`}
                {...register(`mobileNumbers.${index}.number`, {
                  pattern: {
                    value: /^[0-9+\-\s()]{7,20}$/,
                    message: 'Enter a valid phone number',
                  },
                })}
                className={
                  errors?.mobileNumbers?.[index]?.number ? 'input-error' : ''
                }
              />
              {errors?.mobileNumbers?.[index]?.number && (
                <p className="form-error">
                  {errors.mobileNumbers[index].number.message}
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-danger"
              onClick={() => remove(index)}
              title="Remove"
              style={{ marginTop: '1px' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="add-item-btn"
        onClick={() => append({ number: '' })}
      >
        <Plus size={14} /> Add phone number
      </button>
    </div>
  )
}
