import { useEffect, useState } from 'react'
import { toCurrAnalyticsPlan, toUcsdPlan } from '../export-plan.ts'
import { toSearchParams } from '../save-to-url.ts'
import { AcademicPlan } from '../types.ts'
import { CourseCode, Prereqs, cleanCourseCode } from '../util/Prereqs.ts'
import { toCsv } from '../util/csv.ts'
import { download } from '../util/download.ts'
import { storage } from '../util/local-storage.ts'
import { CustomCourse } from './CustomCourse.tsx'
import { PrereqCheck } from './PrereqCheck.tsx'

const CUSTOM_COURSE_KEY = 'ei/plan-editor/custom-courses'
const SAVED_PLAN_PREFIX = 'ei/plan-editor/plans/'

function getSavedPlans (): string[] {
  const plans: string[] = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key?.startsWith(SAVED_PLAN_PREFIX)) {
      plans.push(key.replace(SAVED_PLAN_PREFIX, ''))
    }
  }
  return plans.sort()
}

type CustomCourse = {
  name: string
  reqs: string[][]
}
export type PrereqSidebarProps = {
  prereqs: Prereqs
  onPrereqs: (newPrereqs: Prereqs) => void
  assumedSatisfied: CourseCode[]
  onAssumedSatisfied: (newSatisfied: CourseCode[]) => void
  plan: AcademicPlan
  onPlan: (plan: AcademicPlan) => void
  mode: 'student' | 'advisor'
}
/**
 * The sidebar containing everything else other than the plan itself.
 */
