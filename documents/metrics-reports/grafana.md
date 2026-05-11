# Grafana — Performance & Metrics Visualization

> The open-source standard for operational dashboards, time-series analytics, and alerting. In this repository, Grafana is the **visualization layer** that sits on top of Prometheus (or InfluxDB) and turns raw load-test metrics into interactive, shareable dashboards that answer "is the system fast enough?" at a glance. It does **not** store data — it queries a backend and renders panels.
>
> **Versions verified (2026-05):**
>
> | Component | Version | Notes |
> |---|---|---|
> | Grafana server | `v13.0.1` | Released 2026-04 — adds unified alerting GA, improved explore-to-dashboard flow |
> | Prometheus | `v3.11.3` | Default data source — see [`prometheus.md`](./prometheus.md) |
> | k6 | `v0.51.0` | `--out experimental-prometheus-rw` pushes metrics through Prometheus into Grafana |
> | `@playwright/test` | `^1.59.1` | Already in [`package.json`](../../package.json) |

---

## When to reach for Grafana

Use when:
- You are running **load, stress, or soak tests** and need to visualize throughput, latency percentiles, and error rates over time on an interactive timeline.
- You need to **correlate** test metrics (k6 HTTP durations, VU counts) with infrastructure metrics (CPU, memory, DB connections, queue depth) on the **same dashboard** so you can see cause and effect.
- You want **alerting** on SLO thresholds (e.g., P95 latency > 500ms for 5 consecutive minutes → Slack / PagerDuty / email).
- You need to **share a live URL** with PMs, SREs, or engineers — instead of emailing static screenshots or downloading HTML artifacts.
- You want to **annotate** deployment timestamps, chaos experiments, or config changes directly on the time-series graph to correlate performance shifts with changes.

Avoid when:
- You only need **functional test pass/fail results**. Use [`allure-report.md`](./allure-report.md) (single-run deep dive) or [`report-portal.md`](./report-portal.md) (multi-run trend analytics).
- You need a **static, offline snapshot**. Grafana requires a running server + data source. For a single k6 run summary, use the JSON output at `reports/perf-summary.json` (see [`../performance/README.md`](../performance/README.md)).
- You have **no persistent infrastructure** at all. The Docker Compose stack below is lightweight, but it needs a machine. Without one, stay on k6 JSON summaries + the in-repo QA Metrics Dashboard.

---

## The picture

```
┌──────────────────────────┐      ┌───────────────────────────┐      ┌────────────────────────────────┐
│ k6 load test             │      │ Prometheus  (v3.11.3)     │      │ Grafana  (v13.0.1)             │
│ (cart-add-item.js, etc.) │─RW──▶│   ├── TSDB storage        │◄─Q──│   ├── k6 Dashboard (ID 19349)  │
└──────────────────────────┘      │   └── /api/v1/write       │      │   ├── Infra correlation panels │
                                  └───────────────────────────┘      │   ├── SLO threshold lines      │
┌──────────────────────────┐                ▲                        │   ├── Annotations (deploys)    │
│ Node exporter / cAdvisor │────scrape──────┘                        │   └── Alerting rules           │
│ (CPU, mem, disk, net)    │                                         └────────────────────────────────┘
└──────────────────────────┘

RW = remote-write (k6 pushes to Prometheus)
Q  = PromQL query (Grafana pulls from Prometheus)
```

Key principle: **Grafana never stores data.** It queries Prometheus (or InfluxDB) on every panel refresh. If the data source is down, Grafana shows empty panels. This is by design — separation of concerns.

---

## Install / setup

### Option A — Docker Compose with Prometheus (recommended)

This is the standard stack for this repo. The full `docker-compose.observability.yml` is defined in [`prometheus.md`](./prometheus.md) §"Install / setup". It includes both Prometheus and Grafana with auto-provisioned data sources.

```bash
docker compose -f tests/perf/docker-compose.observability.yml up -d
```

Grafana is then available at `http://localhost:3000` — default credentials: `admin` / `admin`.

### Option B — Standalone Docker (Grafana only)

If Prometheus is already running elsewhere (e.g., a shared staging instance):

```bash
docker run -d -p 3000:3000 \
  --name grafana \
  -e GF_SECURITY_ADMIN_USER=admin \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  grafana/grafana:13.0.1
```

Then manually add Prometheus as a data source via the UI: **Connections → Data sources → Add data source → Prometheus** → URL: `http://<prometheus-host>:9090`.

### Option C — Auto-provisioned data source (zero-click setup)

