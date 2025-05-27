## การทำนาย "สินค้าแนะนำชิ้นถัดไป" สำหรับผู้ใช้แต่ละราย (Predicting User's Next Likely Purchased Product)

- **แนวคิดหลัก:** สร้าง Model ที่สามารถคาดการณ์ "สินค้าชิ้นเดียว" (หรือกลุ่มสินค้า Top-N) ที่ผู้ใช้ (User) คนใดคนหนึ่งมีแนวโน้มที่จะซื้อเป็นลำดับถัดไป...
- **Data:** ข้อมูลพฤติกรรมการใช้งานแพลตฟอร์มอีคอมเมิร์ซแบบครบวงจร...
- **Target:** 
  - ให้แนะนำสินค้า 1-3 อันดับแรก เมื่อใส่ `User Profile` เข้าไป (เช่น `age`, `gender`, `location`, `loyalty_tier`)

## โดยข้อมูลที่มีจะมีตามด้านล่างนี้

### ตารางที่ 1: `users` (ข้อมูลโปรไฟล์ผู้ใช้ - User Profile)
- `user_id` (Primary Key, VARCHAR) - รหัสผู้ใช้
- `user_age_group` (VARCHAR) - กลุ่มอายุ (เช่น '18-24', '25-34', 'Unknown')
- `user_gender` (VARCHAR) - เพศ (เช่น 'Male', 'Female', 'Other', 'Unknown')
- `user_location_city` (VARCHAR) - เมืองที่อยู่
- `user_location_country` (VARCHAR) - ประเทศที่อยู่
- `user_location_segment` (VARCHAR) - กลุ่มพื้นที่ (เช่น 'Urban', 'Suburban', 'Rural')
- `user_signup_date` (DATE) - วันที่สมัครสมาชิก
- `user_signup_device` (VARCHAR) - อุปกรณ์ที่ใช้สมัคร (เช่น 'Desktop', 'Mobile_Android', 'Mobile_iOS')
- `user_loyalty_tier` (VARCHAR) - ระดับสมาชิก (เช่น 'Bronze', 'Silver', 'Gold', 'Platinum')
- `user_primary_language` (VARCHAR) - ภาษาหลักที่ผู้ใช้ตั้งค่า (เช่น 'en', 'th', 'ja')
- `user_explicit_preferred_categories` (TEXT/ARRAY of VARCHAR) - หมวดหมู่สินค้าที่ผู้ใช้ระบุว่าชอบ (ถ้ามีระบบให้ระบุ)

### ตารางที่ 2: `products` (ข้อมูลสินค้า - Product Metadata)
- `product_id` (Primary Key, VARCHAR) - รหัสสินค้า
- `product_name` (TEXT) - ชื่อสินค้า
- `product_description` (TEXT) - รายละเอียดสินค้า
- `product_category_l1` (VARCHAR) - หมวดหมู่หลักระดับ 1
- `product_category_l2` (VARCHAR) - หมวดหมู่ย่อยระดับ 2 (ถ้ามี)
- `product_category_l3` (VARCHAR) - หมวดหมู่ย่อยระดับ 3 (ถ้ามี)
- `product_brand` (VARCHAR) - แบรนด์สินค้า
- `product_current_price` (DECIMAL) - ราคาขายปัจจุบัน
- `product_original_price` (DECIMAL) - ราคาก่อนส่วนลด (ถ้ามี)
- `product_current_discount_percentage` (DECIMAL) - % ส่วนลดปัจจุบัน (คำนวณจาก current & original price)
- `product_tags_keywords` (TEXT/ARRAY of VARCHAR) - แท็กหรือคีย์เวิร์ดของสินค้า
- `product_stock_level` (INTEGER) - จำนวนสินค้าคงคลัง
- `product_release_date` (DATE) - วันที่สินค้าเริ่มวางขาย
- `product_image_url_main` (VARCHAR) - URL รูปภาพหลักของสินค้า
- `product_shipping_weight_kg` (DECIMAL) - น้ำหนักสินค้าสำหรับการขนส่ง
- `product_dimensions_cm` (VARCHAR) - ขนาดสินค้า (เช่น '10x20x5')
- `product_average_rating_received` (DECIMAL) - คะแนนรีวิวเฉลี่ยที่ได้รับจากผู้ใช้
- `product_total_reviews_received` (INTEGER) - จำนวนรีวิวทั้งหมดที่ได้รับ

