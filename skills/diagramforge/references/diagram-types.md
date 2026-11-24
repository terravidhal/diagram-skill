# Diagram types

One section per layout grammar. Read only the chosen type, plus
[`connectors.md`](connectors.md) and [`layout.md`](layout.md). The examples are
patterns for the body of `assets/template.html`, not full files.

A note on the word **budget**: the global budget is nine nodes and twelve edges. The
per-type row tightens or relaxes it for that grammar. It never relaxes the connector
rules or the accent limit.

---

## 1. Architecture {#architecture}

**Choose if** the reader needs one snapshot of components, stores, external systems,
trust boundaries, and the main path between them. Not for ordered method calls
(sequence) or decision logic (flowchart).

**Layout** Group by tier or trust boundary. Hold one direction: left → right for
request paths, top → bottom for stacks. Zones are drawn first, then edges, then nodes.
Place the primary store at the end of the main path. Put external systems outside the
main zone. One focal node, usually the service where the story turns.

**Budget** 9 nodes, 12 edges, 3 flat zones, 2 accents. Above four tiers, split.

**Anti-patterns** Every box accented; a zone with one node; a diagonal arrow across a
zone; a store drawn inside a subnet that does not contain it; a legend inside the
canvas; an architecture that is really a deployment diagram with no hosts.

**Example** Browser → API gateway → checkout service → Redis / Postgres, with a
payment provider outside a dashed `PAYMENT BOUNDARY` zone and a webhook worker below.
Label the main edge with the protocol, not with "connects to".

---

## 2. Flowchart {#flowchart}

**Choose if** the reader must follow a decision: if/else, guard, retry, cancellation,
terminal success or failure.

**Layout** Top → bottom by default. One entry, one or two exits. Decisions are
diamonds with exactly two labelled out-edges (`yes` / `no`, or a guard). Put the happy
path in the centre column and failures to one side. Merge branches as soon as they
converge. A loop returns to the decision, not to the start.

**Budget** 9 nodes, 12 edges, 2 terminal outcomes, 1 loop back-edge. A third branch
is a second figure.

**Anti-patterns** Decision diamonds with four unlabelled exits; "yes" labels missing;
a loop that points backwards in time from a later step to an earlier one without a
clear return port; process boxes disguised as decisions; a terminal state with an
outgoing edge.

**Example** Request → `Authenticated?`. Yes → load cart; no → refresh token → retry
once → `Authenticated?`. Failure → `401`. Highlight the retry or the failure, not both.

---

## 3. Sequence {#sequence}

**Choose if** order and direction of messages between actors is the point: request /
response, cache miss, auth refresh, async event, incident reconstruction.

**Layout** Actors in a row at the top, lifelines descending. Time flows down. Calls are
solid; returns are dashed with a filled head; fire-and-forget is dashed with an open
head. Activation bars show when an actor holds control and must close. Put branches in
a labelled `alt` frame, not in free-floating arrow clusters. Self-messages are a short
U-turn with the label to the right.

**Budget** 5 lifelines, 12 messages, 1 fragment, 2 regions inside it, 2 accents.

**Anti-patterns** Upward arrows; a return drawn solid; an open head on a return; a
lifeline that ends before its last message; labels sitting on another lifeline;
nested `alt` frames; a fragment that contains no message.

**Example** Client → API `POST /checkout`; API → Redis `GET cart`; Redis --> API
`miss`; API → Postgres `SELECT`; Postgres --> API `rows`; API --> Client `201`.
Accent only the `201`.

---

## 4. State machine {#state-machine}

**Choose if** one subject moves through named states, with transitions, guards, waits,
resume, and terminal outcomes. Not for steps that always run in the same order.

**Layout** States are rounded rectangles; the initial state is a small filled dot; a
terminal state is a double ring or a filled dot inside a ring. Transitions are
orthogonal and labelled with `event [guard] / action`. Keep the main lifecycle on one
axis and place error or cancelled states in a side rail. Self-transitions are a small
loop on the state's edge.

**Budget** 8 states, 12 transitions, 1 initial, 1–2 terminal, 1 accent on the critical
transition.