Create `tests/perf/provisioning/datasources/prometheus.yml` so Grafana connects to Prometheus on first boot with no manual clicks:

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090     # Docker service name from compose
    isDefault: true
    editable: false
    jsonData:
      timeInterval: '15s'          # match Prometheus scrape_interval
```

Mount this file into the Grafana container (already done in the Docker Compose stack in `prometheus.md`).

---

## The 5-step happy path (k6 → Prometheus → Grafana)

1. **Spin up the observability stack.**
   ```bash
   docker compose -f tests/perf/docker-compose.observability.yml up -d
   ```

2. **Run a k6 load test with Prometheus output.**
   ```bash
   K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
   k6 run --out experimental-prometheus-rw tests/perf/k6/scenarios/cart-add-item.js
   ```

3. **Import the official k6 dashboard.** Open `http://localhost:3000` → **Dashboards → Import** → paste Dashboard ID **`19349`** → select `Prometheus` as the data source → **Import**.

4. **Explore the data.** The imported dashboard shows:
   - HTTP request rate, duration percentiles (P50, P90, P95, P99)
   - Error rate, failed checks
   - Active VUs over time
   - Data sent/received throughput

5. **Customize and export.** Add project-specific panels (see §"Panel cookbook" below), then export the dashboard JSON to `tests/perf/dashboards/` for version control.

---

## Dashboard as Code — the export/import workflow

Dashboards managed only through the Grafana UI are a single point of failure. One accidental delete = lost configuration.

### Export

1. Open the dashboard → **Settings** (gear icon) → **JSON Model** → Copy.
2. Save to `tests/perf/dashboards/<dashboard-name>.json`.
3. Commit with a descriptive message: `perf: export k6 checkout dashboard v2`.

### Import

1. **Dashboards → Import** → Upload the JSON file → select the Prometheus data source → **Import**.

### Provisioned dashboards (auto-import on boot)

For dashboards that should always exist, create `tests/perf/provisioning/dashboards/dashboard.yml`:

```yaml
apiVersion: 1
providers:
  - name: 'k6-dashboards'
    orgId: 1
    folder: 'Performance'
    type: file
    disableDeletion: true
    updateIntervalSeconds: 30
    options:
      path: /etc/grafana/provisioning/dashboards/json
      foldersFromFilesStructure: false
```

Then mount `tests/perf/dashboards/` → `/etc/grafana/provisioning/dashboards/json` in Docker Compose.

### File structure convention

```
tests/perf/
├── dashboards/
│   ├── k6-load-testing.json       # official k6 dashboard (exported)
│   ├── checkout-performance.json   # project-specific panels
│   └── infra-correlation.json      # CPU / memory / DB connections
├── provisioning/
│   ├── datasources/
│   │   └── prometheus.yml
│   └── dashboards/
│       └── dashboard.yml
├── prometheus.yml
├── alert-rules.yml
└── docker-compose.observability.yml
```

---

## Panel cookbook — common panels for load testing

### P95 latency by scenario (time-series panel)

```promql
histogram_quantile(0.95, sum(rate(k6_http_req_duration_bucket{expected_response="true"}[5m])) by (le, scenario))
```

- **Panel type:** Time series
- **Unit:** milliseconds (ms)
- **Threshold line:** Add a constant at `500` (our SLO) colored red

### Error rate as percentage (stat panel)

```promql
sum(rate(k6_http_req_failed_total[5m])) / sum(rate(k6_http_reqs_total[5m])) * 100
```

- **Panel type:** Stat
- **Unit:** percent (0-100)
- **Thresholds:** Green < 0.5%, Yellow < 1%, Red ≥ 1%

### Throughput — requests per second (time-series panel)

```promql
sum(rate(k6_http_reqs_total[1m])) by (scenario)
```

- **Panel type:** Time series
- **Unit:** reqps

### Active VUs (time-series panel)

```promql
k6_vus
```

- **Panel type:** Time series
- **Legend:** Overlay on latency panels to correlate load with response time

### Infrastructure correlation — CPU usage (time-series panel)

```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

- **Panel type:** Time series
- **Unit:** percent
- **Note:** Requires `node_exporter` running on the SUT and scraped by Prometheus

> **Tip:** Always use `rate()` on counters. Never graph a raw counter directly — the monotonically increasing line hides the signal. See [`prometheus.md`](./prometheus.md) §"PromQL cookbook" for more query patterns.

---

## Annotations — marking events on the timeline

Annotations overlay vertical lines on time-series panels to mark deployments, test run boundaries, chaos experiments, or config changes.

### Manual annotation via the Grafana UI

Click on a panel → **Add annotation** → fill in the description. Useful for ad-hoc investigation.

### Programmatic annotation via the API

Insert an annotation from CI after a deployment:

```bash
curl -s -X POST http://localhost:3000/api/annotations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -d '{
    "time": '"$(date +%s)000"',
    "tags": ["deploy", "checkout-service", "v2.4.1"],
    "text": "Deployed checkout-service v2.4.1 to staging"
  }'
