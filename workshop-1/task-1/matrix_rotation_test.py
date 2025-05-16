import unittest

try:
    from matrix_rotation import rotate_matrix
except ImportError:
    print("Warning: Could not import 'rotate_matrix' from 'matrix_rotation.py'. Using dummy function.")
    print("Please create 'matrix_rotation.py' with the 'rotate_matrix' function.")
    def rotate_matrix(matrix):
        # implement here
        return None


class TestRotateMatrix(unittest.TestCase):

    def test_empty_matrix(self):
        """ทดสอบกรณี Matrix ว่างเปล่า"""
        matrix = []
        expected = []
        self.assertEqual(rotate_matrix(matrix), expected, "Should handle empty matrix")

    def test_1x1_matrix(self):
        """ทดสอบกรณี Matrix ขนาด 1x1"""
        matrix = [[1]]
        expected = [[1]]
        self.assertEqual(rotate_matrix(matrix), expected, "Should handle 1x1 matrix")

    def test_2x2_matrix(self):
        """ทดสอบกรณี Matrix ขนาด 2x2"""
        matrix = [
            [1, 2],
            [3, 4]
        ]
        expected = [
            [3, 1],
            [4, 2]
        ]
        self.assertEqual(rotate_matrix(matrix), expected, "Should rotate 2x2 matrix correctly")

    def test_3x3_matrix(self):
        """ทดสอบกรณี Matrix ขนาด 3x3"""
        matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        expected = [
            [7, 4, 1],
            [8, 5, 2],
            [9, 6, 3]
        ]
        self.assertEqual(rotate_matrix(matrix), expected, "Should rotate 3x3 matrix correctly")

    def test_4x4_matrix(self):
        """ทดสอบกรณี Matrix ขนาด 4x4"""
        matrix = [
            [ 5,  1,  9, 11],
            [ 2,  4,  8, 10],
            [13,  3,  6,  7],
            [15, 14, 12, 16]
        ]
        expected = [
            [15, 13,  2,  5],
            [14,  3,  4,  1],
            [12,  6,  8,  9],
            [16,  7, 10, 11]
        ]
        self.assertEqual(rotate_matrix(matrix), expected, "Should rotate 4x4 matrix correctly")

    def test_matrix_with_different_values(self):
        """ทดสอบ Matrix ที่มีค่าไม่เรียงลำดับ"""
        matrix = [
            [10, 20],
            [30, 40]
        ]
        expected = [
            [30, 10],
            [40, 20]
        ]
        self.assertEqual(rotate_matrix(matrix), expected, "Should handle matrix with arbitrary values")

    # เพิ่ม Test case อื่นๆ ที่จำเป็นได้ตามต้องการ เช่น การทดสอบ Matrix ที่มีค่าติดลบ, ค่า 0 เป็นต้น

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
    # ใช้ exit=False เพื่อให้เห็นผลลัพธ์ในสภาพแวดล้อมบางอย่าง เช่น Jupyter Notebook
    # ถ้า run จาก Terminal ปกติ ไม่ต้องใส่ก็ได้