**Anti-patterns** A terminal state with outgoing transitions; unlabelled transitions;
mixing a state machine with a flowchart's process boxes; a "state" that is actually an
action; a transition that crosses three other states.

**Example** `idle → validating → authorized → captured`, with `declined`, `expired`,
and `cancelled` in a side rail. Accent the `captured` transition.

---

## 5. ERD {#erd}

**Choose if** entities, attributes, keys, and cardinality are the subject. For physical
tables with SQL types and indexes, use `db-schema`.

**Layout** Entity boxes with a header and attribute rows. Keys first, then required
fields, then optional. Relationship lines leave the entity edge and join at a row or
header. Label cardinality at each end (`1`, `N`, `0..1`). Keep the relationship lines
short and orthogonal; put the strongest entity in the centre.

**Budget** 6 entities, 8 relationships, 5 fields per entity maximum, 1 accent on the
central entity.

**Anti-patterns** Crow's-foot glyphs with no cardinality label; a join table drawn as a
relationship diamond; every field shown; a foreign key with no matching primary key;
relationship lines that pass through an entity.

**Example** `customers 1—N orders 1—N payments`, with `orders.customer_id` and
`payments.order_id` visibly marked `FK` and the central table accented.

---

## 6. Dependency graph {#dependency-graph}

**Choose if** fan-in, fan-out, or cycles are the story, and a tree would hide a second
parent. Not for containment.

**Layout** Put the most depended-on node in the centre or at the bottom of a layered
DAG. Direction is "depends on" or "is used by"; write the direction once in the
eyebrow or legend. Layer by depth when possible. An arc diagram (nodes on one axis,
relationships as arcs) is a variant for long skip-spans, not a second type.

**Budget** 9 nodes, 12 edges, 1–2 cycles maximum, 1 accent on the node with the highest
fan-in or on a cycle.

**Anti-patterns** A tree with hidden back-edges; crossing lines without a hop; a
dependency graph that is really a call sequence; every edge the same weight; a cycle
drawn as a straight line back through the graph.

**Example** `web → api → auth`, `api → billing`, `billing → auth`, `worker → api`.
Accent `auth` to show the convergence.

---

## 7. Tree {#tree}

**Choose if** each child has exactly one parent: decomposition, ownership, taxonomy,
file structure, decision tree without loops.

**Layout** Root at the top (or left), one direction only. Siblings share a baseline;
level gaps are consistent. Parent → child edges are elbows or straight vertical lines.
A collapsed cluster is one node labelled `×N`, not five tiny leaves.

**Budget** 12 nodes, 4 levels, 1 accent on the root or the changed branch.

**Anti-patterns** A child with two parents; uneven sibling gaps; level labels in
different sizes; a "tree" with a cross-link; a hierarchy four levels deep at 9px text.

**Example** Product → three capabilities → two features each, with one feature
accented because it is the subject.

---

## 8. Quadrant {#quadrant}

**Choose if** position on two axes carries the decision: effort vs impact, cost vs
value, risk vs reach, build vs buy.

**Layout** Two axes, four labelled quadrants, items placed as dots or short labels.
Axis names sit at the ends, horizontal; quadrant names in the corners in `soft`. One
focal item gets a larger dot and an accent ring. If items overlap, offset labels with
a thin leader, not with boxes.

**Budget** 9 items, 2 axes, 4 quadrant labels, 1 accent item.

**Anti-patterns** Unlabelled axes; invented numeric scores; a third dimension encoded
only by colour; every dot accented; a legend that repeats the axis labels.

**Example** Effort on x, impact on y. `Search`, `Cache`, `Auth`, `Billing`, `Reports`,
`Sync`, `Mobile`, `Exports`. Accent `Search` as the next bet.

---

## 9. Timeline {#timeline}

**Choose if** dated events, an incident, a release history, or a project history is
the subject. Not for overlapping durations (Gantt) or a causal chain (flowchart).

**Layout** One horizontal axis; event dots on the line; cards alternate above and
below with a short stem. Dates in the eyebrow role; event names in the node role. Keep
the time axis proportional when the intervals matter, ordinal when only order matters;
say which in the caption.

