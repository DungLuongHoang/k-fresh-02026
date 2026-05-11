# Prometheus — Time-Series Metric Storage & Alerting

> The CNCF-graduated open-source monitoring and alerting toolkit that stores every metric as a time-stamped key-value pair in a purpose-built TSDB. In this repository, Prometheus is the **canonical backend** for load-test metrics from k6 (and optionally JMeter / Locust) and the data source that feeds Grafana dashboards. It replaces ad-hoc JSON summaries with a queryable, multi-dimensional data model that survives across runs.
>
> **Versions verified (2026-05):**
>
> | Component | Version | Notes |
> |---|---|---|
> | Prometheus server | `v3.11.3` | Released 2026-05-02 — adds native-histogram support for remote-write receivers, improved TSDB compaction |
> | k6 | `v0.51.0` | `--out experimental-prometheus-rw` is the supported output (stable since v0.42) |
> | Grafana | `v13.0.1` | Prometheus is the default data source — see [`grafana.md`](./grafana.md) |
> | `@playwright/test` | `^1.59.1` | Already in [`package.json`](../../package.json) |

---

## When to reach for Prometheus

Use when:
- You run **more than 5 load-test scenarios** and need to query, compare, and alert on their metrics across runs.
- You want to **correlate** test-generated metrics (k6 HTTP durations, error rates, throughput) with infrastructure metrics (CPU, memory, DB connections, queue depth) on a single timeline.
- You need **PromQL** to compute latency percentiles (P50, P90, P95, P99), error-rate ratios, and throughput aggregations that the k6 JSON summary cannot express.
- You want **alerting rules** that fire when an SLO breaches during a soak test (e.g., P95 > 500ms for 5 consecutive minutes → Slack / PagerDuty).
- You need a **persistent, queryable store** that survives past a single CI run — enabling trend dashboards without re-running tests.

Avoid when:
- You are trying to store **raw logs or traces**. Prometheus is strictly for numeric metric time-series. Use Loki for logs, Jaeger / Tempo for traces.
- You only need **functional test pass/fail results** — use [`allure-report.md`](./allure-report.md) or [`report-portal.md`](./report-portal.md) instead.
- You want a **single-run snapshot** with no infrastructure. The k6 JSON summary at `reports/perf-summary.json` (see [`../performance/README.md`](../performance/README.md) §"How perf results reach the dashboard") covers that without standing up a database.
- Your team has **no ops budget** for a persistent service. The Docker Compose stack below is lightweight, but it still needs a machine.

---

## The picture

```
┌──────────────────────────┐       ┌──────────────────────────────────────┐
│ k6 load test             │       │ Prometheus server  (v3.11.3)         │
│ (cart-add-item.js, etc.) │──RW──▶│   ├── TSDB (local storage, 15d)     │
└──────────────────────────┘       │   ├── PromQL engine                  │
                                   │   ├── Alert manager integration      │
┌──────────────────────────┐       │   └── /api/v1/write  (remote-write) │
│ Node exporter / cAdvisor │──SC──▶│                                      │
│ (infra metrics)          │       └──────────────┬───────────────────────┘
└──────────────────────────┘                      │
                                                  │ PromQL
                                                  ▼
                                   ┌──────────────────────────────────────┐
                                   │ Grafana  (v13.0.1)                   │
                                   │   ├── k6 Load Testing Dashboard      │
                                   │   ├── Infra correlation panels       │
                                   │   └── SLO annotations                │
                                   └──────────────────────────────────────┘

RW = remote-write (push from k6 to Prometheus)
SC = scrape (Prometheus pulls from exporter endpoints every 15s)
```

Prometheus supports two ingestion modes:

| Mode | Direction | Used by | When to pick |
|---|---|---|---|
| **Remote-write** | Client pushes to Prometheus | k6, JMeter Backend Listener | Short-lived jobs that can't be scraped (load tests, batch jobs) |
| **Scrape** | Prometheus pulls from `/metrics` | Node exporter, cAdvisor, app instrumentation | Long-running services exposing a metrics endpoint |

For load testing, **remote-write is the default** — k6 pushes metrics and exits; Prometheus can't scrape a process that's already gone.

---

## Install / setup

### Option A — Docker Compose (recommended)

