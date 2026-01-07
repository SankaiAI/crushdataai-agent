#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CrushData AI Search - CLI entry point for data analyst search
Usage: python search.py "<query>" [--domain <domain>] [--industry <industry>] [--max-results 3]

Domains: workflow, metric, chart, cleaning, sql, python, database, report, validation
Industries: saas, ecommerce, finance, marketing
"""

import argparse
from core import CSV_CONFIG, AVAILABLE_INDUSTRIES, MAX_RESULTS, search, search_industry


def format_output(result):
    """Format results for AI consumption (token-optimized)"""
    if "error" in result:
        return f"Error: {result['error']}"

    output = []
    if result.get("industry"):
        output.append(f"## CrushData AI Industry Metrics")
        output.append(f"**Industry:** {result['industry']} | **Query:** {result['query']}")
    else:
        output.append(f"## CrushData AI Search Results")
        output.append(f"**Domain:** {result['domain']} | **Query:** {result['query']}")
    output.append(f"**Source:** {result['file']} | **Found:** {result['count']} results\n")

    for i, row in enumerate(result['results'], 1):
        output.append(f"### Result {i}")
        for key, value in row.items():
            value_str = str(value)
            if len(value_str) > 300:
                value_str = value_str[:300] + "..."
            output.append(f"- **{key}:** {value_str}")
        output.append("")

    return "\n".join(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CrushData AI Search")
    parser.add_argument("query", help="Search query")
    parser.add_argument("--domain", "-d", choices=list(CSV_CONFIG.keys()), help="Search domain")
    parser.add_argument("--industry", "-i", choices=AVAILABLE_INDUSTRIES, help="Industry-specific search (saas, ecommerce, finance, marketing)")
    parser.add_argument("--max-results", "-n", type=int, default=MAX_RESULTS, help="Max results (default: 3)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    # Industry search takes priority
    if args.industry:
        result = search_industry(args.query, args.industry, args.max_results)
    else:
        result = search(args.query, args.domain, args.max_results)

    if args.json:
        import json
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(format_output(result))
