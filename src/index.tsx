import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import prereqs from '../../ExploratoryCurricularAnalytics/reports/output/prereqs.json'
import { App } from './components/App.tsx'
import { fromSearchParams } from './save-to-url.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      prereqs={prereqs}
      initPlan={fromSearchParams(new URL(window.location.href).searchParams)}
      mode='advisor'
    />
  </StrictMode>
)