export function PrereqSidebar ({
  prereqs,
  onPrereqs,
  assumedSatisfied,
  onAssumedSatisfied,
  plan,
  onPlan,
  mode
}: PrereqSidebarProps) {
  const [custom, setCustom] = useState<CustomCourse[]>(() =>
    JSON.parse(storage.getItem(CUSTOM_COURSE_KEY) || '[]')
  )
  const [planName, setPlanName] = useState('')
  const [originalPlan, setOriginalPlan] = useState(plan)
  const [updateUrl, setUpdateUrl] = useState(false)
  const [otherPlans, setOtherPlans] = useState<string[]>(getSavedPlans)

  const terms = plan.years.flatMap(year =>
    year.map(term =>
      term.filter(course => course.forCredit).map(course => course.title)
    )
  )

  useEffect(() => {
    onPrereqs(
      Object.fromEntries(
        custom.map(course => [
          course.name.toUpperCase(),
          course.reqs
            .map(alts =>
              alts.map(alt => alt.toUpperCase()).filter(alt => alt !== '')
            )
            .filter(alts => alts.length > 0)
        ])
      )
    )
  }, [custom])

  useEffect(() => {
    storage.setItem(CUSTOM_COURSE_KEY, JSON.stringify(custom))
  }, [custom])

  useEffect(() => {
    if (updateUrl) {
      window.history.replaceState({}, '', '?' + toSearchParams(plan))
    }
  }, [updateUrl, plan])

  useEffect(() => {
    // Due to race conditions (`planName` may be out of date when mashing keys),
    // only set if there's already something saved there
    if (storage.getItem(SAVED_PLAN_PREFIX + planName) !== null) {
      storage.setItem(SAVED_PLAN_PREFIX + planName, JSON.stringify(plan))
    }
  }, [plan, planName])

  useEffect(() => {
    const handleStorage = () => {
      const planNames = getSavedPlans()
      setOtherPlans(otherPlans =>
        otherPlans.includes(planName)
          ? planNames
          : planNames.filter(name => name !== planName)
      )
    }
    handleStorage()
    self.addEventListener('storage', handleStorage)
    return () => {
      self.removeEventListener('storage', handleStorage)
    }
  }, [])

  const saving = planName !== '' && !otherPlans.includes(planName)
  const planFileName = `Degree Plan-${plan.collegeName}-${plan.majorCode}.csv`

  return (
    <aside className='sidebar'>
      <h2 className='sidebar-heading'>Saved plans</h2>
      {(otherPlans.length > 0 || saving) && (
        <div className='saved-plans'>
          {(saving ? [...otherPlans, planName].sort() : otherPlans).map(
            name => (
              <label
                key={name}
                className={`saved-plan ${
                  saving && name === planName ? 'plan-current' : ''
                }`}
              >
                <input
                  type='radio'
                  name='plan'
                  checked={saving && name === planName}
                  onClick={() => {
                    if (!(saving && name === planName)) {
                      const json = storage.getItem(SAVED_PLAN_PREFIX + name)
                      if (json === null) {
                        return
                      }
                      const plan = JSON.parse(json)
                      onPlan(plan)
                      setOriginalPlan(plan)
                      setPlanName(name)
                      setOtherPlans(
                        saving
                          ? [
                              ...otherPlans.filter(plan => plan !== name),
                              planName
                            ].sort()
                          : otherPlans.filter(plan => plan !== name)
                      )
                    }
                  }}
                  className='visually-hidden'
                />{' '}
                {name}
              </label>
            )
          )}
        </div>
      )}
      <div className='plan-name-wrapper'>
        <input
          type='text'
          className='metadata-value lengthy'
          aria-label='Plan name'
          placeholder='To save the plan, name it here.'
          value={planName}
          onChange={e => {
            const newPlanName = e.currentTarget.value
            setPlanName(oldPlanName => {
              if (newPlanName !== '' && !otherPlans.includes(newPlanName)) {
                storage.setItem(
                  SAVED_PLAN_PREFIX + newPlanName,
                  storage.getItem(SAVED_PLAN_PREFIX + oldPlanName) ?? ''
                )
              }
              if (saving) {
                storage.removeItem(SAVED_PLAN_PREFIX + oldPlanName)
              }
              return newPlanName
            })
          }}
        />
      </div>
      {planName !== '' && !saving && (
        <p className='duplicate-plan-name'>
          A plan of this name already exists.
        </p>
      )}
      <div className='plan-btns'>
        <button
          className='download-btn'
          disabled={!saving}
          onClick={() => {
            setPlanName(planName => {
              let i = 1
              let newPlanName = `${planName} Copy`
              while (otherPlans.includes(newPlanName)) {
                i++
                newPlanName = `${planName} Copy (${i})`
              }
              setOtherPlans([...otherPlans, planName].sort())
              storage.setItem(
                SAVED_PLAN_PREFIX + newPlanName,
                storage.getItem(SAVED_PLAN_PREFIX + planName) ?? ''
              )
              return newPlanName
            })
          }}
        >
          Duplicate
        </button>
        <button
          className='download-btn delete-btn'
          disabled={!saving}
          onClick={() => {
            if (
              confirm(
                [
                  `Are you sure you want to delete your plan "${planName}"?`,
                  'To restore the plan, give the plan a name again. Otherwise, once you close the tab, the plan will be lost forever.'
                ].join('\n\n')
              )
            ) {
              setPlanName(planName => {
                storage.removeItem(SAVED_PLAN_PREFIX + planName)
                return ''
              })
            }
          }}
        >
          Delete
        </button>
        <button
          className='download-btn delete-btn'
          disabled={JSON.stringify(plan) === JSON.stringify(originalPlan)}
          onClick={() => {
            if (
              confirm(
                `Are you sure you want to revert all changes${
                  saving ? ` made since opening your plan "${planName}"` : ''
                }? This cannot be undone.`
              )
            ) {
              onPlan(originalPlan)
            }
          }}
        >
          Reset
        </button>
      </div>
      <label>
        <input
          type='checkbox'
          checked={updateUrl}
          onChange={e => setUpdateUrl(e.currentTarget.checked)}
        />{' '}
        Save plan in URL
      </label>
      <h2 className='sidebar-heading'>Prerequisites</h2>
      <ul className='course-codes'>
        {terms.flatMap((term, i) =>
          term.map((course, j) => {
            if (prereqs[course] && !assumedSatisfied.includes(course)) {
              return (
                <li key={`${i} ${j}`}>
                  <PrereqCheck
                    code={course}
                    reqs={prereqs[course]}
                    pastTerms={terms.slice(0, i).flat()}
                    assumedSatisfied={assumedSatisfied}
                  />
                </li>
              )
            } else {
              return null
            }
          })
        )}
      </ul>
      <h2 className='sidebar-heading'>Transferred credit</h2>
      {mode === 'advisor' ? (
        <p className='description'>
          For managing courses that most students are assumed to have credit
          for.
        </p>
      ) : (
        <p className='description'>
          Add courses that you already have equivalent credit for here.
        </p>
      )}
      <ul className='assumed-satisfied-list'>
        {[...assumedSatisfied, ''].map((name, i) => {
          const isNew = i === assumedSatisfied.length
          const handleChange = (value: string) =>
            onAssumedSatisfied(
              isNew
                ? [...assumedSatisfied, value]
                : assumedSatisfied.map((course, j) =>
                    j === i ? value : course
                  )
            )
          return (
            <li
              className={`assumed-satisfied ${
                isNew ? 'assumed-satisfied-new' : ''
              }`}
              key={i}
            >
              <input
                className='assumed-satisfied-input'
                type='text'
                list='courses'
                placeholder={isNew ? 'Type a course code here' : 'Course code'}
                value={name}
                onChange={e => handleChange(e.currentTarget.value)}
                onBlur={e => {
                  const clean = cleanCourseCode(e.currentTarget.value)
                  if (e.currentTarget.value !== clean) {
                    handleChange(clean)
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.parentElement?.nextElementSibling
                      ?.querySelector('input')
                      ?.focus()
                  } else if (e.key === 'Backspace' && name === '') {
                    if (i < assumedSatisfied.length) {
                      onAssumedSatisfied(
                        assumedSatisfied.filter((_, j) => j !== i)
                      )
                    }
                    e.currentTarget.parentElement?.previousElementSibling
                      ?.querySelector('input')
                      ?.focus()
                    e.preventDefault()
                  }
                }}
              />
            </li>
          )
        })}
      </ul>
      <h2 className='sidebar-heading'>
        Create a course
        <button
          className='create-course'
          onClick={() => setCustom([...custom, { name: '', reqs: [] }])}
        >
          +
        </button>
      </h2>
      {mode === 'advisor' ? (
        <p className='description'>
          For designing a new major. To change a course's prerequisites, create
          a course with an existing course code.
        </p>
      ) : (
        <p className='description'>
          For adding missing courses. To fix outdated or incorrect
          prerequisites, create a course with an existing course code to
          override its prerequisites.
        </p>
      )}
      <ul className='custom-courses'>
        {[...custom, { name: '', reqs: [] }].map(({ name, reqs }, i) => {
          const isNew = i === custom.length
          return (
            <CustomCourse
              name={name}
              reqs={reqs}
              onName={name =>
                setCustom(custom =>
                  isNew
                    ? [...custom, { name, reqs }]
                    : custom.map((course, j) =>
                        i === j ? { name, reqs: course.reqs } : course
                      )
                )
              }
              onReqs={reqs =>
                setCustom(custom =>
                  isNew
                    ? [...custom, { name, reqs }]
                    : custom.map((course, j) =>
                        i === j ? { name: course.name, reqs } : course
                      )
                )
              }
              onRemove={() => setCustom(custom.filter((_, j) => j !== i))}
              key={i}
              isNew={isNew}
            />
          )
        })}
      </ul>
      {mode === 'advisor' ? (
        <div className='download-wrapper'>
          <p className='download-label'>Export the plan as a CSV file for</p>
          <div className='download-btns'>
            <button
              className='download-btn'
              onClick={() => download(toCsv(toUcsdPlan(plan)), planFileName)}
            >
              plans.ucsd.edu
            </button>
            <button
              className='download-btn'
              onClick={() =>
                download(
                  toCsv(toCurrAnalyticsPlan(plan, prereqs)),
                  planFileName
                )
              }
            >
              Curricular Analytics
            </button>
          </div>
        </div>
      ) : (
        <div className='download-wrapper'>
          <div className='download-btns'>
            <button className='download-btn open-btn' disabled>
              Open in Curricular Analytics
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
