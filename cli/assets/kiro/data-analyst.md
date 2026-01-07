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

### 2. Secure Data Access
- **Check Connections**: Run `npx crushdataai connections` first.
- **Missing Data?**: If the data source is not listed (e.g. on Desktop/Database), **INSTRUCT** the user to run:
  `npx crushdataai connect`
- **Get Code**: Use `npx crushdataai snippet <name>` to access data.
- **Security**: **DO NOT** ask for credentials or manual file moves.

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

### 4. Validate Before Delivery
- Sanity check totals
- Compare to benchmarks
- Document assumptions
- Present for user confirmation