### ตารางที่ 3: `user_reviews` (ข้อมูลรีวิวสินค้าจากผู้ใช้ - User Generated Content)
- `review_id` (Primary Key, BIGINT/UUID)
- `user_id` (Foreign Key to `users.user_id`, VARCHAR)
- `product_id` (Foreign Key to `products.product_id`, VARCHAR)
- `review_rating` (INTEGER, 1-5) - (อาจจะซ้ำกับ `interaction_value_rating` ในตาราง `interactions` แต่ตารางนี้เน้นเก็บเนื้อหารีวิว)
- `review_text` (TEXT) - เนื้อหาที่ผู้ใช้เขียนรีวิว
- `review_timestamp` (TIMESTAMP)
- `review_upvotes` (INTEGER) - จำนวนคนที่โหวตว่ารีวิวนี้มีประโยชน์
- `review_downvotes` (INTEGER)

### ตารางที่ 4: `orders` (ข้อมูลคำสั่งซื้อหลัก - Order Header)
- `order_id` (Primary Key, VARCHAR/BIGINT) - รหัสคำสั่งซื้อ
- `user_id` (Foreign Key to `users.user_id`, VARCHAR) - รหัสผู้ใช้ที่สั่งซื้อ
- `order_timestamp` (TIMESTAMP) - วันที่-เวลาที่ทำการสั่งซื้อ
- `order_status` (VARCHAR) - สถานะคำสั่งซื้อ (เช่น 'Pending_Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned')
- `order_total_amount_before_discount` (DECIMAL) -ยอดรวมราคาสินค้าทั้งหมดในออเดอร์ก่อนหักส่วนลด
- `order_total_discount_amount` (DECIMAL) - ยอดส่วนลดทั้งหมดที่ใช้ในออเดอร์
- `order_shipping_fee` (DECIMAL) - ค่าจัดส่ง
- `order_final_total_amount` (DECIMAL) - ยอดรวมสุทธิที่ต้องชำระ (`order_total_amount_before_discount` - `order_total_discount_amount` + `order_shipping_fee`)
- `payment_method_used` (VARCHAR) - ช่องทางการชำระเงินที่ใช้ (เช่น 'CreditCard_Visa', 'BankTransfer_KBANK', 'EWallet_PromptPay', 'COD')
- `payment_status` (VARCHAR) - สถานะการชำระเงิน (เช่น 'Paid', 'Unpaid', 'Refunded')
- `shipping_address_city` (VARCHAR)
- `shipping_address_country` (VARCHAR)
- `shipping_address_zipcode` (VARCHAR)
- `estimated_delivery_date` (DATE, Nullable)
- `actual_delivery_date` (DATE, Nullable)
- `promo_code_used` (VARCHAR, Nullable) - รหัสโปรโมชั่นที่ใช้กับออเดอร์นี้
- `session_id_of_order` (Foreign Key to `sessions.session_id`, VARCHAR, Nullable) - Session ที่เกิดการสั่งซื้อ

### ตารางที่ 5: `order_items` (ข้อมูลรายการสินค้าในแต่ละคำสั่งซื้อ - Order Line Items)
- `order_item_id` (Primary Key, BIGINT/UUID) - รหัสรายการสินค้าในออเดอร์
- `order_id` (Foreign Key to `orders.order_id`, VARCHAR/BIGINT) - รหัสคำสั่งซื้อที่รายการนี้อยู่
- `product_id` (Foreign Key to `products.product_id`, VARCHAR) - รหัสสินค้าที่สั่ง
- `quantity_ordered` (INTEGER) - จำนวนชิ้นที่สั่งสำหรับสินค้ารายการนี้
- `price_per_item_at_purchase` (DECIMAL) - ราคาต่อหน่วยของสินค้า ณ เวลาที่ซื้อ (อาจแตกต่างจาก `product_current_price` ในตาราง `products` หากมีการเปลี่ยนแปลงราคา)
- `discount_amount_per_item` (DECIMAL) - ส่วนลดต่อหน่วยสำหรับสินค้ารายการนี้ (ถ้ามี)
- `item_subtotal_amount` (DECIMAL) - ยอดรวมสำหรับสินค้ารายการนี้ (`quantity_ordered` * (`price_per_item_at_purchase` - `discount_amount_per_item`))
- `returned_quantity` (INTEGER, Default 0, Nullable) - จำนวนชิ้นที่ถูกคืน (ถ้ามีการคืนสินค้า)