**Budget** 8 events, 1 accent event, 2 annotations.

**Anti-patterns** Cards that collide with the axis; a date scale that is secretly
ordinal; every event the same weight; vertical text; an arrowhead implying a single
direction when the events are independent.

**Example** Six incident events from `09:02 deploy` to `09:48 closed`, with the
rollback accented. One sentence under the title says the axis is wall-clock time.

---

## 10. Before/after delta {#before-after-delta}

**Choose if** the reader must see what structurally changed between two synchronised
states. Not for two unrelated architectures side by side.

**Layout** Two panels with the same coordinate system, or one canvas with a shared
grid and a change ledger. Add, remove, move, and keep are distinct marks: solid accent
for added, dashed for removed, muted for unchanged, a small arrow for moved. The ledger
is a short list at the bottom or right: `added`, `removed`, `merged`, `kept`.

**Budget** 8 nodes per panel, 1 ledger, 2 accents, 2 annotations.

**Anti-patterns** Two panels with different scales; a "before" that is a straw man;
colour-only change encoding; no ledger; moving boxes placed at random.

**Example** v1 monolith → v2 services, with `API` split into `Gateway` + `Orders` +
`Billing`; added nodes accented, the monolith box dashed, and a four-line ledger.

---

## 11. Data flow {#data-flow}

**Choose if** data moves through transforms, stores, and consumers, and the reader
needs to know what is produced where. Not for a generic architecture with no data.

**Layout** Left → right: sources, transforms, stores, consumers. Label edges with the
artifact or protocol, not "data". Stores use the store treatment. Sensitive data gets a
small tag and a legend entry, never a second hue with no label. Draw the main path on
the centre line and side inputs above or below.

**Budget** 9 nodes, 12 edges, 3 stores, 2 accents, 2 annotations.

**Anti-patterns** Every edge labelled "data"; a transform with no output; a store with
no consumer; a pipe that forks without a reason; a data-flow diagram that is really a
deployment diagram.

**Example** `Webhook → ingest → raw → normalize → orders → warehouse`, with `PII` tags
on two edges and the normalize step accented.

---

## 12. Layer stack {#layer-stack}

**Choose if** abstraction levels or responsibilities stack, and the direction of
dependency matters: presentation / domain / data, or governance / platform / workload.

**Layout** Horizontal bands, equal width, ordered top → bottom. Each band has a label on
the left or inside at the top-left, and one or two example components. An arrow on the
side shows allowed dependency direction. A skipped layer is a dashed band, not an
empty gap.

**Budget** 6 layers, 2 components per layer, 1 accent on the layer that changed, 1
direction arrow.

**Anti-patterns** Bands with different widths for no reason; a layer with a logo and no
name; a stack that is actually a containment diagram; an arrow that points both ways
with no rule.

**Example** `Experience`, `API`, `Domain`, `Data`, `Infrastructure`, with one accent on
`Domain` and a side arrow "depends downward only".

---

## 13. Swimlane {#swimlane}

**Choose if** a process crosses roles, teams, or systems and the handoffs are the
story.

**Layout** Lanes are horizontal (roles as rows) or vertical (roles as columns); pick
one. Time flows left → right or top → bottom. A step sits in the lane of the actor who
owns it; a handoff is an edge that crosses a lane boundary. Label the handoff, not the
lane. Keep one process per figure.

**Budget** 5 lanes, 9 steps, 12 edges, 2 accents on the handoffs that matter.

**Anti-patterns** Steps floating between lanes; lane labels as logos; a swimlane that
is really a sequence with rows; every cross-lane edge accented; steps out of time order.

**Example** `Customer`, `Support`, `Billing`, `Platform`; the refund request moves
customer → support → billing → platform, with the approval handoff accented.

---

## 14. Service blueprint {#service-blueprint}

**Choose if** customer-visible actions and hidden backstage work must be read
together, across stages, with a line of visibility.

**Layout** Stages as columns. Rows: physical evidence, customer actions, frontstage,
line of visibility, backstage, support processes. The visibility line is a strong
horizontal rule with a label. Friction points are annotated above the customer row.
Keep the customer row sparse; the backstage carries the detail.

