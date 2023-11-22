/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { Metadata } from '../types.ts'

export type MetadataFieldProps = {
  property: keyof Metadata
  children: string
  plan: Metadata
  onPlan: (change: Partial<Metadata>) => void
  values?: Record<string, string>
  placeholder?: string
  class?: string
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
  class: className = ''
}: MetadataFieldProps) {
  return (
    <label class={`metadata-field ${className}`}>
      <p class='metadata-label'>{label}</p>
      {values ? (
        <select
          class='metadata-value'
          value={plan[property]}
          onInput={e => onPlan({ [property]: e.currentTarget.value })}
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
          class='metadata-value'
          placeholder={placeholder}
          value={plan[property]}
          onInput={e => onPlan({ [property]: e.currentTarget.value })}
        />
      )}
    </label>
  )
}
