#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CrushData AI Core - BM25 search engine for data analyst workflows
"""

import csv
import re
from pathlib import Path
from math import log
from collections import defaultdict

# ============ CONFIGURATION ============
DATA_DIR = Path(__file__).parent.parent / "data"
MAX_RESULTS = 3

CSV_CONFIG = {
    "workflow": {
        "file": "workflows.csv",
        "search_cols": ["Workflow Name", "Step Name", "Description", "Questions to Ask"],
        "output_cols": ["Workflow Name", "Step Number", "Step Name", "Description", "Questions to Ask", "Tools/Commands", "Outputs", "Common Mistakes"]
    },
    "metric": {
        "file": "metrics.csv",
        "search_cols": ["Metric Name", "Abbreviation", "Industry", "Interpretation"],
        "output_cols": ["Metric Name", "Abbreviation", "Industry", "Formula", "Interpretation", "Good Benchmark", "Related Metrics", "Visualization"]
    },
    "chart": {
        "file": "charts.csv",
        "search_cols": ["Chart Type", "Best For", "Data Type", "Comparison Type"],
        "output_cols": ["Chart Type", "Best For", "Data Type", "Comparison Type", "Python Code", "Color Guidance", "Accessibility", "Dashboard Tip"]
    },
    "cleaning": {
        "file": "cleaning.csv",
        "search_cols": ["Issue Type", "Detection Method", "Solution"],
        "output_cols": ["Issue Type", "Detection Method", "Solution", "Python Code", "SQL Code", "Impact"]
    },
    "sql": {
        "file": "sql-patterns.csv",
        "search_cols": ["Pattern Name", "Use Case", "SQL Code"],
        "output_cols": ["Pattern Name", "Use Case", "SQL Code", "PostgreSQL", "BigQuery", "Performance"]
    },
    "python": {
        "file": "python-patterns.csv",
        "search_cols": ["Pattern Name", "Use Case", "pandas Code"],
        "output_cols": ["Pattern Name", "Use Case", "pandas Code", "polars Code", "Performance"]
    },
    "database": {
        "file": "databases.csv",
        "search_cols": ["Database", "Category", "Guideline", "Do", "Don't"],
        "output_cols": ["Database", "Category", "Guideline", "Do", "Don't", "Code Example"]
    },
    "report": {
        "file": "report-ux.csv",
        "search_cols": ["Category", "Guideline", "Do", "Don't"],
        "output_cols": ["Category", "Guideline", "Do", "Don't", "Example"]
    },
    "validation": {
        "file": "validation.csv",
        "search_cols": ["Mistake Type", "Description", "Symptoms"],
        "output_cols": ["Mistake Type", "Description", "Symptoms", "Prevention Query", "User Question"]
    }
}

INDUSTRY_CONFIG = {
    "saas": {"file": "industries/saas.csv"},
    "ecommerce": {"file": "industries/ecommerce.csv"},
    "finance": {"file": "industries/finance.csv"},
    "marketing": {"file": "industries/marketing.csv"}
}

# Common columns for all industry files
_INDUSTRY_COLS = {
    "search_cols": ["Metric Name", "Abbreviation", "Category", "Interpretation"],
    "output_cols": ["Metric Name", "Abbreviation", "Category", "Formula", "Interpretation", "Good Benchmark", "Related Metrics", "Visualization"]
}

AVAILABLE_INDUSTRIES = list(INDUSTRY_CONFIG.keys())


# ============ BM25 IMPLEMENTATION ============
class BM25:
    """BM25 ranking algorithm for text search"""

    def __init__(self, k1=1.5, b=0.75):
        self.k1 = k1
        self.b = b
        self.corpus = []
        self.doc_lengths = []
        self.avgdl = 0
        self.idf = {}
        self.doc_freqs = defaultdict(int)
        self.N = 0

    def tokenize(self, text):
        """Lowercase, split, remove punctuation, filter short words"""
        text = re.sub(r'[^\w\s]', ' ', str(text).lower())
        return [w for w in text.split() if len(w) > 2]

    def fit(self, documents):
        """Build BM25 index from documents"""
        self.corpus = [self.tokenize(doc) for doc in documents]
        self.N = len(self.corpus)
        if self.N == 0:
            return
        self.doc_lengths = [len(doc) for doc in self.corpus]
        self.avgdl = sum(self.doc_lengths) / self.N

        for doc in self.corpus:
            seen = set()
            for word in doc:
                if word not in seen:
                    self.doc_freqs[word] += 1
                    seen.add(word)

        for word, freq in self.doc_freqs.items():
            self.idf[word] = log((self.N - freq + 0.5) / (freq + 0.5) + 1)

    def score(self, query):
        """Score all documents against query"""
        query_tokens = self.tokenize(query)
        scores = []

        for idx, doc in enumerate(self.corpus):
            score = 0
            doc_len = self.doc_lengths[idx]
            term_freqs = defaultdict(int)
            for word in doc:
                term_freqs[word] += 1

            for token in query_tokens:
                if token in self.idf:
                    tf = term_freqs[token]
                    idf = self.idf[token]
                    numerator = tf * (self.k1 + 1)
                    denominator = tf + self.k1 * (1 - self.b + self.b * doc_len / self.avgdl)
                    score += idf * numerator / denominator

            scores.append((idx, score))

        return sorted(scores, key=lambda x: x[1], reverse=True)


# ============ SEARCH FUNCTIONS ============
def _load_csv(filepath):
    """Load CSV and return list of dicts"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def _search_csv(filepath, search_cols, output_cols, query, max_results):
    """Core search function using BM25"""
    if not filepath.exists():
        return []

    data = _load_csv(filepath)

    # Build documents from search columns
    documents = [" ".join(str(row.get(col, "")) for col in search_cols) for row in data]

    # BM25 search
    bm25 = BM25()
    bm25.fit(documents)
    ranked = bm25.score(query)

    # Get top results with score > 0
    results = []
    for idx, score in ranked[:max_results]:
        if score > 0:
            row = data[idx]
            results.append({col: row.get(col, "") for col in output_cols if col in row})

    return results


