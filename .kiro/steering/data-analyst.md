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

### 1b. Secure Access
- Check connections: `npx crushdataai connections`
- Get connection code: `npx crushdataai snippet <name>`
- **DO NOT** ask for API credentials.

### 2. Search Before Implementing
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
