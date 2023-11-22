/** @jsxImportSource preact */
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import { render } from 'preact'
import { App } from './plan-editor/components/App.tsx'
import { fromSearchParams } from './plan-editor/save-to-url.ts'

render(
  <App
    prereqs={
      JSON.parse(document.getElementById('prereqs')?.textContent ?? 'null') ||
      // deno-lint-ignore no-explicit-any
      (window as any)['PREREQS']
    }
    initPlan={fromSearchParams(new URL(window.location.href).searchParams)}
    mode='advisor'
  />,
  document.getElementById('root')!
)
