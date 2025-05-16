// สมมติว่าผู้เรียนจะสร้างฟังก์ชันในไฟล์ชื่อ fizzbuzz.js
// ถ้าใช้ชื่อไฟล์หรือฟังก์ชันอื่น ต้องแก้ require ด้านล่าง
let fizzBuzzPlusPlus;
try {
    // ใช้ CommonJS require สำหรับ Node/Jest โดยทั่วไป
    const fbModule = require('./fizzbuzz');
    fizzBuzzPlusPlus = fbModule.fizzBuzzPlusPlus;
    if (typeof fizzBuzzPlusPlus !== 'function') {
        throw new Error("fizzBuzzPlusPlus is not exported as a function or module not found.");
    }
} catch (e) {
    // Log the specific error for debugging purposes
    console.error("Error when importing 'fizzBuzzPlusPlus':", e.message);
    
    // Provide clear instructions for the user
    console.warn("Please create 'fizzbuzz.js' and export the 'fizzBuzzPlusPlus' function.");
    
    // สร้างฟังก์ชันจำลองเพื่อให้ test run ได้
    fizzBuzzPlusPlus = (n) => {
        // คืนค่าที่ทำให้ test ส่วนใหญ่ fail จนกว่าจะ implement
        return `Implement Me: ${n}`;
    };
}


describe('fizzBuzzPlusPlus', () => {
    test('should return the number itself for non-multiples of 3, 5, or 7', () => {
        expect(fizzBuzzPlusPlus(1)).toBe(1);
        expect(fizzBuzzPlusPlus(2)).toBe(2);
        expect(fizzBuzzPlusPlus(4)).toBe(4);
        expect(fizzBuzzPlusPlus(8)).toBe(8);
        expect(fizzBuzzPlusPlus(11)).toBe(11);
    });

    test('should return "Fizz" for multiples of 3 only', () => {
        expect(fizzBuzzPlusPlus(3)).toBe('Fizz');
        expect(fizzBuzzPlusPlus(6)).toBe('Fizz');
        expect(fizzBuzzPlusPlus(9)).toBe('Fizz');
        expect(fizzBuzzPlusPlus(12)).toBe('Fizz');
    });

    test('should return "Buzz" for multiples of 5 only', () => {
        expect(fizzBuzzPlusPlus(5)).toBe('Buzz');
        expect(fizzBuzzPlusPlus(10)).toBe('Buzz');
        expect(fizzBuzzPlusPlus(20)).toBe('Buzz');
        expect(fizzBuzzPlusPlus(25)).toBe('Buzz');
    });

    test('should return "Woof" for multiples of 7 only', () => {
        expect(fizzBuzzPlusPlus(7)).toBe('Woof');
        expect(fizzBuzzPlusPlus(14)).toBe('Woof');
        expect(fizzBuzzPlusPlus(28)).toBe('Woof');
        // 49 is 7*7
        expect(fizzBuzzPlusPlus(49)).toBe('Woof');
    });

    test('should return "FizzBuzz" for multiples of 3 and 5', () => {
        expect(fizzBuzzPlusPlus(15)).toBe('FizzBuzz');
        expect(fizzBuzzPlusPlus(30)).toBe('FizzBuzz');
        // 45 is 3*15
        expect(fizzBuzzPlusPlus(45)).toBe('FizzBuzz');
    });

    test('should return "FizzWoof" for multiples of 3 and 7', () => {
        expect(fizzBuzzPlusPlus(21)).toBe('FizzWoof');
        expect(fizzBuzzPlusPlus(42)).toBe('FizzWoof');
        // 63 is 3*21
        expect(fizzBuzzPlusPlus(63)).toBe('FizzWoof');
    });

    test('should return "BuzzWoof" for multiples of 5 and 7', () => {
        expect(fizzBuzzPlusPlus(35)).toBe('BuzzWoof');
        expect(fizzBuzzPlusPlus(70)).toBe('BuzzWoof');
        // 140 is 4*35
        expect(fizzBuzzPlusPlus(140)).toBe('BuzzWoof');
    });

    test('should return "FizzBuzzWoof" for multiples of 3, 5, and 7', () => {
        // 3 * 5 * 7 = 105
        expect(fizzBuzzPlusPlus(105)).toBe('FizzBuzzWoof');
        expect(fizzBuzzPlusPlus(210)).toBe('FizzBuzzWoof');
    });

    test('should return "FizzBuzzWoof" for 0', () => {
        // 0 is considered divisible by all integers (except 0 itself)
        expect(fizzBuzzPlusPlus(0)).toBe('FizzBuzzWoof');
    });

    // Optional: Test for negative numbers (assuming they should return the number itself)
    test('should return the number itself for negative numbers', () => {
        expect(fizzBuzzPlusPlus(-1)).toBe(-1);
        expect(fizzBuzzPlusPlus(-3)).toBe(-3); // Or 'Fizz' depending on requirements
        expect(fizzBuzzPlusPlus(-5)).toBe(-5); // Or 'Buzz'
        expect(fizzBuzzPlusPlus(-7)).toBe(-7); // Or 'Woof'
        expect(fizzBuzzPlusPlus(-15)).toBe(-15); // Or 'FizzBuzz'
    });
});