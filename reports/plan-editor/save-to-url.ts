import { colleges } from './components/Metadata.tsx'
import { AcademicPlan } from './types.ts'

export type UrlCourseJson = [
  title: string,
  units: number,
  requirement: number,
  term: number,
  forCredit?: number
]

export function fromSearchParams (params: URLSearchParams): AcademicPlan {
  const plan: AcademicPlan = {
    startYear: String(new Date().getFullYear()),
    years: [],
    departmentCode: '',
    majorName: '',
    majorCode: '',
    cipCode: '',
    collegeCode: 'RE',
    collegeName: '',
    degreeType: 'BS'
  }
  function urlParam (
    key: keyof Omit<AcademicPlan, 'years'>,
    paramName: string
  ): void {
    const value = params.get(paramName)
    if (value !== null) {
      plan[key] = value
    }
  }
  urlParam('startYear', 'year')
  urlParam('departmentCode', 'department')
  urlParam('majorName', 'major_name')
  urlParam('majorCode', 'major')
  urlParam('cipCode', 'cip')
  urlParam('collegeCode', 'college')
  plan.collegeName = colleges[plan.collegeCode]
  urlParam('degreeType', 'degree')
  const termCount = params.get('terms')
  const coursesJson = params.get('courses')
  const courses: UrlCourseJson[] | null =
    coursesJson !== null ? JSON.parse(coursesJson) : null
  const terms = Math.max(
    courses?.reduce((cum, curr) => Math.max(cum, curr[3]), 0) ?? 0,
    termCount !== null ? +termCount : 12
  )
  plan.years = Array.from({ length: Math.ceil(terms / 3) }, () => [[], [], []])
  if (courses) {
    for (const [title, units, requirement, term, forCredit] of courses) {
      plan.years[Math.floor(term / 3)][term % 3].push({
        title,
        units: String(units),
        requirement: {
          major: !!(requirement & 0b1),
          college: !!(requirement & 0b10)
        },
        forCredit: forCredit !== 0,
        id: Math.random()
      })
    }
  }
  return plan
}

export function toSearchParams (plan: AcademicPlan): URLSearchParams {
  return new URLSearchParams({
    year: plan.startYear,
    department: plan.departmentCode,
    major_name: plan.majorName,
    major: plan.majorCode,
    cip: plan.cipCode,
    college: plan.collegeCode,
    degree: plan.degreeType,
    terms: String(plan.years.length * 3),
    courses: JSON.stringify(
      plan.years.flatMap((year, i) =>
        year.flatMap((term, j) =>
          term.map(
            (course): UrlCourseJson => [
              course.title,
              +course.units,
              (+course.requirement.college << 1) | +course.requirement.major,
              i * 3 + j,
              +course.forCredit
            ]
          )
        )
      )
    )
  })
}
