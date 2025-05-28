# Data Workshop Assignments

ที่เก็บชุดกิจกรรม Workshop นี้ถูกออกแบบมาเพื่อทดสอบและพัฒนาทักษะของคุณในด้านต่างๆ ที่เกี่ยวข้องกับการวิเคราะห์ข้อมูล, การเขียนโปรแกรมด้วย Pandas, และการเตรียมข้อมูล

Excalidraw:
https://excalidraw.com/#room=75a41d3ac7dcd2369683,6ZK2CTmSWqB4PUGY19TmQA

## Workshop

| Workshop     | หัวข้อ                                                              | รายละเอียด                                                                                                                                                                       |
|--------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Workshop 1   | การแก้โจทย์ปัญหา (Pandas)                                            | ฝึกฝนการแก้โจทย์ปัญหาผ่าน LeetCode ในหมวด pandas                                                                                                                                    |
| Workshop 2   | การวิเคราะห์และตั้งคำถาม (Key Questions & KPIs)                         | เรียนรู้การกำหนดคำถามหลัก (Key Questions) และตัวชี้วัด (KPIs) จากโจทย์ที่กำหนด                                                                                                         |
| Workshop 3.1 | การตั้งค่า API และฐานข้อมูล                                                | ทำความเข้าใจและติดตั้งเครื่องมือสำหรับการเชื่อมต่อ API และฐานข้อมูล PostgreSQL                                                                                                            |
| Workshop 3.2 | การเตรียมข้อมูลและการสร้าง Feature                                      | ปฏิบัติการ Data Cleaning, Feature Engineering, Scaling, Normalization, Aggregation, และ Encoding กับข้อมูล `best-data.csv`                                                         |
| Workshop 4   | การวิเคราะห์และนำเสนอข้อมูลด้วยภาพ                                        | สรุปข้อมูลเชิงสถิติ, ค้นหารูปแบบ (Pattern) จากข้อมูล และนำเสนอผลลัพธ์ในรูปแบบ Visualization                                                                                             |
| Workshop 5   | โจทย์ปัญหา (ตาม Task File)                                             | แก้โจทย์ปัญหาตามรายละเอียดที่ระบุในไฟล์ `workshop-5/task.md`                                                                                                                       |

## Workshop 1: การแก้โจทย์ปัญหา (Pandas)

**วัตถุประสงค์**: ทดลองแก้โจทย์ปัญหาจาก LeetCode ในหมวด pandas โดยเลือกทำ 1 ใน 3 ข้อต่อไปนี้:

- https://leetcode.com/problems/combine-two-tables/description/
- https://leetcode.com/problems/second-highest-salary/description/
- https://leetcode.com/problems/nth-highest-salary/description/

## Workshop 2: การวิเคราะห์และตั้งคำถาม (Key Questions & KPIs)

**วัตถุประสงค์**: ฝึกคิดคำถามหลัก (Key Questions) และตัวชี้วัด (KPIs) จากโจทย์ที่กำหนดให้ในไฟล์ `task.md` โดยมีตัวอย่างคำตอบใน `answer.md`

**ไฟล์ที่เกี่ยวข้อง**:
- `task.md`: โจทย์สำหรับ Workshop นี้
- `answer.md`: ตัวอย่างแนวทางการตอบ

## Workshop 3.1: การตั้งค่า API และฐานข้อมูล

**วัตถุประสงค์**: เตรียมสภาพแวดล้อมสำหรับการทำงานกับ API และฐานข้อมูล PostgreSQL

**ข้อมูล API**:
- `https://6835b940cd78db2058c2da3e.mockapi.io/customers`

**การตั้งค่าฐานข้อมูล (DB Config)**:

**ติดตั้ง Package ที่จำเป็น**:
```shell
pip install pandas sqlalchemy psycopg2-binary
```

**Connection String สำหรับ PostgreSQL**:
```sql
postgresql://postgres:[PASSWORD IN Classroom]@db.ygoengspjgguoibvydgz.supabase.co:5432/postgres
```

## Workshop 3.2: การเตรียมข้อมูลและการสร้าง Feature

**วัตถุประสงค์**: ทำ Data Cleaning กับไฟล์ `best-data.csv` และดำเนินการสร้าง Feature ใหม่, ปรับสเกลข้อมูล, รวมกลุ่มข้อมูล, และเข้ารหัสตัวแปรกลุ่ม

**ขั้นตอนการทำงาน**:

1. **Data Cleaning**:
- ทำความสะอาดข้อมูลใน `best-data.csv`
- ระบุเคสของข้อมูลที่ต้องจัดการ (เช่น missing values, outliers, incorrect data types, inconsistencies)

2. **Feature Engineering (การสร้าง Feature ใหม่)**:
- **`registration_year`, `registration_month`, `registration_day_of_week`**:
  - **โจทย์**: จาก `registration_date` สร้างคอลัมน์ปี, เดือน, และวันในสัปดาห์
  - **เทคนิค**: ใช้ `.dt.year`, `.dt.month`, `.dt.day_name()`
