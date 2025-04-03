import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import prereqs from '../../curricular-analytics-exploration/reports/output/prereqs.json'
import frequencies from '../../curricular-analytics-exploration/files/protected/summarize_frequency.json'
import { App } from './components/App.tsx'
import { fromSearchParams } from './save-to-url.ts'

const { plan, transferCredit: satisfied = ['MATH 4C', 'AWP 3', 'AWP 4B'] } =
  fromSearchParams(new URL(window.location.href).searchParams)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      prereqs={prereqs}
      offerings={Object.fromEntries(
        Object.entries(frequencies).map(([courseCode, quarters]) => [
          courseCode,
          [
            quarters.includes('FA21'),
            quarters.includes('WI22'),
            quarters.includes('SP22'),
            quarters.includes('S122') ||
              quarters.includes('S222') ||
              quarters.includes('S322')
          ]
        ])
      )}
      initPlan={plan}
      initSatisfied={satisfied}
      mode='advisor'
    />
  </StrictMode>
)