**Budget** 5 stages, 4 rows, 2 friction annotations, 1 accent on the critical
frontstage/backstage pair.

**Anti-patterns** A journey map with no visibility line; every row filled; backstage
steps that never connect to a customer action; friction marked only by colour.

**Example** `Discover → Choose → Pay → Receive → Support`, with the line of visibility
between frontstage and backstage and `Pay` accented.

---

## 15. Kanban {#kanban}

**Choose if** work-in-progress, columns, WIP limits, or blockers are the subject.

**Layout** Columns left → right, cards stacked. Column header carries the name and the
WIP limit (`Doing 3/4`). A blocked card gets a small `BLOCKED` tag and a different
outline, not only a colour. Show one swimlane only if the team split is the point.
Cards are 2–3 lines: title, owner or size, one status.

**Budget** 12 cards, 4 columns, 1 accent on the bottleneck column or the blocked card.

**Anti-patterns** A board with 25 cards; WIP limits as decoration; a blocked card
marked by red alone; every card the same width; a backlog column with no items.

**Example** `Backlog / Ready / Doing 3/4 / Review / Done`, with `Doing` accented and one
blocked card tagged `BLOCKED · waiting on API`.

---

## 16. User journey {#user-journey}

**Choose if** the lived experience across stages, including emotion and friction, is
the point.

**Layout** Stages as columns; rows for action, thought, emotion, opportunity. The
emotion row is a thin line with a dot per stage; label the low point. Friction points
are short annotations, at most two. Keep the customer's words in quotes; keep the
researcher's interpretation in a different role.

**Budget** 6 stages, 4 rows, 2 annotations, 1 accent on the low point.

**Anti-patterns** Invented quotes; a happy line with no evidence; every stage the same
weight; a journey that is really a feature list; an emotion chart with no labels.

**Example** `Discover → Compare → Buy → Set up → Use → Renew`, with a low emotion dot at
`Set up` and one annotation: "needs the invoice before the first value".

---

## 17. Gantt {#gantt}

**Choose if** tasks, phases, durations, dependencies, and milestones share a calendar.

**Layout** Rows are tasks, x is time. Bars show duration; a diamond is a milestone; a
thin arrow is a dependency. Group tasks by phase with a phase label in the left column.
Today is a vertical hairline, labelled once. Keep bar labels inside or immediately
right; never both.

**Budget** 12 rows, 4 phases, 3 dependencies, 1 accent on the critical path.

**Anti-patterns** Bars with no time scale; dependencies that cross the whole chart; a
milestone drawn as a bar; every row accented; dates in a legend instead of on the axis.

**Example** Four phases, ten tasks, two dependencies, one milestone `GA`; accent the
critical path from `Schema` to `GA`.

---

## 18. Deployment {#deployment}

**Choose if** where software runs matters: zones, hosts, artifacts, replicas, ports,
and the network path between them.

**Layout** Environment or zone containers first, then hosts, then artifacts. A host is
a box with a hostname and a port tag; an artifact is a small card inside it; replicas
are an `×N` badge, not N boxes. Show the ingress path and one egress path. Secrets and
volumes are tags, not separate boxes.

**Budget** 9 nodes, 3 zones, 12 edges, 2 accents on the public entry and the stateful
store.

**Anti-patterns** Cloud logos as nodes; a managed service drawn inside a subnet; one
box per replica; ports in a legend instead of on the node; a deployment diagram with no
hosts.

**Example** `Internet → LB → app ×3 → primary DB`, with `app` in a private subnet, the
DB in a data subnet, and the LB accented.

---

## 19. Network topology {#network-topology}

**Choose if** subnets, gateways, routes, and allowed or denied paths are the subject.

**Layout** Draw the network hierarchy with containment. Gateways sit on the boundary
they guard. Allowed paths are solid; denied paths are dashed and labelled `DENY` with a
symbol. Keep the internet at one edge and the protected asset at the other. Use CIDR
labels in the mono role.