```

### Annotation query (show k6 test-run windows)

In the dashboard settings, add an **Annotation query** with:

```promql
changes(k6_vus[1m]) > 0
```

This highlights the exact time window when VUs were active — making it easy to zoom into the test period on a dashboard that spans 24 hours.

---

## Alerting

Grafana v13 ships with **Unified Alerting** enabled by default. For load-testing use cases, we recommend defining alert rules in **Prometheus** (via `alert-rules.yml` — see [`prometheus.md`](./prometheus.md) §"Alerting rules") rather than in Grafana, because:

- Prometheus alert rules survive Grafana restarts and re-provisioning.
- They work even if Grafana is down.
- They can be version-controlled alongside `prometheus.yml`.

If you prefer Grafana-managed alerts (e.g., for rich notification templates with screenshots), configure contact points via **Alerting → Contact points** and define notification policies to route by `severity` label:

| Severity | Channel | When |
|---|---|---|
| `critical` | PagerDuty / Slack `#incidents` | P95 > SLO for 5m during soak test |
| `major` | Slack `#perf-alerts` | Error rate > 0.5% for 3m |
| `info` | Email digest | Test run completed (summary annotation) |

---

## Grafana vs other reporting tools in this repo

| Concern | Grafana | Allure | ReportPortal | QA Metrics Dashboard |
|---|---|---|---|---|
| **Best for** | Time-series perf visualization | Single-run functional deep dive | Multi-run functional trends | Sprint-level QA overview |
| **Data type** | Numeric metrics (latency, RPS, CPU) | Test steps, screenshots, traces | Test pass/fail + AI clustering | JUnit XML aggregation |
| **Persistence** | Depends on data source (Prometheus) | Per-run artifact | Server-side | In-repo HTML |
| **Live URL** | ✅ Shareable dashboards | ❌ Download artifact | ✅ Server URL | ❌ Local file |
| **Alerting** | ✅ Native + Prometheus rules | ❌ | ⚠️ via plugins | ❌ |
| **Infrastructure** | Docker (Grafana + Prometheus) | None (CLI) | Heavy (PG + RabbitMQ + ES) | None (static HTML) |

**Rule of thumb:** Use Grafana for **performance metrics over time**. Use Allure for **why did this test fail**. Use ReportPortal for **is the suite getting more reliable**. Use the QA Dashboard for **are we ready to ship**.

---

## Worked example — diagnosing a checkout latency regression

Scenario: the nightly soak test on staging shows the checkout P95 has crept from 320ms to 680ms, breaching the 500ms SLO. Here's the investigation workflow entirely within Grafana:

1. **Open the k6 dashboard** → filter by `scenario=checkout_submit`, time range = last 7 days.
2. **Spot the inflection point.** The P95 line crosses the 500ms threshold on May 8th at 14:00 UTC.
3. **Check the annotations.** A green vertical line at 14:00 reads: "Deployed checkout-service v2.4.1 to staging".
4. **Add an infra correlation panel.** CPU usage on the staging host rose from 40% → 78% at the same timestamp.
5. **Zoom into the deploy window.** Switch to `[1m]` rate window. The P95 jumped immediately post-deploy — not a gradual degradation.
6. **Conclusion:** The v2.4.1 deploy introduced an N+1 query in the discount calculation path. The PromQL proof:

   ```promql
   histogram_quantile(0.95, sum(rate(k6_http_req_duration_bucket{scenario="checkout_submit", env="staging"}[10m])) by (le))
   ```

7. **Action:** File a defect via [`defect-report`](../../.agents/skills/defect-report/SKILL.md) with `module:checkout` + `severity:major`. Link to the Grafana dashboard URL with the time range pinned.

---

## Configuration reference — environment variables

| Variable | Default | Purpose |
|---|---|---|
| `GF_SECURITY_ADMIN_USER` | `admin` | Initial admin username |
| `GF_SECURITY_ADMIN_PASSWORD` | `admin` | Initial admin password — **rotate in non-local envs** |
| `GF_AUTH_ANONYMOUS_ENABLED` | `false` | Set `true` for local dev convenience (read-only) |
| `GF_AUTH_ANONYMOUS_ORG_ROLE` | `Viewer` | Role for anonymous access |
| `GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH` | — | Set to `/etc/grafana/provisioning/dashboards/json/k6-load-testing.json` to auto-open the k6 dashboard on login |
| `GF_SERVER_ROOT_URL` | `http://localhost:3000` | Set to production URL for correct annotation/alert links |

