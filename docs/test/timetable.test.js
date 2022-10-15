import { toSecFromNow, toSecFromTimeString, toTimeStringFromSec,
         makeDiffs, getMedian, isReversedLine,
         convertTimetable, maxValueLessThanOrEqualTo, minValueGreaterThanOrEqualTo, 
         isBetween, extractSchedules, makeStationName2TimeMap, makeMapFromTimeArray, makeLineName2DirectionMap, makeSummaryMap } from "../src/timetable.js";

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

test.each([
    [0, '0:00'],
    [19920, '5:32'],
    [86700, '24:05']
])('%#. toTimeStringFromSec(%i) => %s', (sec, expected) => {
    expect(toTimeStringFromSec(sec)).toBe(expected);
});

test.each([
    [[0, 5, 10, 15], [1, 7, 14, 18], [1, 2, 4, 3]],
    [[0, 5, 10, 15, 20, 30], [3, 8, 13, 18, 28, 33], [3,3,3,3,8,3]],
    [[5, 10, 15], [5, 8, 14, 17], [3, 4, 2]],
    [[0, 5, 10], [1, 7, 13, 15], [1, 2, 3]],
    [[0, 5, 10, 15], [3, 6, 13], [3, 1, 3]],
    [[5, 10, 15, 20], [], []]
])('%#. makeDiffs(%o, %o) => %o', (array1, array2, expected) => {
    expect(makeDiffs(array1, array2)).toStrictEqual(expected);
});

test.each([
    [[], null],
    [[1], 1],
    [[2,1], 1],
    [[1,2,3], 2],
    [[2,3,4,1], 2],
    [[1,3,5,7,9], 5]
])('%#. getMedian(%o) => %i', (array, expected) => {
    expect(getMedian(array)).toBe(expected);
});

test.each([
    ['名城線（右回り）', '名城線（左回り）', true],
    ['名城線（右回り）', '名城線（右回り）', false],
    ['東山線（高畑行）', '東山線（藤が丘行き）', true]
])('%#. isReversedLine(%s, %s) => %o', (lineName1, lineName2, expected) => {
    expect(isReversedLine(lineName1, lineName2)).toBe(expected);
});

const timetable = [
    {
        type: "平日",
        lineName: "テスト路線（Ｄ行）",
        stations: [
            {
                ID: "L01",
                name: "Ａ",
                time: ["6:10","6:20"]
            },
            {
                ID: "L02",
                name: "Ｂ",
                time: ["6:03","6:13","6:23"]
            },
            {
                ID: "L03",
                name: "Ｃ",
                time: ["6:05","6:15","6:25"]
            },
            {
                ID: "L04",
                name: "Ｄ",
                time: []
            }
        ]
    },
    {
        type: "平日",
        lineName: "テスト路線（Ａ行）",
        stations: [
            {
                ID: "L04",
                name: "Ｄ",
                time: ["6:00", "6:10", "6:20"]
            },
            {
                ID: "L03",
                name: "Ｃ",
                time: ["6:04", "6:14", "6:24"]
            },
            {
                ID: "L02",
                name: "Ｂ",
                time: ["6:06", "6:16", "6:26"]
            },
            {
                ID: "L01",
                name: "Ａ",
                time: []
            }
        ]
    },
    {
        type: "平日",
        lineName: "環状線",
        loop: true,
        stations: [
            {
                ID: "C01",
                name: "Ｘ",
                time: ["6:00", "6:15", "6:30", "6:45"]
            },
            {
                ID: "C02",
                name: "Ｙ",
                time: ["6:04", "6:19", "6:34"]
            },
            {
                ID: "C03",
                name: "Ｚ",
                time: ["6:10", "6:25", "6:40"]
            }
        ]
    }
];

