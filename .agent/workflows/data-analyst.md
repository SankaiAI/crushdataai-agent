---
description: CrushData AI - Data Analyst workflow for structured analysis with validation
---

# CrushData AI - Data Analyst Workflow

A data analyst intelligence workflow that guides you through structured, professional data analysis.

## When to Use

Use this workflow when user requests:
- Data analysis, EDA, ad-hoc queries
- Dashboard or report creation
- Metrics calculation (MRR, churn, conversion, etc.)
- Cohort, funnel, or A/B test analysis
- Data cleaning or profiling

---

## Step 1: Discovery Protocol (MANDATORY)

Before writing any code, ask the user:

1. **Business Context**: What question should this analysis answer? Who is the audience?
2. **Data Context**: Which tables contain the data? What time range?
3. **Metric Definitions**: How does YOUR company define the key metrics? Any filters?

4. **Script Organization**: All analysis scripts must be saved in an `analysis/` folder.
5. **Python Environment**: Check for `venv` or `.venv`. If missing, run `python3 -m venv venv`. Install/Run inside venv.
6. **Reports**: Save all validation/profiling outputs to `reports/` folder. Create if missing.

### 2. Secure Data Access

> **Credentials are stored in `.env`** - never hardcoded.

- **Check Connections**: Run `npx crushdataai connections` first.
- **Missing Data?**: Run `npx crushdataai connect` to add.
- **Discover Schema**: `npx crushdataai schema <connection> [table]`
- **Get Code**: **ALWAYS** use `npx crushdataai snippet <name>` (uses env vars).
- **Load .env**: Ensure `python-dotenv` loads `.env`. Scripts use `os.environ["VAR"]`.
- **Security**: Treat connected data as read-only.

---

## Step 2: Search Knowledge Base

// turbo
```bash
python3 .agent/workflows/../.shared/data-analyst/scripts/search.py "<query>" --domain <domain>
```

**Domains:**
- `workflow` - Step-by-step analysis process
- `metric` - Metric definitions and formulas
- `chart` - Visualization recommendations
- `sql` - SQL patterns (window functions, cohorts)
- `python` - pandas/polars snippets
- `validation` - Common mistakes to avoid

**Industry search:**
// turbo
```bash
python3 .shared/data-analyst/scripts/search.py "<query>" --industry saas|ecommerce|finance|marketing
```

---

## Step 3: Data Profiling (MANDATORY)

Before analysis, run profiling and report to user:

```python
print(f"Shape: {df.shape}")
print(f"Date range: {df['date'].min()} to {df['date'].max()}")
print(f"Missing values:\n{df.isnull().sum()}")
```

72: Ask: "I found X rows, Y users, dates from A to B. Does this match expectation?"
73: 
74: ---
75: 
76: ## Step 3b: Data Cleaning & Transformation (ETL)
77: 
78: Based on profiling findings, perform necessary cleaning BEFORE analysis:
79: - **Handle Missing Values**: Impute or drop based on logic.
80: - **Remove Duplicates**: Check primary keys.
81: - **Fix Data Types**: Ensure dates are datetime objects, numbers are numeric.
82: - **Feature Engineering**: Create calculated fields needed for analysis.
- **Script Location**: Save all cleaning/ETL scripts in `etl/` folder.
83: 
84: ---


## Step 4: Execute with Validation

**Before JOINs:** Run on 100 rows first. Ask if row count change is expected.

**Before Aggregations:** Check for duplicates. Ask if totals seem reasonable.

**Before Delivery:** Compare to benchmarks. Present for user validation.

---

## Search Examples

| Analysis | Command |
|----------|---------|
| EDA workflow | `search.py "EDA" --domain workflow` |
| Churn metrics | `search.py "churn" --domain metric` |
| Cohort SQL | `search.py "cohort" --domain sql` |
| SaaS metrics | `search.py "MRR" --industry saas` |
| Chart selection | `search.py "time series" --domain chart` |

---

## Pre-Delivery Checklist

- [ ] Business question answered
- [ ] Data profiled and validated
- [ ] Metric definitions confirmed with user
- [ ] Sanity checks passed
- [ ] Assumptions documented