---

## Anti-patterns this guideline rules out

- ❌ **Using Grafana as a primary datastore.** Grafana does not store metrics. It queries Prometheus, InfluxDB, or another backend. If the backend is gone, the data is gone. Always pair Grafana with a persistent TSDB.
- ❌ **Manual dashboard edits without JSON export.** If the Grafana instance is rebuilt (or someone deletes a dashboard), the work is lost. Every dashboard must be exported as JSON to `tests/perf/dashboards/` and committed.
- ❌ **Alerting on noisy, unactionable metrics.** Only alert on SLO-breaching signals (P95 > 500ms, error rate > 0.5%). Alerting on traffic spikes, VU counts, or request rates creates noise that gets ignored.
- ❌ **Creating dashboards with mixed data sources without labeling.** If a dashboard pulls from both Prometheus and InfluxDB, every panel must indicate its data source in the title suffix (e.g., "P95 Latency (Prometheus)") to prevent confusion during incidents.
- ❌ **Embedding Grafana credentials in source code or CI scripts.** Use environment variables (`GF_SECURITY_ADMIN_PASSWORD`) or Grafana service accounts for API access. Never commit credentials.
- ❌ **Using `:latest` as the Grafana image tag.** Pin to the exact version (`grafana/grafana:13.0.1`). A surprise major-version upgrade can break provisioned dashboards and alert rules.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| All panels show "No data" | Prometheus data source not configured or URL wrong | **Connections → Data sources** → verify Prometheus URL (use Docker service name `http://prometheus:9090` inside compose, `http://localhost:9090` from host) |
| Dashboard imported but panels show errors | Data source name mismatch (e.g., "Prometheus" vs "prometheus") | Re-import and select the correct data source from the dropdown |
| Annotations don't appear | Time range doesn't cover the annotated period | Expand the time picker; check that annotation queries are enabled in dashboard settings |
| `403 Forbidden` on API calls | Invalid or expired API key / service account token | Regenerate under **Administration → Service accounts** |
| Grafana container exits immediately | Port 3000 already in use | `docker ps` to find the conflict; change the host port: `-p 3001:3000` |
| Provisioned dashboard reverts edits | `disableDeletion: true` and file-based provisioning overwrites UI changes every 30s | Edit the JSON file in `tests/perf/dashboards/`, not the UI |

---

## Refresh due

**2026-11** — Grafana cuts a major roughly every 6 months. Re-run the [`write-document` skill](../../.agents/skills/write-document/SKILL.md) with the latest-version sweep at that point to verify provisioning API compatibility and alerting changes.

---

## Related

- [`prometheus.md`](./prometheus.md) — The data source that feeds Grafana; includes Docker Compose stack, PromQL cookbook, and alerting rules
- [`allure-report.md`](./allure-report.md) — Single-run functional test reporting (complements, does not compete with, Grafana)
- [`report-portal.md`](./report-portal.md) — Multi-run functional trend analytics
- [`../performance/k6.md`](../performance/k6.md) — How to author the k6 load tests that generate metrics (§"Output → Grafana / Prometheus / InfluxDB")
- [`../performance/README.md`](../performance/README.md) — The SLO discipline and dashboard contract that Grafana visualizes
- [`../ci/docker.md`](../ci/docker.md) — Docker guidelines; the observability stack follows the same conventions
- [`.agents/skills/performance-testing/SKILL.md`](../../.agents/skills/performance-testing/SKILL.md) — The skill that authors k6 scripts following performance guidelines
- [`.agents/skills/performance-analyzer/SKILL.md`](../../.agents/skills/performance-analyzer/SKILL.md) — Reads perf data and triages regressions
- [`.agents/skills/defect-report/SKILL.md`](../../.agents/skills/defect-report/SKILL.md) — Files defects when Grafana dashboards prove an SLO breach
- Grafana docs: [grafana.com/docs/grafana/latest/](https://grafana.com/docs/grafana/latest/)
- k6 dashboard: [grafana.com/grafana/dashboards/19349](https://grafana.com/grafana/dashboards/19349-k6-prometheus/)
- Grafana provisioning: [grafana.com/docs/grafana/latest/administration/provisioning/](https://grafana.com/docs/grafana/latest/administration/provisioning/)
