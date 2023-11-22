import { useContext, useMemo, useRef } from 'react'
import { DragContext } from '../drag-drop.ts'

export type RemoveZoneProps = {
  onDropLocation?: (inside: boolean) => void
  active: boolean
}
/**
 * A red rectangle that appears as a drop target when dragging a course to
 * remove the course.
 */
export function RemoveZone ({ onDropLocation, active }: RemoveZoneProps) {
  const dragState = useContext(DragContext)
  const element = useRef<HTMLDivElement>(null)
  const inside = useMemo(() => {
    if (element.current && dragState) {
      const rect = element.current.getBoundingClientRect()
      onDropLocation?.(
        dragState.pointerX >= rect.left &&
          dragState.pointerY >= rect.top &&
          dragState.pointerX < rect.right &&
          dragState.pointerY < rect.bottom
      )
      return (
        dragState.pointerX >= rect.left &&
        dragState.pointerY >= rect.top &&
        dragState.pointerX < rect.right &&
        dragState.pointerY < rect.bottom
      )
    } else {
      onDropLocation?.(false)
      return false
    }
  }, [element.current, dragState?.pointerX, dragState?.pointerY])

  return (
    <div
      className={`remove-zone ${inside ? 'remove-hover' : ''} ${
        active ? '' : 'remove-zone-hidden'
      }`}
      ref={element}
    >
      <span>Drag here to remove course</span>
    </div>
  )
}
