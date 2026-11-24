# Type catalogue

Forty layout grammars. A type is a way of arranging meaning, not a decoration. Choose
by the question the reader has, then open the type's section in
[`diagram-types.md`](diagram-types.md).

Priority is delivery order, not quality: **P0** ships with the skill, **P1** is the
next wave, **P2** is documented backlog. The budget in the last column is the type's
specific ceiling (nodes, lifelines, lanes, rows, or cells); the universal ceiling is
still nine nodes unless the type is a list or a chart.

## Families

| Family | Types |
|---|---|
| Systems | architecture, deployment, network-topology, security-boundaries, integration-map |
| Flow and time | flowchart, sequence, state-machine, timeline, swimlane, user-journey, gantt, roadmap, git-graph, loop-flywheel, service-blueprint |
| Structure | erd, db-schema, uml-class, tree, org-chart, nested, layer-stack, venn, dependency-graph |
| Data | data-flow, data-pipeline, capability-map, requirement-traceability |
| Analysis | quadrant, before-after-delta, fishbone, pyramid-funnel, kanban |
| Quantitative | bar, line, radar, heatmap, treemap, waterfall |

## The forty

| # | Type | Slug | Choose if… | Prio | Max |
|---|---|---|---|---|---|
| 1 | Architecture | `architecture` | components, services, stores, boundaries, one main flow | P0 | 9 |
| 2 | Flowchart | `flowchart` | decisions, branches, guards, retries, terminal outcomes | P0 | 9 |
| 3 | Sequence | `sequence` | ordered messages between actors, returns, async | P0 | 5 lifelines |
| 4 | State machine | `state-machine` | states, transitions, guards, resume, terminal states | P0 | 8 |
| 5 | ERD | `erd` | entities, relationships, cardinality, keys | P0 | 6 |
| 6 | Dependency graph | `dependency-graph` | fan-in, fan-out, cycles a tree cannot express | P0 | 9 |
| 7 | Tree | `tree` | one parent per child, decomposition, ownership | P0 | 12 |
| 8 | Quadrant | `quadrant` | position on two axes, prioritisation, portfolio | P0 | 9 items |
| 9 | Timeline | `timeline` | dated events, incidents, release history | P0 | 8 |
| 10 | Before/after delta | `before-after-delta` | structural change between two states, with a ledger | P0 | 8 + 8 |
| 11 | Data flow | `data-flow` | sources → transforms → stores → consumers | P0 | 9 |
| 12 | Layer stack | `layer-stack` | abstraction levels, responsibilities, dependency direction | P0 | 6 |
| 13 | Swimlane | `swimlane` | handoffs across roles, phases, or systems | P1 | 5 lanes |
| 14 | Service blueprint | `service-blueprint` | customer actions vs hidden work, line of visibility | P1 | 5 stages |
| 15 | Kanban | `kanban` | work in progress, columns, WIP limits, blockers | P1 | 12 cards |
| 16 | User journey | `user-journey` | stages experienced, emotion, friction, opportunity | P1 | 6 stages |
| 17 | Gantt | `gantt` | tasks, phases, durations, dependencies, milestones | P1 | 12 rows |
| 18 | Deployment | `deployment` | zones, hosts, artifacts, replicas, ports | P1 | 9 |
| 19 | Network topology | `network-topology` | subnets, gateways, allowed and denied paths | P1 | 9 |
| 20 | Data pipeline | `data-pipeline` | ingestion, quality tiers, lineage, SLAs | P1 | 9 |
| 21 | Security boundaries | `security-boundaries` | trust zones, ingress/egress, controls, paved road | P1 | 9 |
| 22 | Integration map | `integration-map` | sources → core → consumers, APIs, events | P1 | 9 |
| 23 | Database schema | `db-schema` | physical tables, SQL types, indexes, constraints | P1 | 5 tables |
| 24 | UML class | `uml-class` | classes, interfaces, inheritance, composition | P1 | 6 classes |
| 25 | Org chart | `org-chart` | ownership, reporting, escalation, routing | P1 | 12 |
| 26 | Nested containment | `nested` | scopes inside scopes, quotas, authority | P1 | 4 levels |
| 27 | Venn | `venn` | overlap of two or three sets, intersection | P1 | 3 sets |
| 28 | Capability map | `capability-map` | business capabilities, maturity, ownership | P1 | 9 |
| 29 | Roadmap | `roadmap` | horizons, releases, milestones, dependencies | P1 | 9 |
| 30 | Git graph | `git-graph` | branches, merges, rebase, hotfix, backport | P1 | 5 branches |
| 31 | Loop / flywheel | `loop-flywheel` | a reinforcing cycle, last step feeds the first | P1 | 8 steps |
| 32 | Pyramid / funnel | `pyramid-funnel` | ranked hierarchy, conversion drop-off | P1 | 6 bands |
| 33 | Bar chart | `bar` | comparison of categories, one or two series | P1 | 8 bars |
| 34 | Line chart | `line` | continuous trend, slopegraph, rank movement | P1 | 5 series |
| 35 | Radar chart | `radar` | 3–5 entities across 3–5 criteria | P1 | 5 series |
| 36 | Heatmap | `heatmap` | cross-tabulated intensity, missing cells | P1 | 8 × 6 |
| 37 | Treemap | `treemap` | part-of-whole with relative sizes | P1 | 12 cells |
| 38 | Waterfall | `waterfall` | start total → signed contributions → end total | P1 | 8 bars |
| 39 | Fishbone | `fishbone` | causes of one effect, grouped by category | P2 | 6 bones |
| 40 | Requirement traceability | `requirement-traceability` | requirements ↔ design ↔ tests, with gaps explicit | P2 | 4 × 3 × 4 |

## Which file to read

| Need | File |
|---|---|
| Pick a type from the question | [`choose.md`](choose.md) |
| The selected type's layout and anti-patterns | [`diagram-types.md`](diagram-types.md) |
| Tokens and typography | [`design-system.md`](design-system.md) |
| Palette and contrast | [`palettes.md`](palettes.md) |
| Grid, viewBox presets, density | [`layout.md`](layout.md) |
| Connector geometry | [`connectors.md`](connectors.md) |
| Motion | [`animation.md`](animation.md) |
| SVG contract | [`accessibility.md`](accessibility.md) |
| Export | [`export.md`](export.md) |

## Type selection rules

1. **One type per figure.** A second layout is a second figure.
2. **A variant is not a type.** A different colour, corner, or label does not create a
   new grammar. Add it as an option to the parent.
3. **The budget is part of the type.** A sequence with twelve lifelines is not a
   sequence; it is a table of messages.
4. **The reader's question is the tie-breaker.** If two types fit, ask which axis is
   load-bearing: time, dependency, quantity, or containment.
5. **Above the budget, split.** Overview first; detail per zone. Report the cut.
