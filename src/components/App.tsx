import { useState } from 'react'
import { AcademicPlan } from '../types.ts'
import { CourseCode, Prereqs } from '../util/Prereqs.ts'
import { Editor } from './Editor.tsx'
import { Metadata } from './Metadata.tsx'
import { PrereqSidebar } from './PrereqSidebar.tsx'
import { GraphView } from './GraphView.tsx'

export type AppProps = {
  prereqs: Prereqs
  initPlan: AcademicPlan
  mode: 'student' | 'advisor'
}
/**
 * The top-level component containing the plan metadata and editor and the
 * sidebar.
 */
export function App ({ prereqs: initPrereqs, initPlan, mode }: AppProps) {
  const [plan, setPlan] = useState(initPlan)
  const [customPrereqs, setCustomPrereqs] = useState<Prereqs>({})
  const [assumedSatisfied, setAssumedSatisfied] = useState<CourseCode[]>([
    'MATH 4C',
    'AWP 3',
    'AWP 4B'
  ])

  const prereqs = { ...initPrereqs, ...customPrereqs }

  return (
    <>
      <main className='main'>
        <div className='plan-info'>
          <Metadata
            plan={plan}
            onPlan={change => setPlan(plan => ({ ...plan, ...change }))}
          />
          <span className='total-units plan-units'>
            Total units:{' '}
            <span className='units'>
              {plan.years.reduce(
                (cum, curr) =>
                  cum +
                  curr.reduce(
                    (cum, curr) =>
                      cum + curr.reduce((cum, curr) => cum + +curr.units, 0),
                    0
                  ),
                0
              )}
            </span>
          </span>
        </div>
        <Editor
          prereqs={prereqs}
          assumedSatisfied={assumedSatisfied}
          plan={plan}
          onPlan={setPlan}
        />
        <GraphView prereqs={prereqs} plan={plan} />
      </main>
      <PrereqSidebar
        prereqs={prereqs}
        onPrereqs={setCustomPrereqs}
        assumedSatisfied={assumedSatisfied}
        onAssumedSatisfied={setAssumedSatisfied}
        plan={plan}
        onPlan={setPlan}
        mode={mode}
      />
      <datalist id='courses'>
        {Object.keys(prereqs).map(code => (
          <option value={code} key={code} />
        ))}
      </datalist>
    </>
  )
}