test('convertTimetable', () => {
    const actual = convertTimetable(timetable, '平日');
    const expected = [
        {
            name: 'Ａ',
            next: 'Ｂ',
            line: 'テスト路線（Ｄ行）',
            time: [22200, 22800],
            timeToNext: 180
        },
        {
            name: 'Ｂ',
            next: 'Ｃ',
            line: 'テスト路線（Ｄ行）',
            time: [21780, 22380, 22980],
            timeToNext: 120
        },
        {
            name: 'Ｃ',
            next: 'Ｄ',
            line: 'テスト路線（Ｄ行）',
            time: [21900, 22500, 23100],
            timeToNext: 240
        },
        {
            name: 'Ｄ',
            next: null,
            line: 'テスト路線（Ｄ行）',
            time: [],
            timeToNext: null
        },
        {
            name: 'Ｄ',
            next: 'Ｃ',
            line: 'テスト路線（Ａ行）',
            time: [21600, 22200, 22800],
            timeToNext: 240
        },
        {
            name: 'Ｃ',
            next: 'Ｂ',
            line: 'テスト路線（Ａ行）',
            time: [21840, 22440, 23040],
            timeToNext: 120
        },
        {
            name: 'Ｂ',
            next: 'Ａ',
            line: 'テスト路線（Ａ行）',
            time: [21960, 22560, 23160],
            timeToNext: 180
        },
        {
            name: 'Ａ',
            next: null,
            line: 'テスト路線（Ａ行）',
            time: [],
            timeToNext: null
        },
        {
            name: 'Ｘ',
            next: 'Ｙ',
            line: '環状線',
            time: [21600, 22500, 23400, 24300],
            timeToNext: 240
        },
        {
            name: 'Ｙ',
            next: 'Ｚ',
            line: '環状線',
            time: [21840, 22740, 23640],
            timeToNext: 360
        },
        {
            name: 'Ｚ',
            next: 'Ｘ',
            line: '環状線',
            time: [22200, 23100, 24000],
            timeToNext: 300
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

const stationA = {
    name: 'Ａ',
    next: 'Ｂ',
    line: '桜通線（徳重行）',
    time: [0, 300, 600, 900, 1200, 1800],
    timeToNext: 180
};

const stationB = {
    name: 'Ｂ',
    next: 'Ｃ',
    line: '桜通線（徳重行）',
    time: [180, 480, 780, 1080, 1680, 1980],
    timeToNext: 120
}

const stationC = {
    name: 'Ｃ',
    next: null,
    line: '桜通線（徳重行）',
    time: [],
    timeToNext: null
}

test.each([
    [stationA, stationB, -1, false ],
    [stationA, stationB, 0, true],
    [stationA, stationB, 120, true],
    [stationA, stationB, 180, true],
    [stationA, stationB, 240, false],
    [stationA, stationB, 300, true],
    [stationA, stationB, 420, true],
    [stationA, stationB, 540, false],
    [stationA, stationB, 720, true],
    [stationA, stationB, 840, false],
    [stationA, stationB, 1140, false],
    [stationA, stationB, 1200, true],
    [stationA, stationB, 1320, true],
    [stationA, stationB, 1380, true],
    [stationA, stationB, 1560, false],
    [stationA, stationB, 1620, false],
    [stationA, stationB, 1680, false],
    [stationA, stationB, 1740, false],
    [stationA, stationB, 1800, true],
    [stationA, stationB, 1920, true],
    [stationA, stationB, 1980, true],
    [stationA, stationB, 2040, false],
    [stationB, stationC, 180, true],
    [stationB, stationC, 240, true],
    [stationB, stationC, 300, true],
    [stationB, stationC, 360, false],
    [stationB, stationC, 420, false],
    [stationB, stationC, 480, true],
    [stationB, stationC, 660, false],
    [stationB, stationC, 780, true],
    [stationB, stationC, 1080, true],
    [stationB, stationC, 1140, true],
    [stationB, stationC, 1200, true],
    [stationB, stationC, 1260, false],
    [stationB, stationC, 1680, true],
    [stationB, stationC, 1800, true],
    [stationB, stationC, 1980, true],
    [stationB, stationC, 2040, true],
    [stationB, stationC, 2100, true],
    [stationB, stationC, 2160, false],
])('%#. isBetween(%i, %i, %d) => %o', (currSchedule, nextSchedule, t, expected) => {
    expect(isBetween(currSchedule, nextSchedule, t)).toBe(expected);
});

test('1. extractSchedules', () => {
    const scheduleArray = [
        {
            name: 'Ａ',
            next: 'Ｂ',
            line: 'テスト路線（Ｄ行）',
            time: [22200, 22800],
            timeToNext: 180
        },
        {
            name: 'Ｂ',
            next: 'Ｃ',
            line: 'テスト路線（Ｄ行）',
            time: [21780, 22380, 22980],
            timeToNext: 120
        },
        {
            name: 'Ｃ',
            next: 'Ｄ',
            line: 'テスト路線（Ｄ行）',
            time: [21900, 22500, 23100],
            timeToNext: 240
        },
        {
            name: 'Ｄ',
            next: null,
            line: 'テスト路線（Ｄ行）',
            time: [],
            timeToNext: null
        }
    ]
    expect(extractSchedules(scheduleArray, 'Ｂ')).toStrictEqual([
        {
            name: 'Ｂ',
            next: 'Ｃ',
            line: 'テスト路線（Ｄ行）',
            time: [21780, 22380, 22980],
            timeToNext: 120
        },
        {
            name: 'Ｃ',
            next: 'Ｄ',
            line: 'テスト路線（Ｄ行）',
            time: [21900, 22500, 23100],
            timeToNext: 240
        },
        {
            name: 'Ｄ',
            next: null,
            line: 'テスト路線（Ｄ行）',
            time: [],
            timeToNext: null
        }
    ]);
});

test('2. extractSchedules', () => {
    const scheduleArray = [
        {
            name: 'Ｘ',
            next: 'Ｙ',
            line: '環状線',
            time: [21600, 22500, 23400, 24300],
            timeToNext: 240
        },
        {
            name: 'Ｙ',
            next: 'Ｚ',
            line: '環状線',
            time: [21840, 22740, 23640],
            timeToNext: 360
        },
        {
            name: 'Ｚ',
            next: 'Ｘ',
            line: '環状線',
            time: [22200, 23100, 24000],
            timeToNext: 300
        }
    ]
    expect(extractSchedules(scheduleArray, 'Ｙ')).toStrictEqual([
        {
            name: 'Ｙ',
            next: 'Ｚ',
            line: '環状線',
            time: [21840, 22740, 23640],
            timeToNext: 360
        },
        {
            name: 'Ｚ',
            next: 'Ｘ',
            line: '環状線',
            time: [22200, 23100, 24000],
            timeToNext: 300
        },
        {
            name: 'Ｘ',
            next: 'Ｙ',
            line: '環状線',
            time: [21600, 22500, 23400, 24300],
            timeToNext: 240
        }
    ]);
});

const scheduleArray = [
    {
        name: 'Ａ',
        next: 'Ｂ',
        line: 'テスト路線（Ｄ行）',
        time: [22200, 22800],
        timeToNext: 180
    },
    {
        name: 'Ｂ',
        next: 'Ｃ',
        line: 'テスト路線（Ｄ行）',
        time: [21780, 22380, 22980],
        timeToNext: 120
    },
    {
        name: 'Ｃ',
        next: 'Ｄ',
        line: 'テスト路線（Ｄ行）',
        time: [21900, 22500],
        timeToNext: 240
    },
    {
        name: 'Ｄ',
        next: null,
        line: 'テスト路線（Ｄ行）',
        time: [],
        timeToNext: null
    }
];
test('1. makeStationName2TimeMap', () => {
    
    const expected = new Map();
    expected.set('Ａ', 22200);
    expected.set('Ｂ', 22380);
    expected.set('Ｃ', 22500);
    expected.set('Ｄ', 22740);
    expect(makeStationName2TimeMap(scheduleArray, 22000)).toStrictEqual(expected);
});

test('2. makeStationName2TimeMap', () => {
    const expected = new Map();
    expected.set('Ａ', 22800);
    expected.set('Ｂ', 22980);
    expected.set('Ｃ', 23100);
    expect(makeStationName2TimeMap(scheduleArray, 22300)).toStrictEqual(expected);
});


test('1. makeMapFromTimeArray', () => {
    const times = [19860,20520,21120,21660,22200,22740,23280,23700,24120,24540,24960,25320,25620,25920,26220,26520,26820,27120,27420,27720];
    const expected = new Map();
    expected.set('5', ['31', '42', '52']);
    expected.set('6', ['01', '10', '19', '28', '35', '42', '49', '56']);
    expected.set('7', ['02', '07', '12', '17', '22', '27', '32', '37', '42']);
    expect(makeMapFromTimeArray(times)).toStrictEqual(expected);
});

test('2. makeMapFromTimeArray', () => {
    const times = [79320,79860,80460,81060,81720,82380,83100,83760,84480,85200,85860,86580,87540];
    const expected = new Map();
    expected.set('22', ['02', '11', '21', '31', '42', '53']);
    expected.set('23', ['05', '16', '28', '40', '51']);
    expected.set('24', ['03', '19']);
    expect(makeMapFromTimeArray(times)).toStrictEqual(expected);
});

test('makeLineName2DirectionMap', () => {
    const scheduleArray = [{
        name: "名古屋", next: "国際センター", line: "桜通線（徳重行）",
        time: [19860,20520,21120,21660],
        timeToNext: 60
    },
    {
        name: "名古屋", next: "中村区役所", line: "桜通線（中村区役所行）",
        time: [20400,21360,21960],
        timeToNext: 120
    },
    {
        name: "名古屋", next: "伏見", line: "東山線（藤が丘行）",
        time: [20280,20760,21360],
        timeToNext: 180
    },
    {
        name: "名古屋", next: "亀島", line: "東山線（高畑行）",
        time: [20700,20940,21360],
        timeToNext: 120
    }];

    const expected = new Map([
        ['桜通線', new Map([
                            ['徳重行', new Map([
                                ['5', ['31','42','52']],
                                ['6', ['01']]
                            ])],
                            ['中村区役所行', new Map([
                                ['5', ['40', '56']],
                                ['6', ['06']]
                            ])]
                        ])],
        ['東山線', new Map([
                            ['藤が丘行', new Map([
                                ['5', ['38','46','56']]
                            ])],
                            ['高畑行', new Map([
                                ['5', ['45','49','56']]
                            ])]
                        ])]
    ]);
    const actual = makeLineName2DirectionMap(scheduleArray, new Map());
    expect(actual).toStrictEqual(expected);
});

test('1. makeSummaryMap', () => {
    const shortestPathMap = new Map([
        ['御器所', [28560]],
        ['吹上', [28680]],
        ['今池', [28800,29040]],
        ['千種', [29160]],
        ['新栄町', [29280]]
    ]);
    const expected = new Map([
        ['御器所', 28560],
        ['今池', 29040],
        ['新栄町', 29280]
    ]);
    const actual = makeSummaryMap(shortestPathMap);
    expect(actual).toStrictEqual(expected);
});

test('2. makeSummaryMap', () => {
    const shortestPathMap = new Map([
        ['堀田', [39360]],
        ['伝馬町', [39480]]
    ]);
    const expected = new Map([
        ['堀田', 39360],
        ['伝馬町', 39480]
    ]);
    const actual = makeSummaryMap(shortestPathMap);
    expect(actual).toStrictEqual(expected);
});

test('3. makeSummaryMap', () => {
    const shortestPathMap = new Map([
        ['吹上', [39480]],
        ['今池', [39600,39960]],
        ['池下', [40080]],
        ['覚王山', [40140]],
        ['本山', [40260,40680]],
        ['名古屋大学', [40800]]
    ]);
    const expected = new Map([
        ['吹上', 39480],
        ['今池', 39960],
        ['本山', 40680],
        ['名古屋大学', 40800]
    ]);
    const actual = makeSummaryMap(shortestPathMap);
    expect(actual).toStrictEqual(expected);
});