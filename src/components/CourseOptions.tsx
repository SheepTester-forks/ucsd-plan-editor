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
    <div className='options-wrapper'>
      <div className='options-body'>
        <label className='toggle-wrapper'>
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
        <label className='toggle-wrapper'>
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
        <label className='toggle-wrapper'>
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
        <div className='course-note info'>
          <strong>{course.title}</strong> is a valid course code.
        </div>
      )}
      {duplicateCourse && (
        <div className={`course-note ${valid ? 'error' : 'warning'}`}>
          This course is listed multiple times in the same term.
        </div>
      )}
      {duplicateCredit && (
        <div className='course-note warning'>
          Credit for this course has already been received. If you are retaking
          this course, uncheck "Credit received" for the earlier course.
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
      <button className='remove-course-btn' onClick={onRemove}>
        Remove
      </button>
    </div>
  )
}
