# CrushData AI - Data Analyst Skill

A data analyst intelligence skill that guides you through structured, professional data analysis workflows.

---

## How to Use This Skill

When user requests data analysis work (analyze, query, dashboard, metrics, EDA, cohort, funnel, A/B test), follow this workflow:

### Step 1: Discovery Protocol (MANDATORY)

**Before writing any code, ask the user:**

```
## Discovery Questions

1. **Business Context**
   - What business question should this analysis answer?
   - Who is the audience? (Executive, Analyst, Engineer)
   - What action will this analysis inform?

2. **Data Context**
   - Which tables/databases contain the relevant data?
   - What time range should I analyze?
   - Any known data quality issues?

3. **Metric Definitions**
   - How does YOUR company define the key metrics?
   - Any filters to apply? (exclude test users, internal accounts?)
   - What timezone should I use for dates?
```

### Step 2: Search Relevant Domains

Use `search.py` to gather comprehensive information:

```bash
python3 .claude/skills/data-analyst/scripts/search.py "<query>" --domain <domain> [-n 3]
```

**Available domains:**
| Domain | Use Case |
|--------|----------|
| `workflow` | Step-by-step analysis process |
| `metric` | Metric definitions and formulas |
| `chart` | Visualization recommendations |
| `cleaning` | Data quality patterns |
| `sql` | SQL patterns (window functions, cohorts) |
| `python` | pandas/polars code snippets |
| `database` | PostgreSQL, BigQuery, Snowflake tips |
| `report` | Dashboard UX guidelines |
| `validation` | Common mistakes to avoid |

**Industry-specific search:**
```bash
python3 .claude/skills/data-analyst/scripts/search.py "<query>" --industry saas|ecommerce|finance|marketing
```

**Recommended search order:**
1. `workflow` - Get the step-by-step process for this analysis type
2. `metric` or `--industry` - Get relevant metric definitions
3. `sql` or `python` - Get code patterns for implementation
4. `chart` - Get visualization recommendations
5. `validation` - Check for common mistakes to avoid

### Step 3: Data Profiling (MANDATORY Before Analysis)

Before any analysis, run profiling:

**Python:**
```python
print(f"Shape: {df.shape}")
print(f"Date range: {df['date'].min()} to {df['date'].max()}")
print(f"Missing values:\n{df.isnull().sum()}")
print(f"Sample:\n{df.sample(5)}")
```

**SQL:**
```sql
SELECT 
    COUNT(*) as total_rows,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(date) as min_date,
    MAX(date) as max_date
FROM table;
```

**Report findings to user before proceeding:**
> "I found X rows, Y unique users, date range from A to B. Does this match your expectation?"

### Step 4: Execute Analysis with Validation

**Before JOINs:**
- Run on 100 rows first
- Check: Did row count change unexpectedly?
- Ask: "The join produced X rows from Y. Expected?"

**Before Aggregations:**
- Check for duplicates that could inflate sums
- Verify granularity: "Is this one row per user per day?"
- Ask: "Total = $X. Does this seem reasonable?"

**Before Delivery:**
- Sanity check order of magnitude
- Compare to benchmark or prior period
- Present for user validation before finalizing

---

## Workflow Reference

| Analysis Type | Search Command |
|--------------|----------------|
| EDA | `--domain workflow` query "exploratory data analysis" |
| Dashboard | `--domain workflow` query "dashboard creation" |
| A/B Test | `--domain workflow` query "ab test" |
| Cohort | `--domain workflow` query "cohort analysis" |
| Funnel | `--domain workflow` query "funnel analysis" |
| Time Series | `--domain workflow` query "time series" |
| Segmentation | `--domain workflow` query "customer segmentation" |
| Data Cleaning | `--domain workflow` query "data cleaning" |

---

## Common Rules

1. **Always ask before assuming** - Metric definitions vary by company
2. **Profile data first** - Never aggregate without understanding the data
3. **Validate results** - Check totals, compare to benchmarks
4. **Document assumptions** - State what filters and definitions you used
5. **Show your work** - Explain the logic behind complex queries

---

## Pre-Delivery Checklist

Before presenting final results:

- [ ] Confirmed business question is answered
- [ ] Data was profiled and validated
- [ ] Metric definitions match user's expectations
- [ ] Sanity checks pass (order of magnitude, trends, etc.)
- [ ] Visualizations follow best practices (search `--domain chart`)
- [ ] Assumptions and filters are documented