**Budget** 9 nodes, 4 subnets, 3 boundaries, 2 accents on the protected asset and the
governing rule.

**Anti-patterns** A topology that is a logical architecture; a denied path in the same
style as an allowed one; CIDR labels in the title; a firewall drawn as a cloud.

**Example** `Internet → WAF → public subnet → app → private subnet → DB`, with one
dashed `DENY` from public to DB and the rule accented.

---

## 20. Data pipeline {#data-pipeline}

**Choose if** ingestion, quality tiers (raw / cleaned / modelled), lineage, or SLAs are
the story.

**Layout** Left → right stages; tiers as horizontal bands or labelled groups. Each
stage has an owner tag and a freshness or quality tag. Lineage edges carry the dataset
name. A failed or late stage is marked with a symbol and a word. Keep the main lineage
on the centre line.

**Budget** 9 nodes, 3 tiers, 12 edges, 2 accents on the failing stage and the consumer.

**Anti-patterns** Bronze/silver/gold as decoration; a pipeline with no consumer; a
lineage edge labelled "data"; a quality tier with no rule; a retry loop with no owner.

**Example** `Events → raw → validate → clean → model → dashboard`, with `validate`
accented and a `LATE 14m` tag on `model`.

---

## 21. Security boundaries {#security-boundaries}

**Choose if** trust zones, ingress/egress, controls, and the permitted path carry the
meaning.

**Layout** Nested or adjacent trust zones, each with a boundary label and a control
tag. Show the paved road as the solid accent path; forbidden paths are dashed with a
`DENY` label and a stop symbol. A control sits on the boundary it enforces, not inside
the asset it protects. Pair every zone with a one-line rule.

**Budget** 9 nodes, 3 trust zones, 2 controls, 2 accents on the paved road and the
control that gates it.

**Anti-patterns** A lock icon as the only control; a boundary with no rule; a forbidden
path in the accent colour; a control inside the protected box; colour-only risk.

**Example** `Client → edge control → app zone → data zone`, with the permitted path
accented and one `DENY` from app to data marked with a stop symbol.

---

## 22. Integration map {#integration-map}

**Choose if** sources, a core, and consumers are connected by APIs or events, and the
reader needs the integration surface.

**Layout** Sources on the left, core in the centre, consumers on the right. Label each
edge with the mechanism (`REST`, `webhook`, `event`, `batch`) and the direction. Group
by domain if there are many. The core is one node, not a mini architecture.

**Budget** 9 nodes, 12 edges, 2 accents on the core and the critical integration.

**Anti-patterns** A map that is a full architecture; unlabelled edges; bidirectional
arrows where one direction is obvious; a consumer with no source; a core split into
five boxes.

**Example** `CRM`, `Billing`, `Support` → `Integration core` → `Warehouse`, `Analytics`,
with `REST` and `event` labels and the core accented.

---

## 23. Database schema {#db-schema}

**Choose if** physical tables, SQL types, indexes, constraints, and column-level
foreign keys are the subject. For a conceptual model, use `erd`.

**Layout** Table cards with header, column name, type, and key marker. Group by domain
or schema. Draw foreign keys from column to column, not table to table. Indexes are a
small `IDX` tag on the column. Keep the widest table in the centre.

**Budget** 5 tables, 6 relationships, 8 columns per table maximum, 1 accent on the
table that changed.

**Anti-patterns** Every column of every table; types in a legend; a foreign key that
does not resolve; indexes as a separate list; an ERD with no types.

**Example** `orders(id PK, customer_id FK, status, total, created_at)`, `payments(id
PK, order_id FK, provider_ref, captured_at)`, with the FK edges column-to-column.

---

## 24. UML class {#uml-class}

**Choose if** classes, interfaces, inheritance, composition, or operations are the
subject.

**Layout** Class boxes with three compartments: name, attributes, operations. The
stereotype (`interface`, `abstract`) sits above the name. Inheritance is a hollow
triangle; composition is a filled diamond at the owner; association is a plain line
with cardinality. Put parents above children.

**Budget** 6 classes, 8 relationships, 5 members per compartment, 1 accent on the
polymorphic root.

