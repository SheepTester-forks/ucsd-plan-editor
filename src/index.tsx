import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import prereqs from '../../ExploratoryCurricularAnalytics/reports/output/prereqs.json'
import { App } from './components/App.tsx'
import { fromSearchParams } from './save-to-url.ts'

const { plan, transferCredit: satisfied = ['MATH 4C', 'AWP 3', 'AWP 4B'] } =
  fromSearchParams(new URL(window.location.href).searchParams)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      prereqs={prereqs}
      initPlan={plan}
      initSatisfied={satisfied}
      mode='advisor'
    />
  </StrictMode>
)
