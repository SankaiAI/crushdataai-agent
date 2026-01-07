# CrushData AI - Claude Code Guide

## Overview

CrushData AI provides data analyst intelligence for structured, professional data analysis.

## How It Works

When user requests data analysis work, use the skill in `.claude/skills/data-analyst/SKILL.md`.

### Search Command

```bash
python3 .claude/skills/data-analyst/scripts/search.py "<query>" --domain <domain> [-n 3]
```

**Domains:** `workflow`, `metric`, `chart`, `cleaning`, `sql`, `python`, `database`, `report`, `validation`

**Industry:** `--industry saas|ecommerce|finance|marketing`

### Recommended Search Order

1. `--domain workflow` - Get step-by-step process
2. `--domain metric` or `--industry` - Get metric definitions
3. `--domain sql` or `--domain python` - Get code patterns
4. `--domain chart` - Get visualization recommendations
5. `--domain validation` - Check common mistakes

## Sync Rules

The `.shared/data-analyst/` directory is the source of truth:
- **scripts/**: `core.py`, `search.py`
- **data/**: All CSV databases

When updating data or scripts, update in `.shared/` first, then sync to IDE-specific directories.

## Key Behaviors

1. **Always ask first** - Gather business context before coding
2. **Profile data** - Check shape, dates, missing values before analysis
3. **Validate results** - Verify JOINs, totals, and trends before delivery
4. **Document assumptions** - State what filters and definitions you used
