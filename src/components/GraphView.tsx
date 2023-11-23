import { Graph } from 'curricular-analytics-graph/src'
import { AcademicPlan, Course } from '../types'
import { useEffect, useRef } from 'react'
import { Prereqs } from '../util/Prereqs'

const styles: Record<string, string> = {}

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
    graph.current = new Graph({
      termName: (_, i) =>
        `${['Fall', 'Winter', 'Spring'][i % 3]} ${Math.floor(i / 3) + 1}`,
      termSummary: term => {
        return `Complexity: TODO\nUnits: ${term.reduce(
          (acc, curr) => acc + (+curr.course.units || 0),
          0
        )}`
      },
      courseName: ({ course }) => {
        return course.title
      },
      courseNode: ({ course }) => {
        return course.units // TODO
      },
      styleLinkedNode: (node, {}, link) => {
        if (link === null) {
          node.classList.remove(
            styles.selected,
            styles.directPrereq,
            styles.directBlocking,
            styles.prereq,
            styles.blocking
          )
        } else if (link.relation === 'backwards') {
          node.classList.add(link.direct ? styles.directPrereq : styles.prereq)
        } else {
          node.classList.add(
            link.relation === 'selected'
              ? styles.selected
              : link.relation === 'forwards'
              ? link.direct
                ? styles.directBlocking
                : styles.blocking
              : link.relation // never
          )
        }
      },
      tooltipTitle: ({ course }) => course.title,
      tooltipContent: ({ course }) => {
        return [
          ['Units', course.units],
          ['Complexity', 'TODO'],
          ['Centrality', 'TODO'],
          ['Blocking factor', 'TODO'],
          ['Delay factor', 'TODO']
        ]
      },
      tooltipRequisiteInfo: (element, source) => {
        element.textContent = source.course.title
      }
    })
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
    if (graph.current) {
      graph.current.setCurriculum(nodesByTerm)
    }
  }, [plan])

  return <div ref={ref} />
}
