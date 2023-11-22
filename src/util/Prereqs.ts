export type CourseCode = string
export type Prereqs = Record<CourseCode, CourseCode[][]>

export function cleanCourseCode (userCourseCode: string): CourseCode | string {
  const match = userCourseCode
    .toUpperCase()
    .match(/^\s*([A-Z]+)\s*(\d+[A-Z]*)\s*$/)
  if (!match) {
    return userCourseCode.trim().replaceAll(/\s+/g, ' ')
  }
  return `${match[1]} ${match[2]}`
}
