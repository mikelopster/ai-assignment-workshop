import csv
import os
from collections import defaultdict

# Define file paths
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
orders_file = os.path.join(base_dir, 'data', 'orders.csv')
order_items_file = os.path.join(base_dir, 'data', 'order_items.csv')
orders_new_file = os.path.join(base_dir, 'data', 'orders_new.csv')

# Read order items data
order_items_data = defaultdict(list)
with open(order_items_file, 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        order_id = row['order_id']
        order_items_data[order_id].append({
            'quantity': int(row['quantity_ordered']),
            'price_per_item': float(row['price_per_item_at_purchase']),
            'discount_per_item': float(row['discount_amount_per_item'])
        })

# Calculate totals for each order
order_calculations = {}
for order_id, items in order_items_data.items():
    # Calculate total amount before discount
    total_before_discount = sum(item['quantity'] * item['price_per_item'] for item in items)
    
    # Calculate total discount amount
    total_discount = sum(item['quantity'] * item['discount_per_item'] for item in items)
    
    order_calculations[order_id] = {
        'order_total_amount_before_discount': total_before_discount,
        'order_total_discount_amount': total_discount
    }

# Read orders data and create new file with corrected values
with open(orders_file, 'r', encoding='utf-8') as infile, open(orders_new_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    for row in reader:
        order_id = row['order_id']
        
        # If we have calculations for this order, update the values
        if order_id in order_calculations:
            # Update with calculated values
            row['order_total_amount_before_discount'] = f"{order_calculations[order_id]['order_total_amount_before_discount']:.2f}"
            row['order_total_discount_amount'] = f"{order_calculations[order_id]['order_total_discount_amount']:.2f}"
            
            # Calculate the final total amount
            shipping_fee = float(row['order_shipping_fee'])
            total_before_discount = order_calculations[order_id]['order_total_amount_before_discount']
            total_discount = order_calculations[order_id]['order_total_discount_amount']
            
            final_total = total_before_discount - total_discount + shipping_fee
            row['order_final_total_amount'] = f"{final_total:.2f}"
        
        writer.writerow(row)

print(f"Processed {len(order_calculations)} orders.")
print(f"New orders file created at: {orders_new_file}")

# Optional: Print a summary of changes
print("\nSummary of recalculated orders:")
with open(orders_file, 'r', encoding='utf-8') as original, open(orders_new_file, 'r', encoding='utf-8') as new:
    original_reader = csv.DictReader(original)
    new_reader = csv.DictReader(new)
    
    original_data = {row['order_id']: row for row in original_reader}
    new_data = {row['order_id']: row for row in new_reader}
    
    for order_id in original_data:
        if order_id in new_data:
            orig = original_data[order_id]
            new = new_data[order_id]
            
            if (orig['order_total_amount_before_discount'] != new['order_total_amount_before_discount'] or
                orig['order_total_discount_amount'] != new['order_total_discount_amount'] or
                orig['order_final_total_amount'] != new['order_final_total_amount']):
                
                print(f"\nOrder ID: {order_id}")
                print(f"  Original total before discount: {orig['order_total_amount_before_discount']}")
                print(f"  Recalculated total before discount: {new['order_total_amount_before_discount']}")
                print(f"  Original total discount: {orig['order_total_discount_amount']}")
                print(f"  Recalculated total discount: {new['order_total_discount_amount']}")
                print(f"  Original final total: {orig['order_final_total_amount']}")
                print(f"  Recalculated final total: {new['order_final_total_amount']}")