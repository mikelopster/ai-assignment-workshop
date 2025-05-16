#!/bin/bash

# --- โจทย์: แสดง Binary Tree ด้วย Shell Script (รูปแบบโครงสร้างซ้าย-ขวา) ---
#
# เป้าหมาย:
# เขียน Shell script ที่รับข้อมูล Node ของ Binary Tree (ในรูปแบบ Level-Order)
# และแสดงผลโครงสร้าง Tree ออกมาทางหน้าจอในรูปแบบที่เห็นการเชื่อมโยงซ้าย-ขวา
#
# Input:
# ข้อมูล Node จะถูกกำหนดไว้ในตัวแปร TREE_NODES ด้านล่าง
# เป็น String ที่มีเลข Node คั่นด้วยช่องว่าง โดยเรียงตามลำดับ Level-Order
# (เช่น "1 2 3 4 5 6 7" หมายถึง Root คือ 1, Level ถัดไปคือ 2 และ 3, ...)
# เราจะสมมติว่าเป็น Complete Binary Tree หรือ เกือบ Complete เพื่อความง่าย
#
# Output ที่คาดหวัง (แสดงใน Comment ด้านล่าง):
# ให้แสดงผล Tree โดย Root อยู่บนสุด และมี Node ลูกทางซ้ายและขวาอยู่ด้านล่าง
# ใช้ช่องว่างและเครื่องหมาย (เช่น / \) เพื่อช่วยในการแสดงโครงสร้าง

# --- Input Data ---
# ตัวอย่าง Input ที่ใช้แสดงผลด้านล่าง (อาจจะใหญ่เกินไปสำหรับแสดงผลสวยงามใน Shell แคบๆ)
TREE_NODES="1 2 3 4 5 6 7 8 9 10 11 12 13 14 15"
# ตัวอย่าง Input ที่เล็กกว่า อาจจะเห็นภาพง่ายขึ้น
# TREE_NODES="1 2 3 4 5 6 7"

echo "Input Nodes (Level-Order): $TREE_NODES"
echo "-------------------------------------"
echo "Expected Output Structure (Conceptual):"
echo ""

# --- Expected Output Visualization (ผลลัพธ์ที่อยากให้แสดง) ---
# หมายเหตุ: การสร้าง Output แบบนี้ให้สวยงามใน Shell Script อย่างเดียว
# นั้นท้าทายมากเรื่องการคำนวณตำแหน่งและช่องว่าง
# ตัวอย่างด้านล่างเป็นเพียงแนวคิด อาจจะต้องปรับการเว้นวรรค
#
#                 1
#                / \
#               /   \
#              /     \
#             2       3
#            / \     / \
#           /   \   /   \
#          4     5 6     7
#         / \   / \ / \   / \
#        8  9 10 11 12 13 14 15
#
# (หรือสำหรับ Input "1 2 3 4 5 6 7")
#
#           1
#          / \
#         /   \
#        2     3
#       / \   / \
#      4   5 6   7
#
# ----------------------------------------------------------

# ตัวอย่างการแปลง String เป็น Array (Bash)
nodes=($TREE_NODES)

# IMPLEMENTATION:
echo "TODO: Implement tree printing logic here using the 'nodes' array."
echo "(Note: This is significantly more complex than the previous indented list format in shell scripting.)"




exit 0