import ensureTasksHaveNum, { isObject } from "utils/ensureTaskItemNum";

describe('isObject', () => {
    test('should return true for plain objects', () => {
        const input = { key: 'value' };
        const result = isObject(input);
        expect(result).toBe(true);
    });

    test('should return false for arrays', () => {
        const input = [1, 2, 3];
        const result = isObject(input);
        expect(result).toBe(false);
    });

    test('should return false for null', () => {
        const input = null;
        const result = isObject(input);
        expect(result).toBe(false);
    });
});

describe('ensureTasksHaveNum', () => {
    test('should return the original input if not an array of objects', () => {
        const input = 'not an array';
        const result = ensureTasksHaveNum(input);
        expect(result).toEqual(input);
    });

    test('should add a num property with value "0" to objects without a num property', () => {
        const input = [{ title: 'Task 1' }, { title: 'Task 2', num: '1' }];
        const expectedResult = [{ title: 'Task 1', num: '0' }, { title: 'Task 2', num: '1' }];
        const result = ensureTasksHaveNum(input);
        expect(result).toEqual(expectedResult);
    });

    test('should not modify objects with a num property', () => {
        const input = [{ title: 'Task 1', num: '5' }];
        const expectedResult = [{ title: 'Task 1', num: '5' }];
        const result = ensureTasksHaveNum(input);
        expect(result).toEqual(expectedResult);
    });
});
