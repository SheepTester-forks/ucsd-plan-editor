/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { useRef, useState } from 'preact/hooks'
import type { JSX } from 'preact/jsx-runtime'
import { CourseCode, Prereqs } from '../../util/Prereqs.ts'
import { DragState, DragContext } from '../drag-drop.ts'
import { AcademicPlan } from '../types.ts'
import { PlanCourse } from './PlanCourse.tsx'
import { RemoveZone } from './RemoveZone.tsx'
import { Year } from './Year.tsx'

export type EditorProps = {
  prereqs: Prereqs
  assumedSatisfied: CourseCode[]
  plan: AcademicPlan
  onPlan: (plan: AcademicPlan) => void
}
/**
 * The plan editor itself, excluding the sidebar and the plan metadata at the
 * top. This just contains a variable number of years (`Year`) and the remove
 * zone (`RemoveZone`).
 */
export function Editor ({
  prereqs,
  assumedSatisfied,
  plan,
  onPlan
}: EditorProps) {
  const element = useRef<HTMLDivElement>(null)
  // Ref needed for event handlers
  const dragStateRef = useRef<DragState | null>(null)
  // State needed to rerender
  const [dragStateVal, setDragStateVal] = useState<DragState | null>(null)

  const onPointerEnd = (e: JSX.TargetedPointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current
    if (e.pointerId === dragState?.pointerId) {
      const dropLoc = dragState.dropLocation
      if (dropLoc !== 'remove') {
        onPlan(
          dropLoc
            ? {
                ...plan,
                years: plan.years.map((year, i) =>
                  i === dropLoc.yearIndex
                    ? year.map((term, j) =>
                        j === dropLoc.termIndex
                          ? [
                              ...term.slice(0, dropLoc.courseIndex),
                              dragState.course,
                              ...term.slice(dropLoc.courseIndex)
                            ]
                          : term
                      )
                    : year
                )
              }
            : dragState.originalPlan
        )
      }
      dragStateRef.current = null
      setDragStateVal(null)
    }
  }

  return (
    <div
      class='plan-editor'
      onPointerMove={e => {
        if (e.pointerId === dragStateRef.current?.pointerId) {
          dragStateRef.current = {
            ...dragStateRef.current,
            pointerX: e.clientX,
            pointerY: e.clientY
          }
          setDragStateVal(dragStateRef.current)
        }
      }}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      ref={element}
    >
      <DragContext.Provider value={dragStateVal}>
        {plan.years.map((year, yearIndex) => (
          <Year
            prereqs={prereqs}
            planStartYear={plan.startYear}
            index={yearIndex}
            plan={year}
            onPlan={newPlan =>
              onPlan({
                ...plan,
                years: plan.years.map((year, index) =>
                  index === yearIndex ? newPlan : year
                )
              })
            }
            onYear={
              yearIndex === 0
                ? startYear => onPlan({ ...plan, startYear })
                : null
            }
            onDrag={(e, termIndex, courseIndex) => {
              if (!dragStateRef.current) {
                element.current?.setPointerCapture(e.pointerId)
                const rect =
                  e.currentTarget.parentElement!.getBoundingClientRect()
                dragStateRef.current = {
                  course: plan.years[yearIndex][termIndex][courseIndex],
                  originalPlan: plan,
                  pointerId: e.pointerId,
                  width: rect.width,
                  offsetX: e.clientX - rect.left,
                  offsetY: e.clientY - rect.top,
                  pointerX: e.clientX,
                  pointerY: e.clientY,
                  dropLocation: null
                }
                setDragStateVal(dragStateRef.current)
                // Remove course
                onPlan({
                  ...plan,
                  years: plan.years.map((year, i) =>
                    i === yearIndex
                      ? year.map((term, j) =>
                          j === termIndex
                            ? term.filter((_, k) => k !== courseIndex)
                            : term
                        )
                      : year
                  )
                })
              }
            }}
            onDropLocation={(termIndex, courseIndex) => {
              const dragState = dragStateRef.current
              if (!dragState) {
                return
              }
              if (courseIndex !== null) {
                if (
                  dragState.dropLocation !== 'remove' &&
                  dragState.dropLocation?.yearIndex === yearIndex &&
                  dragState.dropLocation.termIndex === termIndex &&
                  dragState.dropLocation.courseIndex === courseIndex
                ) {
                  return
                }
                dragStateRef.current = {
                  ...dragState,
                  dropLocation: { yearIndex, termIndex, courseIndex }
                }
              } else if (
                dragState.dropLocation !== 'remove' &&
                dragState.dropLocation?.yearIndex === yearIndex &&
                dragState.dropLocation.termIndex === termIndex
              ) {
                // Mouse no longer inside term. If drop location was in the
                // term, then set it to null.
                dragStateRef.current = {
                  ...dragState,
                  dropLocation: null
                }
              } else {
                return
              }
              setDragStateVal(dragStateRef.current)
            }}
            onRemove={() =>
              onPlan({
                ...plan,
                years: plan.years.filter((_, i) => i !== yearIndex)
              })
            }
            pastCourses={[
              ...assumedSatisfied,
              ...plan.years
                .slice(0, yearIndex)
                .flatMap(year =>
                  year.flatMap(term =>
                    term
                      .filter(course => course.forCredit)
                      .map(course => course.title)
                  )
                )
            ]}
            key={yearIndex}
          />
        ))}
        <button
          class='add-year'
          onClick={() =>
            onPlan({ ...plan, years: [...plan.years, [[], [], []]] })
          }
        >
          Add year <strong>+</strong>
        </button>
        {dragStateVal && (
          <RemoveZone
            onDropLocation={inside => {
              const dragState = dragStateRef.current
              if (!dragState) {
                return
              }
              if (inside) {
                if (dragState.dropLocation === 'remove') {
                  return
                }
                dragStateRef.current = {
                  ...dragState,
                  dropLocation: 'remove'
                }
              } else if (dragState.dropLocation === 'remove') {
                dragStateRef.current = {
                  ...dragState,
                  dropLocation: null
                }
              } else {
                return
              }
              setDragStateVal(dragStateRef.current)
            }}
          />
        )}
      </DragContext.Provider>
      {dragStateVal && (
        <PlanCourse
          course={dragStateVal.course}
          dragged={{
            width: dragStateVal.width,
            x: dragStateVal.pointerX - dragStateVal.offsetX,
            y: dragStateVal.pointerY - dragStateVal.offsetY
          }}
        />
      )}
    </div>
  )
}
