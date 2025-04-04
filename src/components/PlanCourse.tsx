import React, { useEffect, useRef, useState } from 'react'
import {
  CourseCode,
  Offering,
  Prereqs,
  cleanCourseCode
} from '../util/Prereqs.ts'
import { Course } from '../types.ts'
import { CourseOptions } from './CourseOptions.tsx'

export type PlanCourseProps = {
  prereqs?: Prereqs
  offerings?: Record<string, Offering>
  termIndex?: number
  course: Course
  onCourse?: (course: Course) => void
  onRemove?: () => void
  new?: boolean
  dragged?: {
    width: number
    x: number
    y: number
  }
  onDrag?: (event: React.PointerEvent<HTMLElement>) => void
  pastCourses?: CourseCode[]
  concurrentCourses?: CourseCode[]
}
/**
 * A draggable course row in the plan editor.
 */
export function PlanCourse ({
  prereqs,
  offerings,
  termIndex,
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
  const courseOfferings = offerings?.[course.title.replace(' ', '')]

  const hasError = (duplicateCourse && validCode) || missingPrereqs.length > 0
  const hasWarning =
    (duplicateCourse && !validCode) ||
    duplicateCredit ||
    (courseOfferings && !courseOfferings[termIndex ?? 0])

  return (
    <li
      className={`course-editor ${isNew ? 'add-course' : ''} ${
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
        className={`course-field course-title ${
          validCode ? 'valid-course-code' : ''
        }`}
        type='text'
        list='courses'
        value={course.title}
        onChange={e => onCourse?.({ ...course, title: e.currentTarget.value })}
        onBlur={e => {
          const clean = cleanCourseCode(e.currentTarget.value)
          if (e.currentTarget.value !== clean) {
            onCourse?.({ ...course, title: clean })
          }
        }}
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
          <div className='settings-btn-wrapper'>
            <button
              className={`settings-btn ${
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
              {validCode && <span className='valid-course-icon'>✓</span>}
              {!course.forCredit && (
                <span className='failed-course-icon'>F</span>
              )}
              {(hasError || hasWarning) && (
                <span className='issue-icon'>{hasError ? '❌' : '⚠️'}</span>
              )}
            </button>
            <div
              className={`options-wrapper-arrow ${validCode ? 'info' : ''} ${
                showOptions ? '' : 'options-wrapper-hidden'
              }`}
            />
          </div>
          {onCourse && onRemove && (
            <CourseOptions
              course={course}
              onCourse={onCourse}
              onRemove={onRemove}
              valid={validCode}
              duplicateCourse={duplicateCourse}
              duplicateCredit={duplicateCredit}
              missingPrereqs={missingPrereqs}
              offerings={courseOfferings}
              termIndex={termIndex ?? 0}
              visible={showOptions}
            />
          )}
          <input
            className='course-field course-units term-units'
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            value={course.units}
            onChange={e =>
              onCourse?.({ ...course, units: e.currentTarget.value })
            }
            onBlur={e => {
              const clean = Number.isFinite(+e.currentTarget.value)
                ? +e.currentTarget.value < 0
                  ? '0'
                  : String(+e.currentTarget.value)
                : '4'
              if (e.currentTarget.value !== clean) {
                onCourse?.({ ...course, units: clean })
              }
            }}
            disabled={!onCourse}
          />
          <span
            className='term-icon-btn drag-btn'
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
