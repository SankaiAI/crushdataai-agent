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
```

### What `npm install -g crushdataai` Does

The `-g` flag means **Global Install**:

| | Local Install (`npm install`) | Global Install (`npm install -g`) |
|--|-------------------------------|-----------------------------------|
| **Location** | `./node_modules/` in current folder | System-wide (e.g., `%APPDATA%\npm\`) |
| **Scope** | Only available in that project | Available everywhere on your computer |
| **Use Case** | Libraries for your project | CLI tools you want to run anywhere |

Then in any project:
```bash
cd your-project
crushdataai init --ai all    # All AI IDEs
crushdataai init --ai claude # Claude Code only
```

### What `crushdataai init` Does

When you run `crushdataai init --ai all`, the CLI:

1. **Creates `.shared/data-analyst/`** - Contains the BM25 search engine and 13 CSV knowledge databases (~400 rows of data analyst patterns)

2. **Creates AI IDE config files** based on `--ai` flag:
   | Flag | Creates |
   |------|---------|
   | `--ai claude` | `.claude/skills/data-analyst/SKILL.md` |
   | `--ai cursor` | `.cursor/commands/data-analyst.md` |
   | `--ai windsurf` | `.windsurf/workflows/data-analyst.md` |
   | `--ai antigravity` | `.agent/workflows/data-analyst.md` |
   | `--ai copilot` | `.github/prompts/data-analyst.prompt.md` |
   | `--ai kiro` | `.kiro/steering/data-analyst.md` |
   | `--ai all` | All of the above |

3. **Your AI IDE automatically detects** the config files and enables the `/data-analyst` command

3. **Your AI IDE automatically detects** the config files and enables the `/data-analyst` command

## 🔌 Data Connections (New in v2.0)

CrushData AI now features a **Connection Manager** to securely handle your data credentials.

### 1. Add Data Sources
Run the connect command to open the management UI:

```bash
crushdataai connect
```

- **Supported Types**: CSV, MySQL, PostgreSQL, Shopify, BigQuery, Snowflake
- **Secure**: Credentials are stored locally in `~/.crushdataai/connections.json` and encrypted (future).

> [!NOTE]
> **Persistence**: Once you add a connection, you can **close the UI** (Ctrl+C). The AI IDE reads the saved connection details directly from your local config file, so the server does NOT need to keep running.

### 2. View Saved Connections
```bash
crushdataai connections
```

## 💻 Usage

### Step 1: Initialize
```bash
crushdataai init --ai all
```

### Step 2: Use in AI IDE
The skill activates automatically (Claude) or via slash command (others).

**Example Workflow:**

1. **User Request**: "Analyze the sales trends in `my-shop-data`"
2. **AI Action**: The AI checks your saved connections.
3. **AI Action**: The AI runs:
   ```bash
   npx crushdataai snippet my-shop-data --lang python
   ```
4. **Result**: The AI receives the secure code to connect to your data and proceeds with analysis.

### Claude Code


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
