/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { Metadata } from '../types.ts'
import { MetadataField } from './MetadataField.tsx'

export const colleges: Record<string, string> = {
  RE: 'Revelle',
  MU: 'Muir',
  TH: 'Marshall',
  WA: 'Warren',
  FI: 'ERC',
  SI: 'Sixth',
  SN: 'Seventh'
}
const degreeTypes = { BA: 'BA', BS: 'BS' }

export type MetadataProps = {
  plan: Metadata
  onPlan: (change: Partial<Metadata>) => void
}
/**
 * The plan metadata at the top of the plan editor. This includes text fields
 * for the major code and college.
 */
export function Metadata ({ plan, onPlan }: MetadataProps) {
  return (
    <div class='metadata'>
      <MetadataField
        property='departmentCode'
        plan={plan}
        onPlan={onPlan}
        placeholder='CSE'
      >
        Dept. Code
      </MetadataField>
      <MetadataField
        property='majorCode'
        plan={plan}
        onPlan={onPlan}
        placeholder='CS25'
      >
        ISIS Code
      </MetadataField>
      <MetadataField
        property='majorName'
        plan={plan}
        onPlan={onPlan}
        placeholder='Computer Engineering'
        class='lengthy'
      >
        Major Name
      </MetadataField>
      <MetadataField
        property='cipCode'
        placeholder='14.0901'
        plan={plan}
        onPlan={onPlan}
      >
        CIP Code
      </MetadataField>
      <MetadataField
        property='degreeType'
        plan={plan}
        onPlan={onPlan}
        values={degreeTypes}
      >
        Degree Type
      </MetadataField>
      <MetadataField
        property='collegeCode'
        plan={plan}
        onPlan={onPlan}
        values={colleges}
      >
        College
      </MetadataField>
      <MetadataField
        property='startYear'
        plan={plan}
        onPlan={onPlan}
        placeholder={String(new Date().getFullYear())}
      >
        Entering Year
      </MetadataField>
    </div>
  )
}