Run the full observability stack alongside your load tests. Create `tests/perf/docker-compose.observability.yml`:

```yaml
# tests/perf/docker-compose.observability.yml
# Spin up:  docker compose -f tests/perf/docker-compose.observability.yml up -d
# Tear down: docker compose -f tests/perf/docker-compose.observability.yml down -v
services:
  prometheus:
    image: prom/prometheus:v3.11.3
    container_name: prometheus
    ports:
      - '9090:9090'
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--web.enable-remote-write-receiver'   # required for k6 push
      - '--storage.tsdb.retention.time=15d'     # keep 15 days of data
      - '--storage.tsdb.retention.size=2GB'     # cap disk at 2 GB
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:13.0.1
    container_name: grafana
    ports:
      - '3000:3000'
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin       # rotate in non-local envs
      GF_AUTH_ANONYMOUS_ENABLED: 'true'        # convenience for local dev
      GF_AUTH_ANONYMOUS_ORG_ROLE: Viewer
    volumes:
      - grafana-data:/var/lib/grafana
      - ./provisioning/datasources:/etc/grafana/provisioning/datasources:ro
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
```

### Option B — Standalone Docker (minimal)

```bash
docker run -d -p 9090:9090 \
  --name prometheus \
  -v $(pwd)/tests/perf/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  prom/prometheus:v3.11.3 \
  --config.file=/etc/prometheus/prometheus.yml \
  --web.enable-remote-write-receiver
```

> ⚠️ The `--web.enable-remote-write-receiver` flag is **mandatory** for k6 metric ingestion. Without it, k6's POST to `/api/v1/write` returns `405 Method Not Allowed` and metrics are silently lost.

---

## Configuration

### `prometheus.yml` — minimal config for load testing

Create `tests/perf/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s          # default pull interval for scrape targets
  evaluation_interval: 15s      # how often alerting rules are evaluated

# Scrape Prometheus itself (health + meta-metrics)
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Uncomment to scrape your SUT's /metrics endpoint during load tests:
  # - job_name: 'sut-app'
  #   static_configs:
  #     - targets: ['host.docker.internal:8080']
  #   metrics_path: /metrics
  #   scrape_interval: 5s
```

### Grafana data-source provisioning (auto-connect on startup)

Create `tests/perf/provisioning/datasources/prometheus.yml`:

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

This removes the manual "Add Data Source" step from Grafana — the connection is live on first boot.

---

## The 5-step happy path (k6 → Prometheus → Grafana)

1. **Spin up the stack.**
   ```bash
   docker compose -f tests/perf/docker-compose.observability.yml up -d
   ```

2. **Run a k6 load test with Prometheus remote-write output.**
   ```bash
   K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
   k6 run --out experimental-prometheus-rw tests/perf/k6/scenarios/cart-add-item.js
   ```

3. **Verify ingestion in Prometheus.** Open `http://localhost:9090` → Status → Targets (confirm `prometheus` is UP). Then query:
   ```promql
   k6_http_reqs_total
   ```
   You should see time-series per scenario, method, and status.

4. **Import the k6 Grafana dashboard.** Open `http://localhost:3000` → Dashboards → Import → paste Dashboard ID **`19349`** (official k6 dashboard) → select the `Prometheus` data source.

5. **Explore and iterate.** Use the Grafana Explore panel to write custom PromQL queries. Save useful panels to a project-specific dashboard, then export the JSON to `tests/perf/dashboards/` for version control.

---

## PromQL cookbook — common queries for load testing

| What you want | PromQL | Notes |
|---|---|---|
| **P95 latency for a scenario** | `histogram_quantile(0.95, sum(rate(k6_http_req_duration_bucket{scenario="cart_add_item", expected_response="true"}[5m])) by (le))` | The `[5m]` window should be ≥ 2× the scrape interval |
| **P99 latency** | Same as above, change `0.95` → `0.99` | — |
| **Error rate (%)** | `sum(rate(k6_http_req_failed_total{scenario="checkout_submit"}[5m])) / sum(rate(k6_http_reqs_total{scenario="checkout_submit"}[5m])) * 100` | Compare against the 0.5% SLO from [`../performance/README.md`](../performance/README.md) |
| **Throughput (RPS)** | `sum(rate(k6_http_reqs_total{scenario="search_query"}[1m]))` | Use `[1m]` for a responsive graph; `[5m]` for a smoother one |
| **Active VUs** | `k6_vus` | Useful to overlay on latency charts to see if latency rises with load |
| **Iteration duration** | `histogram_quantile(0.95, sum(rate(k6_iteration_duration_bucket[5m])) by (le))` | End-to-end iteration, not per-request |

