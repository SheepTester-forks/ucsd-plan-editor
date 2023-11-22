# Academic plan creator (plan editor)

_2023 January 26 to April 6. [App](https://educationalinnovation.ucsd.edu/_files/plan-editor.html)._

Task: create a GUI for entering in plans, with the same format as [plans.ucsd.edu](https://plans.ucsd.edu/), that has autocompletion for course codes, a sidebar listing the prereqs for each course, and the ability to export the plan for Curricular Analytics.

UCSD already has [degree-planner.ucsd.edu](https://academicaffairs.ucsd.edu/sso/degree-planner/), but there are some nicer features in this one, like prereq checking.

<!-- Since we were waiting on fixing Tableau permissions and 2-year transfer plans, I didn't have much else to work on, so I spent perhaps a quarter on this. -->

Unfinished.

Files:

- reports/plan-editor-template.html: CSS.
- reports/plan-editor.tsx: entry point.
- reports/plan-editor/components/App.tsx: the top-level component of the web app.
  - reports/plan-editor/components/Metadata.tsx: metadata (e.g. the major code) for a plan, shown above the schedule.
    - reports/plan-editor/components/MetadataField.tsx: an input field in the metadata section.
  - reports/plan-editor/components/Editor.tsx: the schedule, taking up most of the screen next to the sidebar.
    - reports/plan-editor/components/Year.tsx: a year in the schedule.
      - reports/plan-editor/components/Term.tsx: a quarter in a year.
        - reports/plan-editor/components/PlanCourse.tsx: a course in the plan.
          - reports/plan-editor/components/CourseOptions.tsx: a dialog for editing course details, such as whether it satisfies a GE or major requirements, and listing warnings and errors about the course.
  - reports/plan-editor/components/PrereqSidebar.tsx: the sidebar.
    - reports/plan-editor/components/PrereqCheck.tsx: in the sidebar, lists the prerequisites for a course and alerts whether any are missing.
    - reports/plan-editor/components/CustomCourse.tsx: a custom course entry in the sidebar.
  - reports/plan-editor/components/RemoveZone.tsx: a visual red zone that appears while dragging a course to let you delete a course.
- reports/plan-editor/drag-drop.ts: defines types relating to dragging courses.
- reports/plan-editor/export-plan.ts: defines functions that export plans to various formats.
- reports/plan-editor/types.ts: defines how a plan is represented as a JavaScript object.
- reports/plan-editor/components/Toggle.tsx: unused toggle switch from the prereq tree.
- reports/plan-editor/save-to-url.ts: handled saving and loading a plan and options from the URL.
- reports/util/local-storage.ts: a getter for the `localStorage` object, since accessing it directly could throw errors in incognito mode in some browsers.
- reports/plan-editor/README.md: details the component hierarchy listed above.

## Development (plan diff, prereq tree, and plan editor)

```sh
# Build
$ yarn build

# Start development server
$ yarn dev
```
