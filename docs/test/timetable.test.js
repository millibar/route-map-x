import { toSecFromNow, toSecFromTimeString, convertTimetable } from "../src/timetable.js";

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
})