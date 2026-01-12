---
name: data-analyst
description: A data analyst command for structured, professional data analysis. Use when user requests data analysis, dashboards, metrics, EDA, cohort, funnel, or A/B tests.
---

# CrushData AI - Data Analyst Command

A data analyst intelligence command that guides you through structured, professional data analysis.

## When to Use

Activate this command when user requests data analysis, dashboards, metrics, EDA, cohort/funnel analysis, or A/B testing.

## Workflow

### 1. Discovery (MANDATORY)
Before coding, ask:
- What business question should this answer?
- Which tables contain the data?
- How does YOUR company define the key metrics?
- **Script Folder**: Save scripts in `analysis/`. Create folder if needed.
- **Python Env**: Check for `venv`. If missing, create `venv`. Always run inside venv.
- **Reports**: Save all outputs to `reports/` folder (profiling, validation).

### 2. Secure Data Access

> **Credentials are stored in `.env`** - never hardcoded.

- **Check Connections**: Run `npx crushdataai connections` first.
- **Missing Data?**: Run `npx crushdataai connect` to add.
- **Discover Schema**: `npx crushdataai schema <connection> [table]`
- **Get Code**: **ALWAYS** use `npx crushdataai snippet <name>` (uses env vars).
- **Load .env**: Ensure `python-dotenv` loads `.env`. Scripts use `os.environ["VAR"]`.
- **Security**: Treat connected data as read-only.

### 2. Search Knowledge Base
```bash
python3 .cursor/commands/../.shared/data-analyst/scripts/search.py "<query>" --domain <domain>
```

Domains: `workflow`, `metric`, `chart`, `sql`, `python`, `validation`

Industry: `--industry saas|ecommerce|finance|marketing`

### 3. Data Profiling (MANDATORY)
```python
print(f"Shape: {df.shape}, Date range: {df['date'].min()} to {df['date'].max()}")
```
Report findings and ask user for confirmation.

### 3b. Data Cleaning & Transformation (ETL)
- **Clean**: Missing values, types, duplicates.
- **Transform**: Standardize formats, create calculated fields.
- **Save**: Scripts go to `etl/` folder.
- **Verify**: Check data again after cleaning.

### 4. Validate Before Delivery
- Check JOINs don't multiply rows unexpectedly
- Verify totals seem reasonable
- Compare to benchmarks
- Present for user validation

### 5. Generate Dashboard Output
After analysis, save for visualization:
```python
from pathlib import Path
import json
from datetime import datetime

Path("reports/dashboards").mkdir(parents=True, exist_ok=True)

dashboard = {
    "metadata": {"title": "Analysis", "generatedAt": datetime.now().isoformat()},
    "kpis": [{"id": "kpi-1", "label": "Total", "value": "$50K", "trend": "+12%"}],
    "charts": [{"id": "chart-1", "type": "line", "title": "Trend", "data": {"labels": ["Jan","Feb"], "datasets": [{"label": "Revenue", "values": [10000,20000]}]}}]
}

    with open("reports/dashboards/dashboard.json", "w") as f:
    json.dump(dashboard, f, indent=2)
```

### 5b. Making Charts Refreshable (Recommended)

To allow the user to refresh data directly from the dashboard:
1. Include a `query` object in the chart definition.
2. Run `npx crushdataai connections` to list available connection names (secure - no passwords shown).
3. Set `connection` to one of the listed names.
4. Set `sql` to the query used to generate the data.

> **SECURITY**: Never read `.env` directly to find connection names. Always use `npx crushdataai connections`.

```json
"query": {
    "connection": "my_postgres_db",
    "sql": "SELECT date, revenue FROM sales WHERE..."
}
```

**Database Specifics:**
- **SQL/Databases**: Provide the full SQL query.
- **Shopify**: Provide the resource name (e.g. `orders`).
- **CSV**: Provide the connection name. `sql` is ignored but required (set to "default").
- **MongoDB**: Provide the collection name in the `sql` field.

**Script-Based Refresh (for Python-aggregated charts):**
```json
"query": { "script": "analysis/my_dashboard_script.py" }
```
Use `script` for Shopify/API charts that need aggregation. CLI re-runs the script on Refresh.

---

## Quick Reference

| Analysis | Search Command |
|----------|---------------|
| EDA | `--domain workflow` "EDA" |
| Metrics | `--domain metric` "churn" |
| SQL patterns | `--domain sql` "cohort" |
| Charts | `--domain chart` "time series" |
| Mistakes | `--domain validation` "duplicate" |
