#!/usr/bin/env python
# coding: utf-8

# # Reading and Joining CSV Files

# Import necessary libraries
import pandas as pd
import os

# Define the base path
base_path = "../data/"

# Read the CSV files with more flexible parsing options
users_df = pd.read_csv(os.path.join(base_path, "users.csv"), engine='python', on_bad_lines='skip')
products_df = pd.read_csv(os.path.join(base_path, "products.csv"), engine='python', on_bad_lines='skip')
orders_df = pd.read_csv(os.path.join(base_path, "orders.csv"), engine='python', on_bad_lines='skip')
order_items_df = pd.read_csv(os.path.join(base_path, "order_items.csv"), engine='python', on_bad_lines='skip')

# Display the first few rows of each dataframe to understand the structure
print("Users DataFrame:")
print(users_df.head())
print("\nProducts DataFrame:")
print(products_df.head())
print("\nOrders DataFrame:")
print(orders_df.head())
print("\nOrder Items DataFrame:")
print(order_items_df.head())

# Join the dataframes based on foreign key relationships
# 1. Join order_items with products
order_items_with_products = pd.merge(
    order_items_df,
    products_df,
    on="product_id",
    how="left",
    validate="many_to_one"  # Many order items can reference one product
)

# 2. Join orders with users
orders_with_users = pd.merge(
    orders_df,
    users_df,
    on="user_id",
    how="left",
    validate="many_to_one"  # Many orders can be placed by one user
)

# 3. Join order_items_with_products with orders_with_users
complete_df = pd.merge(
    order_items_with_products,
    orders_with_users,
    on="order_id",
    how="left",
    validate="many_to_one"  # Many order items can belong to one order
)

# Display the combined dataframe
print("\nCombined DataFrame:")
print(complete_df.head())

# Display the shape of the combined dataframe
print(f"\nShape of the combined dataframe: {complete_df.shape}")

# Display column names of the combined dataframe
print("\nColumns in the combined dataframe:")
print(complete_df.columns.tolist())

# Create a recommendation model based on user gender
print("\n--- Building Gender-Based Product Recommendation Model ---")

# Step 1: Analyze product purchases by gender
# Group by user_gender and product_id, then count occurrences and sum quantities
gender_product_counts = complete_df.groupby(['user_gender', 'product_id']).agg({
    'quantity_ordered': 'sum',
    'order_item_id': 'count'
}).reset_index()

# Rename columns for clarity
gender_product_counts.columns = ['user_gender', 'product_id', 'total_quantity_ordered', 'purchase_frequency']

# Calculate a popularity score (combining frequency and quantity)
gender_product_counts['popularity_score'] = (
    gender_product_counts['purchase_frequency'] * 0.7 + 
    gender_product_counts['total_quantity_ordered'] * 0.3
)

# Step 2: Get product details for recommendations
# Create a copy to avoid SettingWithCopyWarning
product_details = products_df[['product_id', 'product_name', 'product_category_l1', 'product_brand']].copy()

# Fill missing values with appropriate placeholders
product_details['product_name'] = product_details['product_name'].fillna('Unnamed Product')
product_details['product_category_l1'] = product_details['product_category_l1'].fillna('Uncategorized')
product_details['product_brand'] = product_details['product_brand'].fillna('Unknown Brand')

# Step 3: Merge product details with gender preferences
gender_product_recommendations = pd.merge(
    gender_product_counts,
    product_details,
    on='product_id',
    how='left',
    validate='many_to_one'
)

# Step 4: Create the recommendation model (dictionary)
recommendation_model = {}