**Anti-patterns** A class diagram with no operations; a filled triangle for
inheritance; composition and aggregation swapped; every attribute shown; a relationship
with no cardinality where it matters.

**Example** `PaymentMethod` (abstract) ← `Card`, `Transfer`; `Order` ◆— `OrderLine`
with `1..*`; accent `PaymentMethod`.

---

## 25. Org chart {#org-chart}

**Choose if** ownership, reporting lines, escalation, or routing between teams is the
subject.

**Layout** One root, children below, one direction. A dotted line is a secondary or
escalation relationship and must be labelled. Put the owner's role in the tag, the team
in the name, and the scope in the sublabel. Keep spans of control readable; collapse a
large team to `Team ×N`.

**Budget** 12 nodes, 4 levels, 1 dotted escalation, 1 accent on the team that owns the
decision.

**Anti-patterns** A matrix organisation forced into a tree; dotted lines with no label;
a photo or avatar where a role belongs; every team the same width; hidden vacancies.

**Example** `CTO → Platform, Product, Data`; `Platform → SRE, Runtime`; a dotted
`escalation` from `SRE` to `CTO`, with `Platform` accented.

---

## 26. Nested containment {#nested}

**Choose if** scopes inside scopes carry the meaning: quotas, authority, tenancy,
resource groups. A flat zone label would lie about the hierarchy.

**Layout** Rectangles inside rectangles with consistent insets (24px per level). Each
level has an eyebrow at the top-left and a fill that steps up inward. Siblings share one
axis. Label the innermost thing the reader must find. Do not use transforms to position
children; draw them in place.

**Budget** 4 levels, 3 siblings per level, 1 accent on the innermost changed scope.

**Anti-patterns** A flattened label `A · B · C`; different insets per level; a child
outside its parent; a nested diagram with no labels on the boundaries; more than four
levels.

**Example** `Organization → Workspace → Project → Environment`, each with a quota tag,
and `Environment` accented.

---

## 27. Venn {#venn}

**Choose if** overlap between two or three sets is the point, and the intersection is
the insight.

**Layout** Two or three circles or rounded blobs, sized honestly where possible. Label
each set outside the overlap; label intersections inside. Keep the diagram sparse; a
fourth set is a table. Use one accent for the intersection that matters.

**Budget** 3 sets, 3 pairwise intersections, 1 triple intersection, 1 accent.

**Anti-patterns** Four or more sets; a circle whose size lies about the count; every
region filled; labels outside the canvas; a Venn used for a process.

**Example** `Security`, `Reliability`, `Speed`; accent the triple intersection
`Governed fast path`; put one example in each region.

---

## 28. Capability map {#capability-map}

**Choose if** business capabilities, maturity, and ownership need one view.

**Layout** A grid of capability groups. Each group has a name, 2–4 capabilities, an
owner tag, and a maturity mark (`1–4` or `emerging / defined / managed / optimised`).
Maturity is text + a small bar, never colour alone. Keep the grid aligned.

**Budget** 9 capabilities, 4 groups, 2 accents on the gaps.

**Anti-patterns** A feature backlog in disguise; maturity as a traffic light only; an
owner per capability but no group; every cell the same size when importance differs.

**Example** `Acquire / Serve / Retain / Operate`, with `Serve` accented and two
capabilities marked `gap`.

---

## 29. Roadmap {#roadmap}

**Choose if** horizons, releases, milestones, and dependencies across time are the
subject. For task-level scheduling, use `gantt`.

**Layout** Horizons as columns (`Now / Next / Later`), initiatives as bars or cards.
A milestone is a diamond on the boundary. Dependencies are thin arrows. Keep the
uncertainty visible: `Later` items are outlined, not filled. One accent on the next
commitment.

**Budget** 9 initiatives, 3 horizons, 4 milestones, 1 accent.

**Anti-patterns** A Gantt with fake dates; every item in `Now`; dependencies that
cross three horizons; a roadmap with no outcome per item; a colour per team with no
legend.

**Example** `Now: SSO`, `Next: Billing v2`, `Later: Mobile`; accent `SSO`; one
dependency from `Billing v2` to `SSO`.