def detect_domain(query):
    """Auto-detect the most relevant domain from query"""
    query_lower = query.lower()

    domain_keywords = {
        "workflow": ["workflow", "process", "step", "eda", "dashboard", "cohort", "funnel", "analysis", "pipeline"],
        "metric": ["metric", "kpi", "mrr", "arr", "churn", "cac", "ltv", "conversion", "rate", "ratio"],
        "chart": ["chart", "graph", "visualization", "plot", "bar", "line", "pie", "heatmap", "scatter"],
        "cleaning": ["clean", "missing", "null", "duplicate", "outlier", "impute", "data quality"],
        "sql": ["sql", "query", "join", "window", "aggregate", "cte", "subquery", "partition"],
        "python": ["python", "pandas", "polars", "dataframe", "pivot", "groupby", "merge"],
        "database": ["postgres", "bigquery", "snowflake", "mysql", "database", "connection", "warehouse"],
        "report": ["dashboard", "report", "layout", "ux", "design", "color", "visual"],
        "validation": ["mistake", "error", "sanity", "check", "validate", "verify", "wrong"]
    }

    scores = {domain: sum(1 for kw in keywords if kw in query_lower) for domain, keywords in domain_keywords.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "workflow"


def search(query, domain=None, max_results=MAX_RESULTS):
    """Main search function with auto-domain detection"""
    if domain is None:
        domain = detect_domain(query)

    config = CSV_CONFIG.get(domain, CSV_CONFIG["workflow"])
    filepath = DATA_DIR / config["file"]

    if not filepath.exists():
        return {"error": f"File not found: {filepath}", "domain": domain}

    results = _search_csv(filepath, config["search_cols"], config["output_cols"], query, max_results)

    return {
        "domain": domain,
        "query": query,
        "file": config["file"],
        "count": len(results),
        "results": results
    }


def search_industry(query, industry, max_results=MAX_RESULTS):
    """Search industry-specific metrics"""
    if industry not in INDUSTRY_CONFIG:
        return {"error": f"Unknown industry: {industry}. Available: {', '.join(AVAILABLE_INDUSTRIES)}"}

    filepath = DATA_DIR / INDUSTRY_CONFIG[industry]["file"]

    if not filepath.exists():
        return {"error": f"Industry file not found: {filepath}", "industry": industry}

    results = _search_csv(filepath, _INDUSTRY_COLS["search_cols"], _INDUSTRY_COLS["output_cols"], query, max_results)

    return {
        "domain": "industry",
        "industry": industry,
        "query": query,
        "file": INDUSTRY_CONFIG[industry]["file"],
        "count": len(results),
        "results": results
    }
