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

### 1b. Secure Access
- Check connections: `npx crushdataai connections`
- Get connection code: `npx crushdataai snippet <name>`
- **DO NOT** ask for API credentials.

### 2. Search Knowledge
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
