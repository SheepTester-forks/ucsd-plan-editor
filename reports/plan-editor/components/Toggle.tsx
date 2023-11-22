/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

export type ToggleProps = {
  checked?: boolean
  onCheck?: (checked: boolean) => void
}
/**
 * A checkbox that looks like a toggle switch. Stolen from the [Tree of Blocked
 * Courses](https://educationalinnovation.ucsd.edu/ca-views/prereq-tree.html).
 * Currently not used anywhere.
 */
export function Toggle ({ checked, onCheck }: ToggleProps) {
  return (
    <>
      <input
        type='checkbox'
        class='toggle-checkbox'
        checked={checked}
        onInput={e => onCheck?.(e.currentTarget.checked)}
      />
      <span class='toggle-shape' />
    </>
  )
}
