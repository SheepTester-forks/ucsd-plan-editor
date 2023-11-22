import { Metadata } from '../types.ts'

export type MetadataFieldProps = {
  property: keyof Metadata
  children: string
  plan: Metadata
  onPlan: (change: Partial<Metadata>) => void
  values?: Record<string, string>
  placeholder?: string
  className?: string
}
/**
 * A convenience and helper component for a text field or dropdown (`<select>`)
 * field in the plan metadata section.
 */
export function MetadataField ({
  property,
  children: label,
  plan,
  onPlan,
  values,
  placeholder,
  className = ''
}: MetadataFieldProps) {
  return (
    <label className={`metadata-field ${className}`}>
      <p className='metadata-label'>{label}</p>
      {values ? (
        <select
          className='metadata-value'
          value={plan[property]}
          onChange={e => onPlan({ [property]: e.currentTarget.value })}
        >
          {Object.entries(values).map(([code, name]) => (
            <option value={code} key={code}>
              {name}
            </option>
          ))}
        </select>
      ) : (
        <input
          type='text'
          className='metadata-value'
          placeholder={placeholder}
          value={plan[property]}
          onChange={e => onPlan({ [property]: e.currentTarget.value })}
        />
      )}
    </label>
  )
}
