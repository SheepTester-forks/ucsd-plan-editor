/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { useEffect, useRef, useState } from 'preact/hooks'
import type { JSX } from 'preact/jsx-runtime'
import { cleanCourseCode, CourseCode, Prereqs } from '../../util/Prereqs.ts'
import { Course } from '../types.ts'
import { CourseOptions } from './CourseOptions.tsx'

export type PlanCourseProps = {
  prereqs?: Prereqs
  course: Course
  onCourse?: (course: Course) => void
  onRemove?: () => void
  new?: boolean
  dragged?: {
    width: number
    x: number
    y: number
  }
  onDrag?: (event: JSX.TargetedPointerEvent<HTMLElement>) => void
  pastCourses?: CourseCode[]
  concurrentCourses?: CourseCode[]
}
/**
 * A draggable course row in the plan editor.
 */
export function PlanCourse ({
  prereqs,
  course,
  onCourse,
  onRemove,
  new: isNew,
  dragged,
  onDrag,
  pastCourses,
  concurrentCourses
}: PlanCourseProps) {
  const ref = useRef<HTMLLIElement>(null)
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    const wrapper = ref.current
    if (showOptions && wrapper) {
      const handleClick = (e: MouseEvent) => {
        if (e.target instanceof Node && !wrapper.contains(e.target)) {
          setShowOptions(false)
        }
      }
      document.addEventListener('click', handleClick)
      return () => {
        document.removeEventListener('click', handleClick)
      }
    }
  }, [ref.current, showOptions])

  const validCode = !!prereqs?.[course.title]
  const duplicateCourse = !!concurrentCourses?.includes(course.title)
  const duplicateCredit = validCode && !!pastCourses?.includes(course.title)
  const missingPrereqs =
    validCode && pastCourses
      ? prereqs[course.title].filter(
          req => req.length > 0 && !req.some(alt => pastCourses.includes(alt))
        )
      : []

  const hasError = (duplicateCourse && validCode) || missingPrereqs.length > 0
  const hasWarning = (duplicateCourse && !validCode) || duplicateCredit

  return (
    <li
      class={`course-editor ${isNew ? 'add-course' : ''} ${
        dragged ? 'dragged' : ''
      }`}
      style={
        dragged
          ? {
              left: `${dragged.x}px`,
              top: `${dragged.y}px`,
              width: `${dragged.width}px`
            }
          : {}
      }
      ref={ref}
    >
      <input
        class='course-field course-title'
        type='text'
        list='courses'
        value={course.title}
        onInput={e => onCourse?.({ ...course, title: e.currentTarget.value })}
        onChange={e =>
          onCourse?.({
            ...course,
            title: cleanCourseCode(e.currentTarget.value)
          })
        }
        placeholder={isNew ? 'Add a course' : 'Course name'}
        disabled={!onCourse}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.currentTarget.parentElement?.nextElementSibling
              ?.querySelector('input')
              ?.focus()
          } else if (e.key === 'Backspace' && course.title === '') {
            if (!isNew) {
              onRemove?.()
            }
            e.currentTarget.parentElement?.previousElementSibling
              ?.querySelector('input')
              ?.focus()
            e.preventDefault()
          }
        }}
      />
      {!isNew && (
        <>
          <div class='settings-btn-wrapper'>
            <button
              class={`settings-btn ${
                course.requirement.major
                  ? course.requirement.college
                    ? 'overlap'
                    : 'major-req'
                  : course.requirement.college
                  ? 'college-req'
                  : ''
              }`}
              title={[
                'Course options',
                course.requirement.major
                  ? course.requirement.college
                    ? ': overlaps GE and major requirements'
                    : ': major requirement'
                  : course.requirement.college
                  ? ': GE requirement'
                  : '',
                prereqs?.[course.title] ? ', valid course code' : '',
                course.forCredit ? '' : ', no credit received'
              ].join('')}
              onClick={() => setShowOptions(on => !on)}
            >
              {course.requirement.major
                ? course.requirement.college
                  ? '⇄'
                  : 'M'
                : course.requirement.college
                ? 'C'
                : '⚙'}
              {validCode && <span class='valid-course-icon'>✓</span>}
              {!course.forCredit && <span class='failed-course-icon'>F</span>}
              {(hasError || hasWarning) && (
                <span class='issue-icon'>{hasError ? '❌' : '⚠️'}</span>
              )}
            </button>
            {showOptions && (
              <div class={`options-wrapper-arrow ${validCode ? 'info' : ''}`} />
            )}
          </div>
          {showOptions && onCourse && onRemove && (
            <CourseOptions
              course={course}
              onCourse={onCourse}
              onRemove={onRemove}
              valid={validCode}
              duplicateCourse={duplicateCourse}
              duplicateCredit={duplicateCredit}
              missingPrereqs={missingPrereqs}
            />
          )}
          <input
            class='course-field course-units term-units'
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            value={course.units}
            onInput={e =>
              onCourse?.({ ...course, units: e.currentTarget.value })
            }
            onChange={e =>
              onCourse?.({
                ...course,
                units: Number.isFinite(+e.currentTarget.value)
                  ? +e.currentTarget.value < 0
                    ? '0'
                    : String(+e.currentTarget.value)
                  : '4'
              })
            }
            disabled={!onCourse}
          />
          <span
            class='term-icon-btn drag-btn'
            title='Move course'
            onPointerDown={onDrag}
          >
            ⠿
          </span>
        </>
      )}
    </li>
  )
}
