All produced HTML files are entirely self-contained and can be opened in the
browser and uploaded anywhere.

## Curriculum diffs

Requires `files/prereqs_fa12.csv` and `files/academic_plans_fa12.csv`. Uses Julia, Python, Deno. Produces `reports/output/academic-plan-diffs.html`.

```sh
$ make academic-plan-diffs
```

## Prerequisite diffs

Requires `files/prereqs_fa12.csv`. Uses Python. Produces `reports/output/prereq-diffs.html`.

```sh
$ make prereq-diffs
```

## Prerequisite diff timeline

Requires `files/prereqs_fa12.csv`. Uses Python. Produces `reports/output/prereq-timeline.html`.

```sh
$ make prereq-timeline
```

## GE units by college

Requires `files/academic_plans_fa12.csv` and `files/isis_major_code_list.xlsx - Major Codes.csv`. Uses Python. Produces `reports/output/college-ge-units.html`.

```sh
$ make college-ge-units
```
