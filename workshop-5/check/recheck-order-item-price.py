import csv
import os
from decimal import Decimal, getcontext

# Set precision for Decimal calculations
getcontext().prec = 10

# Define the paths to the CSV files
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
order_items_file = os.path.join(current_dir, 'data', 'order_items.csv')
order_items_new_file = os.path.join(current_dir, 'data', 'order_items_new.csv')

# Function to check if item_subtotal_amount is correctly calculated
def check_item_subtotal_calculation():
    errors = []
    
    with open(order_items_file, 'r') as file:
        reader = csv.DictReader(file)
        
        for row_num, row in enumerate(reader, start=2):  # Start from 2 to account for header row
            # Skip header rows that might appear in the middle of the file
            if row['order_id'] == 'order_id':
                continue
                
            try:
                # Extract values from the row
                order_item_id = row['order_item_id']
                order_id = row['order_id']
                quantity = Decimal(row['quantity_ordered'])
                price_per_item = Decimal(row['price_per_item_at_purchase'])
                discount_per_item = Decimal(row['discount_amount_per_item'])
                reported_subtotal = Decimal(row['item_subtotal_amount'])
                
                # Calculate the expected subtotal
                expected_subtotal = quantity * (price_per_item - discount_per_item)
                
                # Round to 2 decimal places for comparison
                expected_subtotal = expected_subtotal.quantize(Decimal('0.01'))
                reported_subtotal = reported_subtotal.quantize(Decimal('0.01'))
                
                # Check if the calculated subtotal matches the reported subtotal
                if expected_subtotal != reported_subtotal:
                    errors.append({
                        'row_num': row_num,
                        'order_item_id': order_item_id,
                        'order_id': order_id,
                        'expected_subtotal': expected_subtotal,
                        'reported_subtotal': reported_subtotal,
                        'difference': reported_subtotal - expected_subtotal,
                        'calculation': f"{quantity} * ({price_per_item} - {discount_per_item}) = {expected_subtotal}"
                    })
            except Exception as e:
                print(f"Error processing row {row_num}: {e}")
    
    return errors

# Function to create a new CSV file with corrected item_subtotal_amount values
def create_corrected_csv():
    # Read the original file and store all rows
    all_rows = []
    headers = []
    has_header = False
    
    with open(order_items_file, 'r') as file:
        reader = csv.reader(file)
        
        for row in reader:
            if not has_header:
                headers = row
                has_header = True
            else:
                all_rows.append(row)
    
    # Filter out any duplicate headers that might appear in the middle of the file
    all_rows = [row for row in all_rows if row[1] != 'order_id']
    
    # Sort the rows by order_id from lowest to highest
    all_rows.sort(key=lambda row: row[1])
    
    # Create a new CSV file with corrected values and regenerated order_item_ids
    with open(order_items_new_file, 'w', newline='') as file:
        writer = csv.writer(file)
        
        # Write the header row
        writer.writerow(headers)
        
        # Process each row, correct item_subtotal_amount, and regenerate order_item_id
        for index, row in enumerate(all_rows, start=1):
            try:
                # Generate new order_item_id starting from OI00001
                new_order_item_id = f"OI{index:05d}"
                
                # Extract values from the row
                order_id = row[1]
                product_id = row[2]
                quantity = Decimal(row[3])
                price_per_item = Decimal(row[4])
                discount_per_item = Decimal(row[5])
                returned_quantity = row[7]
                
                # Calculate the correct subtotal
                correct_subtotal = quantity * (price_per_item - discount_per_item)
                
                # Round to 2 decimal places
                correct_subtotal = correct_subtotal.quantize(Decimal('0.01'))
                
                # Create a new row with the regenerated order_item_id and corrected subtotal
                new_row = [
                    new_order_item_id,
                    order_id,
                    product_id,
                    str(quantity),
                    str(price_per_item),
                    str(discount_per_item),
                    str(correct_subtotal),
                    returned_quantity
                ]
                
                writer.writerow(new_row)
            except Exception as e:
                print(f"Error processing row {row}: {e}")
                # If there's an error, write the original row with a regenerated order_item_id
                row[0] = f"OI{index:05d}"
                writer.writerow(row)
    
    print(f"Created new CSV file with corrected values at: {order_items_new_file}")
    return order_items_new_file

# Execute the check and print the results
if __name__ == "__main__":
    print("Checking item_subtotal_amount calculations...")
    errors = check_item_subtotal_calculation()
    
    if not errors:
        print("All item_subtotal_amount values are correctly calculated!")
    else:
        print(f"Found {len(errors)} items with incorrect subtotal calculations:")
        print("-" * 100)
        print(f"{'ROW':<5} {'ORDER ITEM ID':<15} {'ORDER ID':<10} {'EXPECTED':<15} {'REPORTED':<15} {'DIFFERENCE':<15} {'CALCULATION':<30}")
        print("-" * 100)
        
        for error in errors:
            print(f"{error['row_num']:<5} {error['order_item_id']:<15} {error['order_id']:<10} "
                  f"{error['expected_subtotal']:<15} {error['reported_subtotal']:<15} "
                  f"{error['difference']:<15} {error['calculation']:<30}")
    
    # Always create a new CSV file with sorted order_ids and regenerated order_item_ids
    print("\nCreating a new CSV file with sorted order_ids and regenerated order_item_ids...")
    new_file_path = create_corrected_csv()
    print(f"Done! New file created at: {new_file_path}")

