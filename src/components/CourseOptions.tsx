import { Course } from '../types.ts'
import { Offering } from '../util/Prereqs.ts'
import { termNames } from './Year.tsx'

export type CourseOptionsProps = {
  course: Course
  onCourse: (course: Course) => void
  onRemove: () => void
  valid: boolean
  duplicateCourse: boolean
  duplicateCredit: boolean
  missingPrereqs: string[][]
  offerings?: Offering
  termIndex: number
  visible: boolean
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
  missingPrereqs,
  offerings,
  termIndex,
  visible
}: CourseOptionsProps) {
  return (
    <div
      className={`options-wrapper ${visible ? '' : 'options-wrapper-hidden'}`}
    >
      <div className='options-body'>
        <label className='toggle-wrapper'>
          <input
            type='checkbox'
            checked={course.requirement.major}
            onChange={e =>
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
        <label className='toggle-wrapper'>
          <input
            type='checkbox'
            checked={course.requirement.college}
            onChange={e =>
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
        <label className='toggle-wrapper'>
          <input
            type='checkbox'
            checked={course.forCredit}
            onChange={e =>
              onCourse({
                ...course,
                forCredit: e.currentTarget.checked
              })
            }
          />
          Received credit from this course (uncheck if failed or withdrawn)
        </label>
      </div>
      {valid ? (
        <div className='course-note info'>
          <strong>{course.title}</strong> is a valid course code.
        </div>
      ) : (
        <div className='course-note warning'>
          <strong>{course.title}</strong> is not a valid course code. Enter a
          valid code to enable prerequisite checking and other features for this
          course.
        </div>
      )}
      {duplicateCourse && (
        <div className={`course-note ${valid ? 'error' : 'warning'}`}>
          {course.title} is listed multiple times in the same term.
        </div>
      )}
      {duplicateCredit && (
        <div className='course-note warning'>
          Credit for {course.title} has already been received. If you are
          retaking this course, uncheck "Received credit" for the earlier
          course.
        </div>
      )}
      {missingPrereqs.length > 0 && (
        <div className='course-note error'>
          Not all prerequisites have been satisfied:
          <ul className='missing-prereqs'>
            {missingPrereqs.map((req, i) => (
              <li key={i}>{req.join(' or ')}</li>
            ))}
          </ul>
        </div>
      )}
      {offerings ? (
        offerings[termIndex] ? (
          <div className='course-note info'>
            {course.title} is offered during{' '}
            {offerings
              .flatMap((offered, i) => (offered ? [termNames[i]] : []))
              .join(', ')}
            .
          </div>
        ) : (
          <div className='course-note warning'>
            {course.title} may not be offered during {termNames[termIndex]}. It
            is offered{' '}
            {offerings
              .flatMap((offered, i) => (offered ? [termNames[i]] : []))
              .join(', ') || 'never'}
            .
          </div>
        )
      ) : null}
      <button className='remove-course-btn' onClick={onRemove}>
        Remove
      </button>
    </div>
  )
}
