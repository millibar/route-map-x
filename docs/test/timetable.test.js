import { toSecFromNow, toSecFromTimeString, convertTimetable, maxValueLessThanOrEqualTo, minValueGreaterThanOrEqualTo, isBetween, splitArrayAfter } from "../src/timetable.js";

test.each([
    ['0:00', 0],
    ['00:00', 0],
    ['5:32', 19920],
    ['05:32', 19920],
    ['24:05', 86700]
])('%#. toSecFromTimeString(%s) => %i', (str, expected) => {
    expect(toSecFromTimeString(str)).toBe(expected);
});

test.each([
    [new Date(2022, 8, 1, 5, 32, 0), 19920],
    [new Date(2022, 8, 1, 0, 5, 0), 86700]
])('%# toSecFromNow %o', (now, expected) => {
    expect(toSecFromNow(now)).toBe(expected);
});

const timetableForTest = [
    {
        type: "平日",
        lineName: "桜通線（徳重行）",
        stations: [
            {
                "ID": "S01",
                "name": "中村区役所",
                "time": ["5:30","5:40","5:50"]
            },
            {
                "ID": "S02",
                "name": "名古屋",
                "time": ["5:31","5:42","5:52"]
            },
            {
                "ID": "S03",
                "name": "国際センター",
                "time": ["5:33","5:43","5:53"]
            }
        ]
    }
];

test('convertTimetable', () => {
    const actual = convertTimetable(timetableForTest, '平日');
    const expected = [
        {
            name: '中村区役所',
            next: '名古屋',
            line: '桜通線（徳重行）',
            time: [19800, 20400, 21000]
        },
        {
            name: '名古屋',
            next: '国際センター',
            line: '桜通線（徳重行）',
            time: [19860, 20520, 21120]
        },
        {
            name: '国際センター',
            next: null,
            line: '桜通線（徳重行）',
            time: [19980, 20580, 21180]
        }
    ];
    expect(actual).toStrictEqual(expected);
});

test.each([
    [1, [1,2,3,4,5], 1],
    [3, [1,2,3,4,5], 3],
    [5, [1,2,3,4,5], 5],
    [6, [1,2,3,4,5], 5],
    [0, [1,2,3,4,5], -Infinity]
])('%#. maxValueLessThanOrEqualTo(%i, %o) => %i', (n, array, expected) => {
    expect(maxValueLessThanOrEqualTo(n, array)).toBe(expected);
});

test.each([
    [1, [1,2,3,4,5], 1],
    [3, [1,2,3,4,5], 3],
    [5, [1,2,3,4,5], 5],
    [6, [1,2,3,4,5], Infinity],
    [0, [1,2,3,4,5], 1]
])('%#. minValueGreaterThanOrEqualTo(%i, %o) => %i', (n, array, expected) => {
    expect(minValueGreaterThanOrEqualTo(n, array)).toBe(expected);
});

const 中村区役所 = {
    name: '中村区役所',
    next: '名古屋',
    line: '桜通線（徳重行）',
    time: [19800, 20400, 21000]
};

const 名古屋 = {
    name: '名古屋',
    next: '国際センター',
    line: '桜通線（徳重行）',
    time: [19860, 20520, 21120]
}

test.each([
    [中村区役所, 名古屋, 19799, false],
    [中村区役所, 名古屋, 19800, true],
    [中村区役所, 名古屋, 19860, true],
    [中村区役所, 名古屋, 20399, false],
    [中村区役所, 名古屋, 20400, true],
    [中村区役所, 名古屋, 20520, true],
    [中村区役所, 名古屋, 21120, true],
    [中村区役所, 名古屋, 21121, false]
])('%#. isBetween', (currSchedule, nextSchedule, t, expected) => {
    expect(isBetween(currSchedule, nextSchedule, t)).toBe(expected);
});


test.each([
    [(e=> e < 0),[1, 2, 3, 4], []],
    [(e=> e === 3),[1, 2, 3, 4], [4]],
    [(e=> e % 2 === 0),[1, 2, 3, 4], [3, 4]]
])('%#. splitArrayAfter', (f, array, expected) => {
    expect(splitArrayAfter(f, array)).toStrictEqual(expected);
});