---

## 30. Git graph {#git-graph}

**Choose if** branch, merge, rebase, hotfix, or backport structure is the subject.

**Layout** Commits as dots on horizontal lanes; time left → right. A branch is a new
lane; a merge joins two lanes; a rebase is a replay, drawn as a new lane segment with a
label. Tag releases and hotfixes. Keep lanes in a stable order.

**Budget** 5 branches, 20 commits, 2 tags, 1 accent on the hotfix or the merge under
discussion.

**Anti-patterns** A commit list instead of a graph; a merge with no second parent; a
rebase drawn as a merge; every lane the same colour; unlabelled releases.

**Example** `main` plus `feature/checkout`, `hotfix/401`, `release/2.4`; the hotfix is
accented and the merge into `main` is labelled.

---

## 31. Loop / flywheel {#loop-flywheel}

**Choose if** a reinforcing cycle is the point: acquisition → activation → retention →
referral, or a build → measure → learn loop.

**Layout** Steps on a circle or rounded rectangle, clockwise. The last step points to
the first with a visibly stronger edge. A hub in the centre can hold the accumulating
state. Number the steps only if order matters. Keep the loop open enough for labels.

**Budget** 8 steps, 1 loop, 1 hub, 1 accent on the step that is the constraint.

**Anti-patterns** A circle of arrows with no labels; a loop that is not closed; a
decorative circular arrow; the hub holding a second process; every step accented.

**Example** `Acquire → Activate → Retain → Refer → Acquire`, with `Retain` accented as
the constraint and the centre labelled `Trust`.

---

## 32. Pyramid / funnel {#pyramid-funnel}

**Choose if** ranked hierarchy or conversion drop-off is the point.

**Layout** A pyramid for rank (top = smallest, highest), a funnel for conversion (top
= widest). Horizontal bands with a label and one number. Keep the drop between bands
explicit (`−18%`) rather than implied by area. One accent on the band that matters.

**Budget** 6 bands, 1 metric per band, 1 accent.

**Anti-patterns** A funnel whose areas lie about the numbers; a pyramid with no labels;
a conversion rate in a legend; every band a different colour; a 3D effect.

**Example** `Visits 100k → Sign-ups 24k → Activated 9k → Paid 2.1k`, with `Activated`
accented and the drop percentages on the right.

---

## 33. Bar chart {#bar}

**Choose if** categories must be compared on one measure, with one or two series.

**Layout** Horizontal bars when labels are long; vertical when time-like. Zero baseline
is mandatory. Sort by value unless the category order is meaningful. Label values at
the bar end; keep the axis hairline. A second series is a paired bar or a small
multiple, not a second colour with no legend.

**Budget** 8 bars, 2 series, 1 accent on the bar the reader should notice.

**Anti-patterns** A truncated axis; 3D bars; a rainbow palette; values in a separate
table; an accent on every bar; a pie chart with 12 slices instead.

**Example** Seven endpoints by p95 latency, sorted descending, the slowest accented,
values at the bar ends.

---

## 34. Line chart {#line}

**Choose if** a continuous trend over time, a change between exactly two states
(slopegraph), or rank movement (bump) is the point.

**Layout** Time on x, measure on y. One to five series; direct labels at the line ends,
not a floating legend. A slopegraph has two columns and lines between them; a bump
chart has rank on y and a line per entity. Mark one event with a vertical hairline if
it explains the change.

**Budget** 5 series, 12 points per series, 1 accent on the focal series, 1 annotation.

**Anti-patterns** A line per category with no labels; a smoothed curve that invents
data; a dual axis with no warning; an accent on every series; hiding the zero when the
measure is a count.

**Example** Error rate over 60 minutes, one accent on the rollback moment, direct label
`error rate` at the line end.

---

## 35. Radar chart {#radar}

**Choose if** 3–5 entities are scored across 3–5 criteria, and the shape of the profile
is the insight.

**Layout** A polygon per entity, semi-transparent fill, a labelled spoke per criterion.
Order criteria consistently. One focal series in accent; the others in `series-*`.
Include the numeric value at each vertex only if the reader needs it.

