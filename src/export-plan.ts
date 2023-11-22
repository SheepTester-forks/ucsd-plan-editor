import { CsvRows } from './util/csv.ts'
import { Prereqs } from './util/Prereqs.ts'
import { AcademicPlan } from './types.ts'

const UNIVERSITY_NAME = 'University of California, San Diego'
const TERM_TYPE = 'Quarter'

export function toUcsdPlan (plan: AcademicPlan): CsvRows {
  return {
    rows: [
      [
        'Department',
        'Major',
        'College',
        'Course',
        'Units',
        'Course Type',
        'GE/Major Overlap',
        'Start Year',
        'Year Taken',
        'Quarter Taken',
        'Term Taken'
      ],
      ...plan.years.flatMap((year, i) =>
        year.flatMap((term, j) =>
          term.map(course => [
            plan.departmentCode,
            plan.majorCode,
            plan.collegeCode,
            course.title,
            String(+course.units),
            course.requirement.major ? 'MAJOR' : 'COLLEGE',
            course.requirement.major && course.requirement.college ? 'Y' : 'N',
            String(+plan.startYear),
            String(i + 1),
            String(j + 1),
            'TODO: Term code'
          ])
        )
      )
    ],
    columns: 11
  }
}
const COURSE_HEADER = [
  'Course ID',
  'Course Name',
  'Prefix',
  'Number',
  'Prerequisites',
  'Corequisites',
  'Strict-Corequisites',
  'Credit Hours',
  'Institution',
  'Canonical Name',
  'Term'
]
export function toCurrAnalyticsPlan (
  plan: AcademicPlan,
  _prereqs: Prereqs
): CsvRows {
  const courses = plan.years.flatMap((year, yearIndex) =>
    year.flatMap((term, termIndex) =>
      term.map(course => ({ ...course, term: yearIndex * 3 + termIndex + 1 }))
    )
  )
  const courseIdMap = new Map(
    courses.map((course, i) => [course, String(i + 1)])
  )
  const majorCourses: string[][] = []
  const collegeCourses: string[][] = []
  for (const course of courses) {
    const courseCode = course.title.match(/^([A-Z]+) (\d+)$/)
    const row = [
      courseIdMap.get(course)!,
      course.title,
      courseCode?.[1] ?? '',
      courseCode?.[2] ?? '',
      'TODO: Prereqs',
      '', // Coreqs aren't supported
      '',
      String(+course.units),
      '',
      '',
      String(course.term)
    ]
    if (course.requirement.major) {
      majorCourses.push(row)
    } else {
      collegeCourses.push(row)
    }
  }
  const rows: string[][] = [
    ['Curriculum', `${plan.startYear} ${plan.majorCode}-${plan.majorName}`],
    ['Degree Plan', `${plan.majorCode}/${plan.collegeName}`],
    ['Institution', UNIVERSITY_NAME],
    ['Degree Type', plan.degreeType],
    ['System Type', TERM_TYPE],
    ['CIP', plan.cipCode],
    ['Courses'],
    COURSE_HEADER,
    ...majorCourses,
    ['Additional Courses'],
    COURSE_HEADER,
    ...collegeCourses
  ]
  return { rows, columns: 11 }
}
