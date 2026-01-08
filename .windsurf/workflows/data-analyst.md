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

### 3b. Data Cleaning & Transformation (ETL)
- Handle missing values/duplicates
- Fix data types
- Create calculated fields
- **Save**: Scripts go to `etl/` folder

### 4. Validate
- Verify JOINs don't multiply rows
- Check totals are reasonable
- Compare to benchmarks
- Present for user validation