**Budget** 5 series, 5 criteria, 1 accent, 1 legend.

**Anti-patterns** More than five axes; overlapping fills with no legend; a radar for
data that is really a ranking; invented scores; every series accented.

**Example** Four vendors across `Security`, `Speed`, `Cost`, `Support`, `Fit`, with the
recommended vendor accented and the others in series colours.

---

## 36. Heatmap {#heatmap}

**Choose if** a matrix of intensity, with rows and columns, is the point.

**Layout** A grid with row and column labels; a value in each cell or a legend with
four steps. Use one hue ramp from `paper` to `accent`; the darkest cell is the focus.
Missing data is a hatched cell, not zero. Keep cells square or 4:3.

**Budget** 8 columns, 6 rows, 1 accent cell, 1 legend.

**Anti-patterns** A rainbow ramp; no legend; missing data drawn as zero; every cell
labelled when the pattern is the point; a heatmap for two columns.

**Example** Seven days × six endpoints, p95 latency, a four-step ramp, the worst cell
outlined and labelled.

---

## 37. Treemap {#treemap}

**Choose if** part-of-whole with relative sizes is the story and a pie would have too
many slices.

**Layout** Nested rectangles sized by value, grouped by category. Label the largest
cells directly; use a legend for the rest. Keep a minimum cell size; collapse the tail
into `Other`. Use one accent for the cell under discussion.

**Budget** 12 cells, 4 groups, 1 accent, 1 legend.

**Anti-patterns** 25 unreadable cells; area not proportional to value; a rainbow; labels
outside their cell; a treemap used for change over time.

**Example** Cloud spend by service, four groups, the largest service accented, the tail
collapsed to `Other 8%`.

---

## 38. Waterfall {#waterfall}

**Choose if** a start total is bridged to an end total by signed contributions: budget
bridge, headcount delta, latency budget, revenue walk.

**Layout** A running total. The first and last bars start at zero; the middle bars float
at the running total. Increases and decreases have distinct directions and labels
(`+`, `−`); never colour alone. Connect the end of one bar to the start of the next with
a thin hairline.

**Budget** 8 bars, 2 totals, 1 accent on the largest contribution.

**Anti-patterns** Middle bars starting at zero; a line chart that implies continuity;
signs missing; the final total not reconciling; every bar accented.

**Example** `p50 120ms → +DB 40 → +render 25 → −cache 30 → p95 155ms`, with the DB
contribution accented.

---

## 39. Fishbone {#fishbone}

**Choose if** causes of one observed effect must be grouped by category, and the
structure of the search matters.

**Layout** Effect at the head (right), spine to the left, bones at an angle with a
category label, causes as short labels on the bones. Group by a real taxonomy (people,
process, platform, data, policy). Mark the causes that are evidenced, guessed, or ruled
out with a symbol + word.

**Budget** 6 bones, 3 causes per bone, 2 accents on the leading causes.

**Anti-patterns** A mind map without a spine; causes with no evidence status; more
than six bones; a bone with one vague word; every cause the same weight.

**Example** `Checkout latency` as the effect; bones `Traffic`, `Database`, `Cache`,
`Deploy`, `Client`, `Policy`; evidence tags `confirmed` / `suspected`.

---

## 40. Requirement traceability {#requirement-traceability}

**Choose if** requirements, design elements, and tests must be linked, and gaps are the
point.

**Layout** Three columns (`Requirement`, `Design`, `Test`) with stable IDs. Lines link
IDs; a gap is a visible empty slot with a `GAP` tag, not a missing row. Keep the
columns aligned; one line per link. A requirement with two tests can fan out, but the
ports must be distinct.

**Budget** 4 requirements, 3 design elements, 4 tests, 2 gaps, 1 accent on the highest
risk gap.

**Anti-patterns** A spreadsheet screenshot; missing rows instead of explicit gaps;
lines with no IDs; a test linked to no requirement; every link accented.

**Example** `R-01 → D-02 → T-01, T-03`, `R-02 → D-01 → GAP`, `R-03 → GAP`, with the
`R-02` gap accented.
