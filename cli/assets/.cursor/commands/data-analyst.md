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

---

## Quick Reference

| Analysis | Search Command |
|----------|---------------|
| EDA | `--domain workflow` "EDA" |
| Metrics | `--domain metric` "churn" |
| SQL patterns | `--domain sql` "cohort" |
| Charts | `--domain chart` "time series" |
| Mistakes | `--domain validation` "duplicate" |
