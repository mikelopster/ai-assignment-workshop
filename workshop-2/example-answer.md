
## User Story

EN Version

```
As a Marketing Manager,
I want to generate and view the "Segment Purchase Behavior Summary Report" through an interactive UI, with options to select the reporting period and export the report to Excel,
So that I can easily access and analyze key purchasing behaviors and preferences of different customer segments to inform my marketing strategies and product merchandising decisions.
```

TH Version

```
ในฐานะ ผู้จัดการฝ่ายการตลาด (Marketing Manager),
ฉันต้องการ สร้างและดู "รายงานสรุปพฤติกรรมการซื้อตามกลุ่มลูกค้า" (Segment Purchase Behavior Summary Report) ผ่านหน้าจอผู้ใช้งาน (UI) ที่โต้ตอบได้ โดยมีตัวเลือกให้สามารถเลือกระยะเวลาของรายงาน และส่งออกรายงานเป็นไฟล์ Excel ได้,
เพื่อที่ฉันจะ สามารถเข้าถึงและวิเคราะห์พฤติกรรมการซื้อและความสนใจที่สำคัญของลูกค้าแต่ละกลุ่มได้อย่างสะดวก เพื่อนำข้อมูลไปใช้ประกอบการตัดสินใจในการวางแผนกลยุทธ์การตลาดและการจัดวางสินค้า
```

## Acceptance Criteria
- AC1: รายชื่อลูกค้าเป้าหมายต้องประกอบด้วย Customer ID, Segment ของลูกค้า, และเหตุผล/เกณฑ์ที่ทำให้ลูกค้าถูกเลือก (อ้างอิง FR06.2)
- AC2: เกณฑ์ในการเลือกลูกค้าเป้าหมายสามารถกำหนดและปรับเปลี่ยนได้ผ่านระบบ (ตาม FR05.2) เช่น:
  - เลือกจากกลุ่มลูกค้า (Segment) ที่กำหนด
  - เลือกจากหมวดหมู่ร้านค้า (MCC) ที่ใช้จ่ายบ่อย/ยอดใช้จ่ายสูง
  - เลือกจากประเภทค่าธรรมเนียมที่จ่าย
  - สามารถผสมผสานเกณฑ์ต่างๆ เข้าด้วยกันได้
- AC3: รายชื่อลูกค้าเป้าหมายสามารถ Export ออกมาเป็นไฟล์ CSV หรือ Excel ได้ (ตาม FR06.3)
- AC4: ระบบสามารถประมวลผลและสร้างรายชื่อนี้ได้ภายในระยะเวลาที่กำหนด (เช่น รายวัน/รายสัปดาห์ ตาม NFR01 และ RPT02)
- AC5: ผลลัพธ์ที่ได้มีความถูกต้อง แม่นยำ ตรงตามเกณฑ์ที่ระบุ (ตาม NFR03)
