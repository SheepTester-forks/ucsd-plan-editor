/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { Fragment } from 'preact'
import { useContext, useMemo, useRef } from 'preact/hooks'
import type { JSX } from 'preact/jsx-runtime'
import { CourseCode, Prereqs } from '../../util/Prereqs.ts'
import { DragContext } from '../drag-drop.ts'
import { Course, TermPlan } from '../types.ts'
import { PlanCourse } from './PlanCourse.tsx'

const Placeholder = () => <li class='placeholder-course'></li>

const COURSE_HEIGHT = 30
const emptyCourse: Omit<Course, 'id'> = {
  title: '',
  units: '4',
  requirement: { college: false, major: false },
  forCredit: true
}
export type TermProps = {
  prereqs: Prereqs
  name: string
  plan: TermPlan
  onPlan: (plan: TermPlan) => void
  onDrag?: (
    event: JSX.TargetedPointerEvent<HTMLElement>,
    course: number
  ) => void
  onDropLocation?: (index: number | null) => void
  pastCourses: CourseCode[]
}
/**
 * A term (quarter, eg fall, winter, or spring) in a year in the plan editor.
 * Contains courses (`PlanCourse`).
 */
export function Term ({
  prereqs,
  name,
  plan,
  onPlan,
  onDrag,
  onDropLocation,
  pastCourses
}: TermProps) {
  const dragState = useContext(DragContext)
  const element = useRef<HTMLElement>(null)
  const placeholderIndex = useMemo(() => {
    let index: number | null = null
    if (element.current && dragState) {
      const rect = element.current.getBoundingClientRect()
      if (
        dragState.pointerX >= rect.left &&
        dragState.pointerY >= rect.top &&
        dragState.pointerX < rect.right &&
        dragState.pointerY < rect.bottom
      ) {
        index = Math.floor((dragState.pointerY - rect.top) / COURSE_HEIGHT) - 1
        if (index < 0) {
          index = 0
        }
        if (index > plan.length) {
          index = plan.length
        }
      }
    }
    onDropLocation?.(index)
    return index
  }, [element.current, dragState?.pointerX, dragState?.pointerY])
  const newCourseId = useMemo(() => Math.random(), [plan.length])

  const termUnits = plan.reduce((cum, curr) => cum + +curr.units, 0)

  return (
    <section class='term-editor' ref={element}>
      <h3
        class={`heading term-heading info ${
          termUnits < 12 ? 'error' : termUnits > 18 ? 'warning' : ''
        }`}
      >
        {name}{' '}
        <span class='total-units term-units'>
          Units:{' '}
          <span
            class={
              termUnits < 12 || termUnits > 18 ? 'units units-bad' : 'units'
            }
          >
            {termUnits}
          </span>
        </span>
        <button
          class='term-icon-btn add-course-btn'
          title='Add course'
          onClick={() => onPlan([...plan, { ...emptyCourse, id: newCourseId }])}
        >
          +
        </button>
      </h3>
      <ul class='courses'>
        {[...plan, { ...emptyCourse, id: newCourseId }].map((course, i) => (
          <Fragment key={course.id}>
            {dragState?.dropLocation !== 'remove' && i === placeholderIndex && (
              <Placeholder />
            )}
            {!(placeholderIndex !== null && i === plan.length) && (
              <PlanCourse
                prereqs={prereqs}
                course={course}
                onCourse={newCourse =>
                  onPlan(
                    i === plan.length
                      ? [...plan, newCourse]
                      : plan.map((course, index) =>
                          index === i ? newCourse : course
                        )
                  )
                }
                onRemove={() => onPlan(plan.filter((_, j) => j !== i))}
                new={i === plan.length}
                onDrag={e => onDrag?.(e, i)}
                pastCourses={pastCourses}
                concurrentCourses={plan
                  .filter((course, j) => j !== i && course.forCredit)
                  .map(course => course.title)}
              />
            )}
          </Fragment>
        ))}
      </ul>
    </section>
  )
}
