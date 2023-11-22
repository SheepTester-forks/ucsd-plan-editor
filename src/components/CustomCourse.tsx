/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>

import { cleanCourseCode } from '../../util/Prereqs.ts'

/// <reference lib="dom" />
/// <reference lib="deno.ns" />

export type CustomCourseProps = {
  name: string
  reqs: string[][]
  onName: (name: string) => void
  onReqs: (name: string[][]) => void
  onRemove: () => void
  isNew: boolean
}
/**
 * A custom course entry in the "Create a course" section of the sidebar.
 */
export function CustomCourse ({
  name,
  reqs,
  onName,
  onReqs,
  onRemove,
  isNew
}: CustomCourseProps) {
  return (
    <li class='custom-course'>
      <input
        class='custom-course-input'
        type='text'
        placeholder={isNew ? 'Type a course code here' : 'Course code'}
        value={name}
        onInput={e => onName(e.currentTarget.value)}
        onChange={e => onName(cleanCourseCode(e.currentTarget.value))}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.currentTarget.parentElement?.nextElementSibling
              ?.querySelector('input')
              ?.focus()
          } else if (e.key === 'Backspace' && name === '') {
            if (!isNew) {
              onRemove()
            }
            e.currentTarget.parentElement?.previousElementSibling
              ?.querySelector('input')
              ?.focus()
            e.preventDefault()
          }
        }}
      />
      {!isNew && (
        <ol class='custom-course-prereqs'>
          {[...reqs, []].map((alts, i) => (
            <li key={i}>
              <ul class='custom-prereq-alts'>
                {[...alts, ''].map((alt, j) => {
                  const newReq = i === reqs.length
                  const newAlt = j === alts.length
                  const handleChange = (value: string) =>
                    onReqs(
                      newReq
                        ? [...reqs, [value]]
                        : reqs.map((req, mi) =>
                            mi === i
                              ? newAlt
                                ? [...req, value]
                                : req.map((alt, mj) => (mj === j ? value : alt))
                              : req
                          )
                    )
                  return (
                    <li key={j}>
                      <input
                        class='custom-prereq-input'
                        type='text'
                        list='courses'
                        placeholder={
                          newReq
                            ? 'New requirement'
                            : j === 0
                            ? 'Prerequsite'
                            : newAlt
                            ? 'Add alternate'
                            : 'Alternate'
                        }
                        value={alt}
                        onInput={e => handleChange(e.currentTarget.value)}
                        onChange={e =>
                          handleChange(cleanCourseCode(e.currentTarget.value))
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.currentTarget.parentElement?.parentElement?.parentElement?.nextElementSibling
                              ?.querySelector('input')
                              ?.focus()
                          } else if (e.key === 'Backspace' && alt === '') {
                            if (!newAlt) {
                              if (alts.length === 1) {
                                onReqs(reqs.filter((_, mi) => mi !== i))
                              } else {
                                onReqs(
                                  reqs.map((req, mi) =>
                                    mi === i
                                      ? req.filter((_, mj) => mj !== j)
                                      : req
                                  )
                                )
                              }
                            }
                            if (j === 0) {
                              const element =
                                e.currentTarget.parentElement?.parentElement?.parentElement?.previousElementSibling?.querySelector(
                                  'li:last-child input'
                                )
                              if (element instanceof HTMLInputElement) {
                                element.focus()
                              }
                            } else {
                              e.currentTarget.parentElement?.previousElementSibling
                                ?.querySelector('input')
                                ?.focus()
                            }
                            e.preventDefault()
                          }
                        }}
                      />
                      {j < alts.length - 1 && ' OR '}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </li>
  )
}
