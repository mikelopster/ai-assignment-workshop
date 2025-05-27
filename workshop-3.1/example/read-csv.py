import pandas as pd

# URL of the CSV file
url = 'https://raw.githubusercontent.com/mikelopster/ai-assignment-workshop/refs/heads/main/workshop-3.1/transactions.csv'

# Read the CSV file into a DataFrame
df = pd.read_csv(url)

# Display the DataFrame
print("DataFrame from CSV:")
print(df)

# Display basic information about the DataFrame
print("\nDataFrame Info:")
print(f"Shape: {df.shape}")
print("\nData Types:")
print(df.dtypes)

# Display summary statistics
print("\nSummary Statistics:")
print(df.describe())
