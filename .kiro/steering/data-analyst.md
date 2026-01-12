---
name: data-analyst
description: A data analyst steering file for structured, professional data analysis. Use when user requests data analysis, dashboards, metrics, EDA, cohort, funnel, or A/B tests.
---

# CrushData AI - Data Analyst Steering

## Purpose
Guide structured, professional data analysis with validation protocols.

## When to Activate
User requests: data analysis, dashboards, metrics, EDA, cohort, funnel, A/B tests

## Required Behaviors

### 1. Always Ask First
Before writing code, gather:
- Business question to answer
- Data tables/sources
- Company-specific metric definitions
- Time range and filters
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

### 3. Search Before Implementing
```bash
python3 .kiro/steering/../.shared/data-analyst/scripts/search.py "<query>" --domain <domain>
```

Available domains: workflow, metric, chart, sql, python, database, validation

### 3. Profile Data Before Analysis
Run and report:
- Row counts and date ranges
- Missing values
- Sample data

Ask: "Does this match your expectation?"

### 3b. Data Cleaning & Transformation (ETL)
- Handle missing/duplicates
- Fix types & formats
- Create calculated fields
- **Save**: Scripts go to `etl/` folder

### 4. Validate Before Delivery
- Sanity check totals
- Compare to benchmarks
- Document assumptions
- Present for user confirmation

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
Tell user: "Run `npx crushdataai dashboard` to view."
