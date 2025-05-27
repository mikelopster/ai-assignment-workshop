import pandas as pd
from sqlalchemy import create_engine
import psycopg2

# Database connection string
db_url = "<connection string>"

try:
    # Create SQLAlchemy engine
    engine = create_engine(db_url)
    
    # Connect and get list of tables
    with engine.connect() as connection:
        # First, let's check what tables are available
        table_query = """SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'"""
        tables_df = pd.read_sql(table_query, connection)
        print("Available tables:")
        print(tables_df)
        
        # Query the products table
        print("\nQuerying data from table: products")
        data_query = "SELECT * FROM products LIMIT 10;"
        df = pd.read_sql(data_query, connection)
        
        # Display the DataFrame
        print("\nData from PostgreSQL database:")
        print(df)

        # show all columns in df
        print("\nAll columns in DataFrame:")
        print(df.columns)
    
    # Close the connection
    engine.dispose()
    
except Exception as e:
    print(f"Error: {e}")