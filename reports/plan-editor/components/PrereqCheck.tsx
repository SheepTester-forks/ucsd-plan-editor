/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { Fragment } from 'preact'
import { CourseCode } from '../../util/Prereqs.ts'

export type PrereqCheckProps = {
  code: CourseCode
  reqs: CourseCode[][]
  pastTerms: CourseCode[]
  assumedSatisfied: CourseCode[]
}
/**
 * A list of prereqs for a course in the "Prerequisites" section of the sidebar.
 */
export function PrereqCheck ({
  code,
  reqs,
  pastTerms,
  assumedSatisfied
}: PrereqCheckProps) {
  if (reqs.length === 0) {
    return (
      <p class='course-code-line'>
        {code} — <em class='no-prereqs'>No prerequisites</em>
      </p>
    )
  }
  const taken = [...pastTerms, ...assumedSatisfied]
  const satisfied = reqs.every(
    req => req.length === 0 || req.some(alt => taken.includes(alt))
  )
  return (
    <details class='course-code-item' open={!satisfied}>
      <summary class={`course-code ${satisfied ? '' : 'missing-prereq'}`}>
        {code}
      </summary>
      <ul class='reqs'>
        {reqs.map((req, i) => {
          if (req.length === 0) {
            return null
          }
          const satisfied = req.some(alt => taken.includes(alt))
          return (
            <li class={satisfied ? 'satisfied' : 'missing'} key={i}>
              {satisfied ? '✅' : '❌'}
              {req.map((alt, i) => (
                <Fragment key={i}>
                  {i !== 0 ? ' or ' : null}
                  {assumedSatisfied.includes(alt) ? (
                    <strong class='assumed' title='Assumed satisfied'>
                      {alt}*
                    </strong>
                  ) : pastTerms.includes(alt) ? (
                    <strong>{alt}</strong>
                  ) : (
                    alt
                  )}
                </Fragment>
              ))}
            </li>
          )
        })}
      </ul>
    </details>
  )
}