- **`days_since_registration`**:
  - **โจทย์**: คำนวณจำนวนวันที่ลูกค้าเป็นสมาชิกจนถึงปัจจุบัน
  - **เทคนิค**: วันที่ปัจจุบัน - `registration_date`
- **`days_since_last_login`**:
  - **โจทย์**: คำนวณจำนวนวันที่ผ่านไปตั้งแต่ล็อกอินครั้งล่าสุด
  - **เทคนิค**: วันที่ปัจจุบัน - `last_login_date`
- **`age_group_custom`**:
  - **โจทย์**: สร้างกลุ่มอายุแบบกำหนดเองจาก `age`
  - **เทคนิค**: ใช้ `pd.cut()` หรือ `np.select()`
- **`is_long_term_customer`**:
  - **โจทย์**: สร้างคอลัมน์ boolean ระบุลูกค้าสมาชิกระยะยาว (เช่น มากกว่า 1 ปี)
  - **เทคนิค**: ใช้เงื่อนไขกับ `days_since_registration`
- **`email_domain`**:
  - **โจทย์**: สกัด domain จาก `email`
  - **เทคนิค**: ใช้ `.str.split('@').str[1]`
- **`has_notes`**:
  - **โจทย์**: สร้างคอลัมน์ boolean ระบุว่ามีข้อมูลใน `notes` หรือไม่
  - **เทคนิค**: ตรวจสอบค่าที่ไม่ใช่ค่าว่าง
- **`spending_category`**:
  - **โจทย์**: แบ่งกลุ่มลูกค้าตาม `total_spent_thb` (Low, Medium, High Spender)
  - **เทคนิค**: ใช้ `pd.cut()`

3. **Scaling & Normalization (การปรับสเกลข้อมูล)**:
- **`total_spent_thb_scaled` (Min-Max Scaling)**:
  - **โจทย์**: ปรับสเกล `total_spent_thb` ให้อยู่ในช่วง 0 ถึง 1
  - **เทคนิค**: `(X - X_min) / (X_max - X_min)` หรือ `MinMaxScaler`
- **`age_standardized` (Standardization - Z-score)**:
  - **โจทย์**: ปรับสเกล `age` ให้มี mean=0, std=1
  - **เทคนิค**: `(X - mean) / std_dev` หรือ `StandardScaler`

4. **Aggregation & Grouping (การรวมกลุ่มข้อมูล)**:
- **`average_spending_by_city`**:
  - **โจทย์**: คำนวณยอดใช้จ่ายเฉลี่ยต่อ `city`
  - **เทคนิค**: `df.groupby('city')['total_spent_thb'].mean()`
- **`customer_count_by_subscription_tier`**:
  - **โจทย์**: นับจำนวนลูกค้าในแต่ละ `subscription_tier`
  - **เทคนิค**: `df.groupby('subscription_tier')['record_id'].count()` หรือ `df['subscription_tier'].value_counts()`
- **`max_age_by_country`**:
  - **โจทย์**: หาอายุสูงสุดในแต่ละ `country`
  - **เทคนิค**: `df.groupby('country')['age'].max()`
- **`total_active_users_by_month_registration`**:
  - **โจทย์**: สร้าง `registration_month_year` แล้วนับลูกค้า `is_active` ต่อเดือนที่ลงทะเบียน
  - **เทคนิค**: สร้าง feature `registration_month_year` ก่อน แล้ว `df.groupby('registration_month_year')['is_active'].sum()`

5. **Encoding Categorical Variables (การเข้ารหัสตัวแปรกลุ่ม)**:
- **`gender_encoded` (One-Hot Encoding)**:
  - **โจทย์**: แปลง `gender` เป็น One-Hot Encoded columns
  - **เทคนิค**: `pd.get_dummies()`
- **`subscription_tier_ordinal` (Ordinal Encoding)**:
  - **โจทย์**: แปลง `subscription_tier` เป็นตัวเลขตามลำดับความสำคัญ
  - **เทคนิค**: สร้าง mapping dictionary แล้วใช้ `.map()`

## Workshop 4: การวิเคราะห์และนำเสนอข้อมูลด้วยภาพ

**วัตถุประสงค์**: สรุปข้อมูลสถิติ ค้นหารูปแบบ (Pattern) จากข้อมูล และนำเสนอผลลัพธ์ในรูปแบบ Visualization

**สิ่งที่ต้องทำ**:
- สรุปข้อมูลสถิติที่สำคัญจากข้อมูลที่ผ่านการประมวลผล
- ค้นหา Pattern หรือ Insights ที่น่าสนใจในข้อมูล
- นำเสนอผลการวิเคราะห์ด้วย Visualization (เช่น กราฟ, แผนภูมิ)

## Workshop 5: โจทย์ปัญหา (ตาม Task File)

**วัตถุประสงค์**: แก้โจทย์ปัญหาตามที่ระบุในไฟล์ `workshop-5/task.md`

**ไฟล์ที่เกี่ยวข้อง**:
- อ่านโจทย์และรายละเอียดได้ที่ `workshop-5/task.md`