> **Tip:** When building Grafana panels, always use `rate()` or `increase()` on counters — never graph a raw counter directly; the monotonically increasing line hides the signal.

---

## Alerting rules (optional but recommended for soak tests)

Create `tests/perf/alert-rules.yml` and mount it into the Prometheus container:

```yaml
groups:
  - name: k6-slo-alerts
    rules:
      - alert: HighP95Latency
        expr: histogram_quantile(0.95, sum(rate(k6_http_req_duration_bucket{expected_response="true"}[5m])) by (le, scenario)) > 500
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "P95 latency > 500ms for {{ $labels.scenario }}"
          description: "P95 latency is {{ $value | humanize }}ms, exceeding the 500ms SLO."

      - alert: HighErrorRate
        expr: sum(rate(k6_http_req_failed_total[5m])) by (scenario) / sum(rate(k6_http_reqs_total[5m])) by (scenario) > 0.005
        for: 3m
        labels:
          severity: major
        annotations:
          summary: "Error rate > 0.5% for {{ $labels.scenario }}"
```

Then update `prometheus.yml`:

```yaml
rule_files:
  - '/etc/prometheus/alert-rules.yml'
```

And add the volume mount to Docker Compose:

```yaml
volumes:
  - ./alert-rules.yml:/etc/prometheus/alert-rules.yml:ro
```

> Alerting rules map directly to the SLO shapes defined in [`../performance/README.md`](../performance/README.md) §"SLO discipline". The `severity` labels match the defect labels in [`prompts/core/defect-labels.md`](../../prompts/core/defect-labels.md).

---

## Retention & storage tuning

| Flag | Default | Recommended for this repo | Why |
|---|---|---|---|
| `--storage.tsdb.retention.time` | `15d` | `15d` (local dev) / `30d` (CI) | 15 days covers 2 sprint cycles; 30d covers a release train |
| `--storage.tsdb.retention.size` | unlimited | `2GB` (local) / `10GB` (CI) | Prevents disk-fill on shared runners |
| `--storage.tsdb.wal-compression` | `true` (v3.x) | `true` | Cuts WAL size by ~50% with negligible CPU cost |

For long-term storage beyond 30 days, use Thanos, Cortex, or Grafana Mimir as a remote-write target **downstream** of Prometheus. This repo does not require long-term storage by default.

---

## Conventions in this repo

- **Remote-write is the default ingestion mode for k6.** Do not set up a statsd exporter or a k6-to-Prometheus adapter — the built-in `--out experimental-prometheus-rw` is simpler and has fewer moving parts.
- **Prometheus data volumes are ephemeral locally.** Do not commit them to Git. The `docker compose down -v` command destroys them intentionally.
- **Dashboard JSON goes into `tests/perf/dashboards/`.** Export Grafana dashboards as JSON and commit them so the team can `Import` from the file without manual recreation.
- **Prometheus is the default Grafana data source.** See [`grafana.md`](./grafana.md) §"Configuration / conventions in this repo". InfluxDB is acceptable only for legacy JMeter / Locust integrations.
- **One Prometheus instance per environment.** Don't mix QA and staging metrics in the same TSDB — the `env` label helps, but query mistakes are expensive. Separate instances are cheap.

---

## Worked example — diagnosing a checkout regression

Scenario: the nightly soak test on `staging` shows the `checkout_submit` scenario's P95 crept from 320ms to 680ms over the last 3 days, breaching the 500ms SLO.

