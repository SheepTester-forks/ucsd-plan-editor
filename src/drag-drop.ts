import { createContext } from 'react'
import { Course, AcademicPlan } from './types.ts'

export type DropLocation = {
  yearIndex: number
  termIndex: number
  courseIndex: number
}
export type DragState = {
  course: Course
  originalPlan: AcademicPlan
  pointerId: number
  width: number
  offsetX: number
  offsetY: number
  pointerX: number
  pointerY: number
  dropLocation: DropLocation | 'remove' | null
}
export const DragContext = createContext<DragState | null>(null)