# For each gender, get the top products by popularity score
for gender in gender_product_recommendations['user_gender'].unique():
    # Skip if gender is NaN
    if pd.isna(gender):
        continue
        
    # Get products for this gender, sorted by popularity score
    gender_recs = gender_product_recommendations[
        gender_product_recommendations['user_gender'] == gender
    ].sort_values('popularity_score', ascending=False)
    
    # Get top recommendations and ensure no missing values
    top_recs = gender_recs[['product_id', 'product_name', 'product_category_l1', 'popularity_score']].head(10)
    
    # Fill any remaining NaN values
    top_recs['product_name'] = top_recs['product_name'].fillna('Unnamed Product')
    top_recs['product_category_l1'] = top_recs['product_category_l1'].fillna('Uncategorized')
    
    # Store top recommendations for this gender
    recommendation_model[gender] = top_recs

# Display the recommendation model
print("\nRecommendation Model by Gender:")
for gender, recommendations in recommendation_model.items():
    print(f"\nTop recommendations for {gender}:")
    # Format the output to be more readable
    top_recs = recommendations.head(3)
    for _, row in top_recs.iterrows():
        print(f"  - {row['product_name']} (ID: {row['product_id']}) - Category: {row['product_category_l1']}, Score: {row['popularity_score']:.1f}")

# Step 5: Create a function to get recommendations for a given gender
def get_recommendations_by_gender(gender, top_n=3):
    """Get product recommendations for a specific gender.
    
    Args:
        gender (str): The gender to get recommendations for ('Male', 'Female', or 'Other')
        top_n (int): Number of recommendations to return
        
    Returns:
        DataFrame: Top recommended products for the specified gender
    """
    if gender not in recommendation_model:
        print(f"No recommendations available for gender: {gender}")
        return pd.DataFrame()
    
    return recommendation_model[gender].head(top_n)

# Create a more user-friendly function for getting recommendations
def recommend_products_for_gender(gender, top_n=3):
    """A user-friendly function to get product recommendations based on gender.
    
    Args:
        gender (str): The gender to get recommendations for ('Male', 'Female', or 'Other')
        top_n (int): Number of recommendations to return
        
    Returns:
        list: List of dictionaries containing product recommendations
    """
    if gender not in recommendation_model:
        return [{
            'message': f"No recommendations available for gender: {gender}"
        }]
    
    recommendations = recommendation_model[gender].head(top_n)
    result = []
    
    for _, row in recommendations.iterrows():
        result.append({
            'product_id': row['product_id'],
            'product_name': row['product_name'],
            'category': row['product_category_l1'],
            'popularity_score': round(row['popularity_score'], 1)
        })
    
    return result

# Example usage of the recommendation function
print("\n--- Example Recommendations ---")
for gender in ['Male', 'Female', 'Other']:
    print(f"\nRecommended products for {gender}:")
    recs = get_recommendations_by_gender(gender)
    if not recs.empty:
        for _, row in recs.iterrows():
            print(f"  - {row['product_name']} (ID: {row['product_id']}) - Category: {row['product_category_l1']}, Score: {row['popularity_score']:.1f}")

# Demonstrate the user-friendly function
print("\n--- User-Friendly Recommendation Interface ---")
print("\nExample: Getting recommendations for 'Female' gender")
female_recs = recommend_products_for_gender('Female')
for i, rec in enumerate(female_recs, 1):
    print(f"  {i}. {rec['product_name']} - {rec['category']} (Score: {rec['popularity_score']})")

# Show how to use the function in a real application
print("\nExample code for using the recommendation function:")
print("""
# How to use the recommendation model in your application:
import json

# Example: Get recommendations for a specific gender
gender_input = 'Male'  # This could come from a user input form
recommendations = recommend_products_for_gender(gender_input)

# Format as JSON for API response
response = {
    'gender': gender_input,
    'recommendations': recommendations
}

# Print formatted JSON response
print(json.dumps(response, indent=2))
""")

# Actually demonstrate the JSON output
print("\nExample JSON output:")
import json
gender_input = 'Male'
response = {
    'gender': gender_input,
    'recommendations': recommend_products_for_gender(gender_input)
}
print(json.dumps(response, indent=2))

# Save the combined dataframe to a CSV file (optional)
# complete_df.to_csv(os.path.join(base_path, "combined_data.csv"), index=False)
