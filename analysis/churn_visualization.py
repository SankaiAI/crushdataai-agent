
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime
import os

def create_churn_chart(active_count, churned_count):
    """Creates a simple bar chart for churn analysis."""
    print("--- Generating Visualization ---")
    
    labels = ['Active Customers', 'Churned Customers']
    values = [active_count, churned_count]
    colors = ['#4CAF50', '#F44336'] # Green, Red

    plt.figure(figsize=(8, 6))
    bars = plt.bar(labels, values, color=colors)
    
    # Add counts on top of bars
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 0.1, int(yval), ha='center', va='bottom', fontweight='bold')
    
    plt.title('Customer Churn Status (90-Day Window)')
    plt.ylabel('Number of Customers')
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # Save the chart
    output_path = "analysis/churn_chart.png"
    plt.savefig(output_path)
    print(f"Chart saved to {output_path}")
    
    # Also show it if possible (or just rely on the saved file)
    # plt.show() 

if __name__ == "__main__":
    # Hardcoded values from previous analysis step for simplicity in this decoupled script
    # Ideally, we would import the logic, but this is a quick viz script.
    active_customers = 1
    churned_customers = 6
    
    create_churn_chart(active_customers, churned_customers)
