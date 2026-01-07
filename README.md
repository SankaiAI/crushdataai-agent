# CrushData AI

**Data Analyst Intelligence for AI IDEs**

An AI skill that provides structured, professional data analysis workflows with built-in validation - helping AI coding assistants perform data analysis like a careful human analyst.

## 🎯 What It Does

CrushData AI provides:
- **10 Analysis Workflows** - EDA, Dashboard, A/B Test, Cohort, Funnel, Time Series, Segmentation, Data Cleaning, Ad-hoc, KPI Reporting
- **400+ Searchable Patterns** - Metrics, SQL, Python, Charts, Database Tips, Common Mistakes
- **Context-Building Protocol** - Forces AI to ask questions and validate before delivering results
- **4 Industry Modules** - SaaS, E-commerce, Finance, Marketing specific metrics

## 🚀 Quick Start

### Install via CLI

```bash
npm install -g crushdataai

cd your-project
crushdataai init --ai all  # All AI IDEs
# or specific: crushdataai init --ai claude
```

### Manual Install

Copy the relevant folders to your project:
- `.claude/skills/data-analyst/` - Claude Code
- `.cursor/commands/` - Cursor
- `.agent/workflows/` - Antigravity
- `.windsurf/workflows/` - Windsurf
- `.github/prompts/` - GitHub Copilot
- `.kiro/steering/` - Kiro
- `.shared/data-analyst/` - Shared scripts and data (required)

## 💻 Usage

### Claude Code

The skill activates automatically when you request data analysis work. Just chat naturally:

```
Analyze customer churn for my SaaS product
```

### Cursor / Windsurf / Antigravity

Use the slash command to invoke the skill:

```
/data-analyst Analyze customer churn for my SaaS product
```

### Kiro

Type `/` in chat to see available commands, then select `data-analyst`:

```
/data-analyst Analyze customer churn for my SaaS product
```

### GitHub Copilot

In VS Code with Copilot, type `/` in chat to see available prompts, then select `data-analyst`:

```
/data-analyst Analyze customer churn for my SaaS product
```

### Example Prompts

```
Analyze customer churn for my SaaS product
Create a dashboard for e-commerce analytics
Calculate MRR and ARR from subscription data
Build a cohort retention analysis
Perform A/B test analysis on conversion rates
```

### Search Directly
```bash
# Search workflows
python3 .shared/data-analyst/scripts/search.py "EDA" --domain workflow

# Search metrics
python3 .shared/data-analyst/scripts/search.py "churn" --domain metric

# Search SQL patterns
python3 .shared/data-analyst/scripts/search.py "cohort" --domain sql

# Industry-specific
python3 .shared/data-analyst/scripts/search.py "MRR" --industry saas
```

## 📊 Search Domains

| Domain | Content |
|--------|---------|
| `workflow` | Step-by-step analysis processes |
| `metric` | Metric definitions with formulas |
| `chart` | Visualization recommendations |
| `cleaning` | Data quality patterns |
| `sql` | SQL patterns (window functions, cohorts) |
| `python` | pandas/polars code snippets |
| `database` | PostgreSQL, BigQuery, Snowflake tips |
| `report` | Dashboard UX guidelines |
| `validation` | Common mistakes to avoid |

## 🏭 Industry Modules

| Industry | Key Metrics |
|----------|-------------|
| `saas` | MRR, ARR, Churn, CAC, LTV, NRR |
| `ecommerce` | Conversion, AOV, Cart Abandonment |
| `finance` | Margins, ROI, Cash Flow, Ratios |
| `marketing` | CTR, CPA, ROAS, Lead Conversion |

## 🔒 How It Works

### Context-Building Protocol

1. **Discovery** - AI asks about business context before coding
2. **Data Profiling** - Mandatory checks before analysis
3. **Validation** - Verify JOINs, aggregations, and totals
4. **Sanity Checks** - Compare to benchmarks before delivery

This prevents the common AI mistakes:
- ❌ Wrong metric definitions
- ❌ Duplicate row inflation
- ❌ Incorrect JOIN types
- ❌ Unreasonable totals

## 📝 License

Apache 2.0
