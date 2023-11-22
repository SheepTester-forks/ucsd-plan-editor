/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { CourseCode, Prereqs } from '../../util/Prereqs.ts'
import { Course } from '../types.ts'

export type CourseOptionsProps = {
  course: Course
  onCourse: (course: Course) => void
  onRemove: () => void
  valid: boolean
  duplicateCourse: boolean
  duplicateCredit: boolean
  missingPrereqs: string[][]
}
/**
 * The pop-up that appears when you click on the settings button for a course in
 * the plan.
 */
export function CourseOptions ({
  course,
  onCourse,
  onRemove,
  valid,
  duplicateCourse,
  duplicateCredit,
  missingPrereqs
}: CourseOptionsProps) {
  return (
    <div class='options-wrapper'>
      <div class='options-body'>
        <label class='toggle-wrapper'>
          <input
            type='checkbox'
            checked={course.requirement.major}
            onInput={e =>
              onCourse({
                ...course,
                requirement: {
                  ...course.requirement,
                  major: e.currentTarget.checked
                }
              })
            }
          />
          Major requirement
        </label>
        <label class='toggle-wrapper'>
          <input
            type='checkbox'
            checked={course.requirement.college}
            onInput={e =>
              onCourse({
                ...course,
                requirement: {
                  ...course.requirement,
                  college: e.currentTarget.checked
                }
              })
            }
          />
          College GE requirement
        </label>
        <label class='toggle-wrapper'>
          <input
            type='checkbox'
            checked={course.forCredit}
            onInput={e =>
              onCourse({
                ...course,
                forCredit: e.currentTarget.checked
              })
            }
          />
          Credit received from this course (uncheck if failed or withdrawn)
        </label>
      </div>
      {valid && (
        <div class='course-note info'>
          <strong>{course.title}</strong> is a valid course code.
        </div>
      )}
      {duplicateCourse && (
        <div class={`course-note ${valid ? 'error' : 'warning'}`}>
          This course is listed multiple times in the same term.
        </div>
      )}
      {duplicateCredit && (
        <div class='course-note warning'>
          Credit for this course has already been received. If you are retaking
          this course, uncheck "Credit received" for the earlier course.
        </div>
      )}
      {missingPrereqs.length > 0 && (
        <div class='course-note error'>
          Not all prerequisites have been satisfied:
          <ul class='missing-prereqs'>
            {missingPrereqs.map((req, i) => (
              <li key={i}>{req.join(' or ')}</li>
            ))}
          </ul>
        </div>
      )}
      <button class='remove-course-btn' onClick={onRemove}>
        Remove
      </button>
    </div>
  )
}
