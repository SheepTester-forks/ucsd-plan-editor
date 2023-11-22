all: tableau academic-plan-diffs prereq-diffs prereq-timeline college-ge-units prereq-tree plan-editor plan-editor-index flagged-issues
dev: all reports/output/prereqs.js reports/output/courses_by_major.js

year-start = 2015
year = 2023
prereq-term = FA23
# Make sure to update the file paths in university.py as well
prereqs = files/prereqs_fa23.csv
plans = files/academic_plans_fa23.csv
majors = files/isis_major_code_list.csv

# Reports

tableau: files/metrics_fa12_py.csv files/courses_fa12_py.csv files/course_overlap_py.csv files/curricula_index.csv
academic-plan-diffs: reports/output/academic-plan-diffs.html
prereq-diffs: reports/output/prereq-diffs.html
prereq-timeline: reports/output/prereq-timeline.html
college-ge-units: reports/output/college-ge-units.html
prereq-tree: reports/output/prereq-tree.html
plan-editor: reports/output/plan-editor.html
plan-editor-index: reports/output/plan-editor-index.html
seats: reports/output/seats.html
flagged-issues: files/flagged_issues.html

# Clean

clean:
	rm -f reports/output/*.js reports/output/*.json reports/output/*.html
	rm -rf files/prereqs/ files/plans/
	rm -f files/metrics_fa12_py.csv files/courses_fa12_py.csv files/course_overlap_py.csv files/curricula_index.csv
	rm -f courses_req_by_majors.json

# make split
split: files/prereqs/.done files/plans/.done

files/prereqs/.done: $(prereqs)
	python3 split_csv.py prereqs $(prereqs)

files/plans/.done: $(plans)
	python3 split_csv.py plans $(plans)

# Tableau

files/metrics_fa12_py.csv: plan_metrics.py files/prereqs/.done files/plans/.done
	python3 plan_metrics.py

files/courses_fa12_py.csv: course_metrics.py files/prereqs/.done files/plans/.done
	python3 course_metrics.py

files/course_overlap_py.csv: course_overlap.py files/plans/.done
	python3 course_overlap.py

files/curricula_index.csv: curricula_index.py files/uploaded*.yml
	python3 curricula_index.py $(year-start) $(year) > files/curricula_index.csv

# Plan diffs

reports/output/academic-plan-diffs.json: files/metrics_fa12_py.csv diff_plan.py files/plans/.done $(majors)
	python3 diff_plan.py $(year-start) $(year) > reports/output/academic-plan-diffs.json

reports/output/academic-plan-diffs.js: reports/output/academic-plan-diffs.json
	echo 'window.DIFFS =' > reports/output/academic-plan-diffs.js
	cat reports/output/academic-plan-diffs.json >> reports/output/academic-plan-diffs.js

reports/output/plan-diffs.js: reports/plan-diffs.tsx
	deno bundle reports/plan-diffs.tsx -- reports/output/plan-diffs.js

reports/output/academic-plan-diffs.html: reports/plan-diffs-template.html reports/output/academic-plan-diffs.json reports/output/plan-diffs.js
	head -n -4 < reports/plan-diffs-template.html > reports/output/academic-plan-diffs.html
	echo '<script id="diffs" type="application/json">' >> reports/output/academic-plan-diffs.html
	cat reports/output/academic-plan-diffs.json >> reports/output/academic-plan-diffs.html
	echo '</script>' >> reports/output/academic-plan-diffs.html
	echo '<script type="module">' >> reports/output/academic-plan-diffs.html
	cat reports/output/plan-diffs.js >> reports/output/academic-plan-diffs.html
	echo '</script></body></html>' >> reports/output/academic-plan-diffs.html

# Prereq diffs

reports/output/prereq-diffs-fragment.html: diff_prereqs.py files/prereqs/.done
	python3 diff_prereqs.py > reports/output/prereq-diffs-fragment.html

reports/output/prereq-diffs.html: reports/prereq-diffs-template.html reports/output/prereq-diffs-fragment.html
	head -n -1 < reports/prereq-diffs-template.html > reports/output/prereq-diffs.html
	cat reports/output/prereq-diffs-fragment.html >> reports/output/prereq-diffs.html
	echo '</html>' >> reports/output/prereq-diffs.html

# Prereq timeline

reports/output/prereq-timeline-fragment.html: diff_prereqs.py files/prereqs/.done
	python3 diff_prereqs.py timeline > reports/output/prereq-timeline-fragment.html

reports/output/prereq-timeline.html: reports/prereq-timeline-template.html reports/output/prereq-timeline-fragment.html
	head -n -1 < reports/prereq-timeline-template.html > reports/output/prereq-timeline.html
	cat reports/output/prereq-timeline-fragment.html >> reports/output/prereq-timeline.html
	echo '</html>' >> reports/output/prereq-timeline.html

# College GEs

reports/output/college-ge-units-fragment.html: college_ges.py files/plans/.done $(majors)
	python3 college_ges.py $(year) html > reports/output/college-ge-units-fragment.html

reports/output/college-ge-units.html: reports/college-ge-template.html reports/output/college-ge-units-fragment.html
	head -n -2 < reports/college-ge-template.html > reports/output/college-ge-units.html
	cat reports/output/college-ge-units-fragment.html >> reports/output/college-ge-units.html
	echo '</body></html>' >> reports/output/college-ge-units.html

# Prereq tree

reports/output/prereqs.json: dump_prereqs.py files/prereqs/.done
	python3 dump_prereqs.py $(prereq-term)

reports/output/prereqs.js: reports/output/prereqs.json
	echo 'window.PREREQS =' > reports/output/prereqs.js
	cat reports/output/prereqs.json >> reports/output/prereqs.js

reports/output/prereq-tree.js: reports/prereq-tree.tsx
	deno bundle reports/prereq-tree.tsx -- reports/output/prereq-tree.js

reports/output/prereq-tree.html: reports/prereq-tree-template.html reports/output/prereq-tree.js reports/output/prereqs.json
	head -n -4 < reports/prereq-tree-template.html > reports/output/prereq-tree.html
	echo '<script id="prereqs" type="application/json">' >> reports/output/prereq-tree.html
	cat reports/output/prereqs.json >> reports/output/prereq-tree.html
	echo '</script>' >> reports/output/prereq-tree.html
	echo '<script type="module">' >> reports/output/prereq-tree.html
	cat reports/output/prereq-tree.js >> reports/output/prereq-tree.html
	echo '</script></body></html>' >> reports/output/prereq-tree.html

# Plan editor

reports/output/plan-editor.js: reports/plan-editor.tsx
	deno bundle reports/plan-editor.tsx -- reports/output/plan-editor.js

reports/output/plan-editor.html: reports/plan-editor-template.html reports/output/plan-editor.js reports/output/prereqs.json
	head -n -4 < reports/plan-editor-template.html > reports/output/plan-editor.html
	echo '<script id="prereqs" type="application/json">' >> reports/output/plan-editor.html
	cat reports/output/prereqs.json >> reports/output/plan-editor.html
	echo '</script>' >> reports/output/plan-editor.html
	echo '<script type="module">' >> reports/output/plan-editor.html
	cat reports/output/plan-editor.js >> reports/output/plan-editor.html
	echo '</script></body></html>' >> reports/output/plan-editor.html

# Plan editor index

reports/output/plan-editor-index-fragment.html: dump_plans.py files/plans/.done
	python3 dump_plans.py $(year) html > reports/output/plan-editor-index-fragment.html

reports/output/plan-editor-index.html: reports/plan-editor-index-template.html reports/output/plan-editor-index-fragment.html
	head -n -1 < reports/plan-editor-index-template.html > reports/output/plan-editor-index.html
	cat reports/output/plan-editor-index-fragment.html >> reports/output/plan-editor-index.html
	echo '</html>' >> reports/output/plan-editor-index.html

# Seats (unused)

courses_req_by_majors.json: courses_req_by_majors.py
	python3 courses_req_by_majors.py $(year) json | prettier --parser=json --no-config > courses_req_by_majors.json

reports/output/courses_by_major.js: courses_req_by_majors.json
	echo 'window.COURSES_BY_MAJOR =' > reports/output/courses_by_major.js
	cat courses_req_by_majors.json >> reports/output/courses_by_major.js

reports/output/seats.js: reports/plan-editor.tsx
	deno bundle reports/seats.tsx -- reports/output/seats.js

reports/output/seats.html: reports/seats-template.html courses_req_by_majors.json reports/output/seats.js
	head -n -4 < reports/seats-template.html > reports/output/seats.html
	echo '<script id="courses_by_major" type="application/json">' >> reports/output/seats.html
	cat courses_req_by_majors.json >> reports/output/seats.html
	echo '</script>' >> reports/output/seats.html
	echo '<script type="module">' >> reports/output/seats.html
	cat reports/output/seats.js >> reports/output/seats.html
	echo '</script></body></html>' >> reports/output/seats.html

# Flagged issues

units_per_course.json: units_per_course.py
	python3 units_per_course.py json > units_per_course.json

files/flagged_issues.html: flag_issues.py units_per_course.json
	python3 flag_issues.py $(year) > files/flagged_issues.html
