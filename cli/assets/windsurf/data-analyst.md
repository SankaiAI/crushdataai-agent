# CrushData AI - Data Analyst Workflow

A data analyst intelligence workflow for structured, professional data analysis.

## Trigger
Activate when user requests: data analysis, dashboards, metrics, EDA, cohort, funnel, or A/B tests.

## Workflow

### 1. Discovery (MANDATORY)
Ask before coding:
- Business question this analysis should answer
- Which tables/databases contain the data
- Company-specific metric definitions

### 2. Secure Data Access
- **Check Connections**: Run `npx crushdataai connections` first.
- **Missing Data?**: If the data source is not listed (e.g. on Desktop/Database), **INSTRUCT** the user to run:
  `npx crushdataai connect`
- **Get Code**: Use `npx crushdataai snippet <name>` to access data.
- **Security**: **DO NOT** ask for credentials or manual file moves.

### 3. Search Knowledge
```bash
python3 .windsurf/workflows/../.shared/data-analyst/scripts/search.py "<query>" --domain <domain>
```

Domains: `workflow`, `metric`, `chart`, `sql`, `python`, `database`, `validation`

Industry: `--industry saas|ecommerce|finance|marketing`

### 3. Profile Data (MANDATORY)
Run profiling before any analysis:
```python
print(f"Shape: {df.shape}, Dates: {df['date'].min()} to {df['date'].max()}")
```

### 4. Validate
- Verify JOINs don't multiply rows
- Check totals are reasonable
- Compare to benchmarks
- Present for user validation
