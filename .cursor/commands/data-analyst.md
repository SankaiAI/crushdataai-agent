# CrushData AI - Data Analyst Command

A data analyst intelligence command that guides you through structured, professional data analysis.

## When to Use

Activate this command when user requests data analysis, dashboards, metrics, EDA, cohort/funnel analysis, or A/B testing.

---

## Workflow

### 1. Discovery (MANDATORY)
Before coding, ask:
- What business question should this answer?
- Which tables contain the data?
- How does YOUR company define the key metrics?

3. **Secure Access**:
   - Check connections: `npx crushdataai connections`
   - Get connection code: `npx crushdataai snippet <name>`
   - **DO NOT** ask for API credentials.

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
