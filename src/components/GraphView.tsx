import { Graph } from 'curricular-analytics-graph/src'
import { useEffect, useRef } from 'react'
import { AcademicPlan, Course } from '../types'
import { Prereqs } from '../util/Prereqs'
import styles from './GraphView.module.css'

export type LinkedCourse = Course & {
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
        return `Cmpx: ${term.reduce(
          (acc, curr) => acc + curr.complexity,
          0
        )}\nUnits: ${term.reduce(
          (acc, curr) => acc + (+curr.course.units || 0),
          0
        )}`
      },
      courseName: ({ course }) => {
        return course.title
      },
      courseNode: ({ complexity }) => {
        return String(complexity)
      },
      styleNode: ({ element, course }) => {
        if (course.requirement.major) {
          element.classList.remove(styles.genEd)
        } else {
          element.classList.add(styles.genEd)
        }
      },
      styleLink: ({ element, redundant }) => {
        element.setAttributeNS(null, 'visibility', redundant ? 'hidden' : '')
      },
      styleLinkedNode: ({ element }, link) => {
        if (link === null) {
          element.classList.remove(
            styles.selected,
            styles.directPrereq,
            styles.directBlocking,
            styles.prereq,
            styles.blocking
          )
        } else if (link.relation === 'backwards') {
          element.classList.add(
            link.direct ? styles.directPrereq : styles.prereq
          )
        } else {
          element.classList.add(
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
      tooltipContent: ({
        course,
        blockingFactor,
        delayFactor,
        complexity,
        centrality
      }) => {
        return [
          ['Units', course.units],
          ['Complexity', String(complexity)],
          ['Centrality', String(centrality)],
          ['Blocking factor', String(blockingFactor)],
          ['Delay factor', String(delayFactor)]
        ]
      },
      tooltipRequisiteInfo: (element, { source }) => {
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
            ...course,
            backwards: [],
            forwards: []
          })
        )
      )
    )
    for (const [i, term] of nodesByTerm.entries()) {
      for (const node of term) {
        for (const req of prereqs[node.title] ?? []) {
          // Link the earliest course satisfying the requirement. TODO: Is it
          // better to select the latest?
          for (const candidate of nodesByTerm.slice(0, i).flat()) {
            if (node.forCredit && req.includes(candidate.title)) {
              node.backwards.push(candidate)
              candidate.forwards.push(node)
              break
            }
          }
        }
      }
    }
    // for (const term of nodesByTerm) {
    //   // Sort by outgoing nodes, then incoming
    //   term.sort(
    //     (a, b) =>
    //       b.forwards.length - a.forwards.length ||
    //       b.backwards.length - a.backwards.length
    //   )
    // }
    if (graph.current) {
      graph.current.setDegreePlan(nodesByTerm)
    }
  }, [plan])

  return <div className='graph' ref={ref} />
}
