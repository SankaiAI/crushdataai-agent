
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# ==========================================
# 1. LOAD DATA
# ==========================================

def load_data():
    """Lengths and basic info for connected datasets."""
    print("--- Loading Data ---")
    
    # Connection: mrscapybara-shopify-data (Customers)
    clean_customers_path = "C:\\Users\\ariel\\Downloads\\customers_export.csv"
    try:
        customers_df = pd.read_csv(clean_customers_path)
        print(f"Successfully loaded {len(customers_df)} rows from mrscapybara-shopify-data")
    except Exception as e:
        print(f"Error loading mrscapybara-shopify-data: {e}")
        return None, None

    # Connection: shopify-orders
    orders_path = "C:\\Users\\ariel\\Downloads\\orders_export_1.csv"
    try:
        orders_df = pd.read_csv(orders_path)
        print(f"Successfully loaded {len(orders_df)} rows from shopify-orders")
    except Exception as e:
        print(f"Error loading shopify-orders: {e}")
        return None, None
        
    return customers_df, orders_df

# ==========================================
# 2. PROFILE DATA
# ==========================================

def profile_data(customers_df, orders_df):
    print("\n--- Data Profiling ---")
    
    # Orders Profiling
    print("Orders Data Shape:", orders_df.shape)
    if 'Created at' in orders_df.columns:
        orders_df['Created at'] = pd.to_datetime(orders_df['Created at'], errors='coerce')
        print(f"Orders Date Range: {orders_df['Created at'].min()} to {orders_df['Created at'].max()}")
    else:
        print("Warning: 'Created at' column not found in orders.")
        
    print("\nOrders Missing Values (Top 5):")
    print(orders_df.isnull().sum().head())

    # Customers Profiling
    print("\nCustomers Data Shape:", customers_df.shape)
    
    return orders_df

# ==========================================
# 3. CALCULATE CHURN
# ==========================================

def calculate_churn(orders_df):
    print("\n--- Churn Calculation ---")
    
    # Definition: Customers who purchased > 90 days ago but not in last 90 days.
    # Note: Traditional churn is for subscriptions. For E-commerce, it's usually retention based.
    # We will define 'Active' as purchased in last 90 days.
    # We will define 'Churned' as purchased before 90 days ago, but NOT in last 90 days.
    
    # Filter for valid dates
    if 'Created at' not in orders_df.columns:
        print("Cannot calculate churn without date column")
        return

    # Use max date in dataset as 'today' for consistency
    analysis_date = orders_df['Created at'].max()
    cutoff_date = analysis_date - timedelta(days=90)
    
    print(f"Analysis Date: {analysis_date}")
    print(f"90-Day Cutoff: {cutoff_date}")
    
    # Identify customers who bought in the last 90 days
    recent_orders = orders_df[orders_df['Created at'] >= cutoff_date]
    active_customers = set(recent_orders['Email'].dropna().unique())
    print(f"Active Customers (Last 90 days): {len(active_customers)}")
    
    # Identify customers who bought BEFORE the last 90 days
    past_orders = orders_df[orders_df['Created at'] < cutoff_date]
    past_customers = set(past_orders['Email'].dropna().unique())
    print(f"Past Customers (Pre-90 days): {len(past_customers)}")
    
    # Churned = In Past but NOT in Active
    churned_customers = past_customers - active_customers
    churn_count = len(churned_customers)
    
    print(f"Churned Customers: {churn_count}")
    
    # Churn Rate = Churned / Total Dataset Customers (or Total Past Customers?)
    # Standard: Churned / (Active + Churned) i.e. Total qualified base
    base_customers = len(past_customers)
    
    if base_customers > 0:
        churn_rate = (churn_count / base_customers) * 100
        print(f"\nChurn Rate (of past customers): {churn_rate:.2f}%")
        print(f"Interpretation: {churn_rate:.2f}% of customers who bought >90 days ago have not returned in the last 3 months.")
    else:
        print("No past customers to calculate churn from.")

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":
    customers, orders = load_data()
    if customers is not None and orders is not None:
        orders = profile_data(customers, orders)
        calculate_churn(orders)
