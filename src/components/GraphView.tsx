import { Graph } from 'curricular-analytics-graph/src'
import { AcademicPlan, Course } from '../types'
import { useEffect, useRef } from 'react'
import { Prereqs } from '../util/Prereqs'

export type LinkedCourse = {
  course: Course
  backwards: LinkedCourse[]
  forwards: LinkedCourse[]
}

export type GraphViewProps = {
  prereqs: Prereqs
  plan: AcademicPlan
}
export function GraphView ({ prereqs, plan }: GraphViewProps) {
  const ref = useRef<HTMLDivElement>(null)

  const graph = useRef<Graph<LinkedCourse> | null>(null)

  useEffect(() => {
    graph.current = new Graph()
    ref.current?.append(graph.current.wrapper)

    return () => {
      graph.current?.wrapper.remove()
      graph.current = null
    }
  }, [])

  useEffect(() => {
    const nodesByTerm = plan.years.flatMap(year =>
      year.map(term =>
        term.map(
          (course): LinkedCourse => ({
            course,
            backwards: [],
            forwards: []
          })
        )
      )
    )
    for (const [i, term] of nodesByTerm.entries()) {
      for (const node of term) {
        reqs: for (const req of prereqs[node.course.title] ?? []) {
          for (const alt of req) {
            const candidate = nodesByTerm
              .slice(0, i)
              .flat()
              .find(node => node.course.title === alt && node.course.forCredit)
            if (candidate) {
              node.backwards.push(candidate)
              candidate.forwards.push(node)
              continue reqs
            }
          }
        }
      }
    }
    for (const term of nodesByTerm) {
      // Sort by outgoing nodes, then incoming
      term.sort(
        (a, b) =>
          b.forwards.length - a.forwards.length ||
          b.backwards.length - a.backwards.length
      )
    }
    console.log(nodesByTerm)
    if (graph.current) {
      graph.current.setCurriculum(nodesByTerm)
    }
  }, [plan])

  return <div ref={ref} />
}
