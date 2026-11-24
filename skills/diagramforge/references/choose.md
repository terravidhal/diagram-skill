# Choosing the right diagram

The most common failure is choosing a type by its name. Start with the reader's
question, then choose the layout that answers it.

## Decision tree

```
Is the question "how much" or "how does it change"?
  → bar, line, waterfall, heatmap, treemap, radar

Is it "in what order" or "when"?
  → sequence, state machine, flowchart, timeline, gantt, roadmap, git graph

Is it "what depends on what" or "what contains what"?
  → dependency graph, tree, org chart, nested, layer stack, ERD, UML class

Is it "where does it run" or "what talks to what"?
  → architecture, deployment, network topology, security boundaries,
    integration map, data flow, data pipeline

Is it "why" or "what causes this"?
  → fishbone, causal chain, requirements traceability

Is it "what changed"?
  → before/after delta, architecture delta

Would a three-column table say the same thing?
  → write the table

Do two types fit?
  → choose the dominant axis and drop the second layout
```

## Semantic patterns

A semantic pattern is a behaviour that the layout must express, independent of the type.
Choose the pattern first when behaviour, state, risk, or enforcement carries the meaning.

| Behaviour | Pattern | Nearest type |
|---|---|---|
| Fan-in, queue depth, finite capacity, bottleneck | queue / bottleneck | data-flow, architecture |
| Repeated slots across stages (question, input, governance, output) | stage framework | process, swimlane |
| Loose input becomes a structured durable artifact | input → artifact | data-flow |
| Two rule traces with pass/fail/skipped and first divergence | paired traces | flowchart |
| Trust boundaries plus permitted and forbidden paths | paved road | security-boundaries, architecture |
| Controls grouped by where they are enforced | control catalogue | layer-stack |
| Defenses compensate for earlier gaps; residual risk propagates | compensating layers | layer-stack |
| One subject goes through phases, waits, retries, cancellation | lifecycle map | state-machine |
| A quantity splits and merges, band width = amount | flow split | sankey (P2 variant) |
| A start total is bridged by signed contributions | running total | waterfall |
| One idea is copied N times in equal units | unit grid | treemap variant |

The pattern adds semantic primitives; it does not add a second layout grammar. If a
pattern names a type that is P2, use its nearest P1 parent and document the variant.

## Worked routing

| Prompt | Choose | Why |
|---|---|---|
| "Our p99 tripled. Where does the time go?" | waterfall of the latency budget | the question is a running total, not a topology |
| "How does checkout talk to Redis and Postgres?" | architecture | components and stores are the subject |
| "Show the order of calls in a cache miss." | sequence | time and message direction are the subject |
| "Who can access the payments data?" | security-boundaries if topology drives the answer; quadrant if risk does | two different questions wear the same words |
| "What changed in the deployment?" | before/after delta with a ledger | two unrelated architectures hide the change |
| "Draw 25 microservices." | architecture, split into overview + zones | the budget is a design constraint, not a challenge |
| "Make it premium." | stronger hierarchy: size, weight, hairline, space | premium is restraint, not shadow and glow |
| "Explain our refund process." | swimlane if roles hand off; flowchart if it is one actor's decisions | the axis is handoff vs logic |
| "Show the schema." | ERD for concepts; db-schema for SQL types and indexes | conceptual vs physical |
| "Plot our revenue." | bar for categories; line for a continuous trend; waterfall for a bridge | the shape of the question decides |
| "Show the org." | org-chart, not tree, if reporting and escalation both matter | the dotted escalation is a second relationship |
| "Animate it." | draw for a flow, reveal for stages, focus for one node | motion must explain order, not decorate |

## When a table wins

Do not draw when:

- the content is a list of independent items;
- the comparison is one attribute across many rows;
- the only relationship is "these are all things";
- the whole message is one sentence;
- the drawing would need a legend to explain its structure rather than its treatments.

A table with three columns and six rows is often the better editorial object.

## Fidelity ledger

When the source has more elements than the budget, cut in a fixed order and report it:

```
Detail: balanced · 18 source nodes → 9 drawn
Merged:   worker-01..06 → "Ingest worker ×6"
Collapsed: "Observability" group → one node
Dropped:  2 sticky notes, CI pipeline (cross-cutting)
Kept:     the request path (client → gateway → orders → postgres)
```

The reader cannot see what is missing. The person who asked can.

## Plan before drawing

Say one line: type, size preset, approximate count, expected cuts, motion on/off. If the
request already pins those, put the line in the final report instead of pausing.

## Two-type tie-breaker

Ask: **what must the reader be able to point at?**

- a moment in time → sequence, timeline, gantt;
- a rule → flowchart, state machine;
- a dependency → dependency graph, tree;
- a boundary → architecture, security-boundaries, nested;
- a quantity → chart;
- a change → delta.

The answer is the dominant axis. The other type becomes a second figure, not a second
layer on the same canvas.