1. **Open Grafana** → k6 dashboard → filter by `scenario=checkout_submit`, `env=staging`.
2. **Overlay infra metrics:** Add a panel querying `node_cpu_seconds_total` from the staging host. CPU usage rose from 40% to 78% at the same timestamps.
3. **Correlate with deployment:** Grafana annotation at `2026-05-08 14:00 UTC` marks a deploy of `checkout-service v2.4.1`.
4. **Root cause:** The new version introduced an N+1 database query in the discount calculation path.
5. **Action:** File a defect via [`defect-report`](../../.agents/skills/defect-report/SKILL.md) with `module:checkout` + `severity:major`. The Prometheus query that proves the regression:

   ```promql
   histogram_quantile(0.95, sum(rate(k6_http_req_duration_bucket{scenario="checkout_submit", env="staging"}[10m])) by (le))
   ```

   Include this query in the defect body so the developer can reproduce the observation.

---

## Anti-patterns this guideline rules out

- ❌ **Omitting `--web.enable-remote-write-receiver`.** k6 pushes to `/api/v1/write`; without this flag, all metrics are silently dropped (405 error in k6 stderr, easily missed).
- ❌ **Using Prometheus for log aggregation.** High-cardinality labels (full URLs, stack traces, request bodies) bloat the TSDB index and degrade query performance exponentially. One label with 100k unique values = one very sick Prometheus.
- ❌ **Committing `prometheus-data/` or any TSDB chunk to Git.** These are multi-GB binary files. Always `.gitignore` them.
- ❌ **Graphing raw counters without `rate()`.** A monotonically increasing counter tells you nothing visually. Always wrap in `rate()` or `increase()`.
- ❌ **Running without retention limits.** Unbounded retention fills disks silently. Always set both `--storage.tsdb.retention.time` and `--storage.tsdb.retention.size`.
- ❌ **Scraping k6 instead of using remote-write.** k6 is a short-lived process; by the time Prometheus scrapes, the process may be gone. Remote-write pushes data in real-time during the test.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| k6 logs `WARN: Prometheus remote write error: 405` | `--web.enable-remote-write-receiver` not set | Restart Prometheus with the flag |
| No data in Grafana after k6 run | Wrong Prometheus URL in k6 env var or Grafana data source | Verify `K6_PROMETHEUS_RW_SERVER_URL` matches the Prometheus container's address; use `http://prometheus:9090` inside Docker, `http://localhost:9090` from host |
| `storage: no space left on device` | No retention size limit | Add `--storage.tsdb.retention.size=2GB` |
| Queries return `no data` for a metric you know exists | Time range in Grafana doesn't cover the test run | Expand the time picker to cover the k6 run window |
| `too many label values` warning | High-cardinality label (e.g., full request URL as a tag) | Use stable, low-cardinality labels: `scenario`, `method`, `status`, `name` |
| Alerting rules don't fire during soak tests | `rule_files:` not set in `prometheus.yml` or alert file not mounted | Verify the mount and the `rule_files` config entry |

---

## Refresh due

**2026-11** — Prometheus cuts minor releases roughly monthly. Re-run the [`write-document` skill](../../.agents/skills/write-document/SKILL.md) with the latest-version sweep at that point to verify flag names and remote-write API stability.

---

## Related

- [`grafana.md`](./grafana.md) — How to visualize the metrics Prometheus stores
- [`../performance/k6.md`](../performance/k6.md) — How to author the load tests that generate these metrics (§"Output → Grafana / Prometheus / InfluxDB")
- [`../performance/README.md`](../performance/README.md) — The SLO discipline and dashboard contract that Prometheus feeds
- [`../ci/docker.md`](../ci/docker.md) — Docker guidelines for the test suite; the observability stack follows the same conventions
- [`.agents/skills/performance-testing/SKILL.md`](../../.agents/skills/performance-testing/SKILL.md) — The skill that authors k6 scripts following the performance guidelines
- [`.agents/skills/performance-analyzer/SKILL.md`](../../.agents/skills/performance-analyzer/SKILL.md) — Reads perf results and triages regressions
- [`.agents/skills/defect-report/SKILL.md`](../../.agents/skills/defect-report/SKILL.md) — Files defects when Prometheus alerts prove an SLO breach
- Prometheus docs: [prometheus.io/docs](https://prometheus.io/docs/introduction/overview/)
- PromQL reference: [prometheus.io/docs/prometheus/latest/querying/basics/](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- k6 Prometheus output: [grafana.com/docs/k6/latest/results-output/real-time/prometheus-remote-write/](https://grafana.com/docs/k6/latest/results-output/real-time/prometheus-remote-write/)
