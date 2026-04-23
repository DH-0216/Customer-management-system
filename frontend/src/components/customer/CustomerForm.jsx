import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import { useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import PhoneNumberList   from './PhoneNumberList'
import AddressList       from './AddressList'
import FamilyMemberPicker from './FamilyMemberPicker'

/**
 * CustomerForm — shared Create / Edit form
 * Props:
 *   defaultValues  - pre-filled for edit mode
 *   onSubmit(data) - called with validated form data
 *   isLoading      - disables submit while saving
 *   customerId     - used to exclude self from family picker (edit mode)
 */
export default function CustomerForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  customerId = null,
}) {
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      name:          '',
      dateOfBirth:   null,
      nicNumber:     '',
      mobileNumbers: [],
      addresses:     [],
      familyMemberIds: [],
    },
  })

  // Reset when defaultValues change (edit page)
  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  const familyIds = watch('familyMemberIds') || []

  const submitHandler = (data) => {
    const payload = {
      ...data,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split('T')[0]
        : null,
      mobileNumbers: (data.mobileNumbers || [])
        .filter((m) => m.number?.trim())
        .map((m) => ({ number: m.number.trim() })),
      addresses: (data.addresses || []).map((a) => ({
        addressLine1: a.addressLine1 || '',
        addressLine2: a.addressLine2 || '',
        countryId: a.countryId ? Number(a.countryId) : null,
        cityId:    a.cityId    ? Number(a.cityId)    : null,
      })),
      familyMemberIds: data.familyMemberIds || [],
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(submitHandler)} noValidate>
      {/* ── Basic Info ─────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Basic Information</span>
        </div>

        <div className="form-grid form-grid-2">
          {/* Name */}
          <div className="form-group">
            <label>
              Full Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
                maxLength: { value: 120, message: 'Maximum 120 characters' },
              })}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          {/* NIC */}
          <div className="form-group">
            <label>
              NIC Number <span className="required-star">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 199012345678"
              {...register('nicNumber', {
                required: 'NIC number is required',
                pattern: {
                  value: /^[0-9]{9}[vVxX]$|^[0-9]{12}$/,
                  message: 'Enter a valid NIC (9+V or 12 digits)',
                },
              })}
              className={errors.nicNumber ? 'input-error' : ''}
            />
            {errors.nicNumber && (
              <p className="form-error">{errors.nicNumber.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label>
              Date of Birth <span className="required-star">*</span>
            </label>
            <Controller
              control={control}
              name="dateOfBirth"
              rules={{ required: 'Date of birth is required' }}
              render={({ field }) => (
                <DatePicker
                  placeholderText="Select date"
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={80}
                  maxDate={new Date()}
                  className={errors.dateOfBirth ? 'input-error' : ''}
                  wrapperClassName="react-datepicker-wrapper"
                  popperPlacement="bottom-start"
                />
              )}
            />
            {errors.dateOfBirth && (
              <p className="form-error">{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Phone Numbers ──────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Mobile Numbers</span>
          <span
            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
          >
            Optional — multiple allowed
          </span>
        </div>
        <PhoneNumberList
          control={control}
          register={register}
          errors={errors}
        />
      </div>

      {/* ── Addresses ─────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Addresses</span>
          <span
            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
          >
            Optional — multiple allowed
          </span>
        </div>
        <AddressList
          control={control}
          register={register}
          errors={errors}
          setValue={setValue}
        />
      </div>

      {/* ── Family Members ─────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <span className="card-title">Family Members</span>
          <span
            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
          >
            Link other registered customers
          </span>
        </div>
        <Controller
          control={control}
          name="familyMemberIds"
          render={({ field }) => (
            <FamilyMemberPicker
              value={field.value || []}
              onChange={field.onChange}
              excludeId={customerId}
            />
          )}
        />
      </div>

      {/* ── Actions ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-secondary btn-lg"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          <X size={16} /> Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isLoading}
        >
          <Save size={16} />
          {isLoading ? 'Saving…' : 'Save Customer'}
        </button>
      </div>
    </form>
  )
}
