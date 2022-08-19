import { schedule } from '../src/schedule.js';
import { getNextStationName, getLineNames, calcShortestTime, initNodes, separeteShortestTimeNode, isConnected, update, dijkstraMain, dijkstra } from '../src/dijkstra.js';


test.each([
    ['名古屋', '桜通線（徳重行）', schedule, '国際センター'],
    ['名古屋', '桜通線（中村区役所行）', schedule, '中村区役所'],
    ['名古屋', '東山線（藤が丘行）', schedule, '伏見']
])('%#. getNextStationName %s %s', (stationName, lineName, schedule, expected) => {
    expect(getNextStationName(stationName, lineName, schedule)).toBe(expected);
});

test.each([
    ['名古屋', schedule, ['東山線（高畑行）', '東山線（藤が丘行）', '桜通線（中村区役所行）', '桜通線（徳重行）'] ],
    ['栄', schedule, ['東山線（高畑行）', '東山線（藤が丘行）', '名城線（左回り）', '名城線（右回り）']],
    ['鶴舞', schedule, ['鶴舞線（上小田井行）', '鶴舞線（赤池行）']]
])('%#. getLineNames %s', (stationName, schedule, expected) => {
    expect(getLineNames(stationName, schedule)).toStrictEqual(expected);
});




const edgesForTest = [
    {
        name: '池下',
        next: '今池',
        line: '東山線（高畑行）',
        time: [3,8,13,18,23,28,33,38,43,48,53,58]
    },{
        name: '今池',
        next: '千種',
        line: '東山線（高畑行）',
        time: [4,9,14,19,24,29,34,39,44,49,54,59]
    },{
        name: '今池',
        next: '池下',
        line: '東山線（藤が丘行）',
        time: [2,7,12,17,22,27,32,37,42,47,52,57]
    },{
        name: '池下',
        next: null,
        line: '東山線（藤が丘行）',
        time: []
    },{
        name: '桜山',
        next: '御器所',
        line: '桜通線（中村区役所行）',
        time: [5,15,25,35,45,55]
    },{
        name: '御器所',
        next: '吹上',
        line: '桜通線（中村区役所行）',
        time: [6,16,26,36,46,56]
    },{
        name: '御器所',
        next: '桜山',
        line: '桜通線（徳重行）',
        time: [7,17,27,37,47,57]
    },{
        name: '桜山',
        next: null,
        line: '桜通線（徳重行）',
        time: []
    }
];


test.each([
    ['今池', '東山線（高畑行）', 24, edgesForTest, 29 ],
    ['今池', '東山線（高畑行）', 23, edgesForTest, 24 ],
    ['今池', '東山線（高畑行）', 0, edgesForTest, 4 ],
    ['今池', '東山線（高畑行）', 55, edgesForTest, 59 ],
    ['桜山', '桜通線（中村区役所行）', 16, edgesForTest, 25]
])('%#. calcShortestTime %s %s %i', (stationName, lineName, t, edges, expected) => {
    expect(calcShortestTime(stationName, lineName, t, edges)).toBe(expected);
});


test('initNodes 今池, 3', () => {
    const actual = initNodes('今池', 3, edgesForTest);
    const expected = [
        { name: '池下', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:4'], shortestTime: 4 },
        { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:7'], shortestTime: 7 },
        { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
        { name: '桜山', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity },
        { name: '御器所', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity },
        { name: '御器所', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity },
        { name: '桜山', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity }
    ];
    expect(actual).toStrictEqual(expected);
});

test('0. separeteShortestTimeNode', () => {
    const actual = separeteShortestTimeNode([
        { name: '池下', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:4'], shortestTime: 4 },
        { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:7'], shortestTime: 7 },
        { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity }
    ]);
    const expected = [
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:4'], shortestTime: 4 },
        [
            { name: '池下', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
            { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:7'], shortestTime: 7 },
            { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity }
        ]
    ]
    expect(actual).toStrictEqual(expected);
});

test('1. separeteShortestTimeNode', () => {
    const actual = separeteShortestTimeNode([
        { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:7'], shortestTime: 7 },
        { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
        { name: '桜山', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity },
        { name: '御器所', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity }
    ]);
    const expected = [
        { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:7'], shortestTime: 7 },
        [
            { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
            { name: '桜山', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity },
            { name: '御器所', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity }
        ]
    ]
    expect(actual).toStrictEqual(expected);
});

test('2. separeteShortestTimeNode', () => {
    const actual = separeteShortestTimeNode([
        { name: '池下', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:4'], shortestTime: 4 }
    ]);
    const expected = [
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:4'], shortestTime: 4 },
        [
            { name: '池下', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity }
        ]
    ]
    expect(actual).toStrictEqual(expected);
});

test.each([
    [{ name: '名古屋', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
     { name: '名古屋', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity }, schedule, true],

    [{ name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1'], shortestTime: 1 },
     { name: '丸の内', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }, schedule, true],

    [{ name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1'], shortestTime: 1 },
     { name: '丸の内', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity }, schedule, false],

    [{ name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1'], shortestTime: 1 },
     { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }, schedule, false],

     [{ name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1'], shortestTime: 1 },
      { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }, schedule, true],

    [{ name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1'], shortestTime: 1 },
     { name: '浅間町', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }, schedule, false]
])('%#. isConnected', (p, q, edges, expected) => {
    expect(isConnected(p, q, edges)).toBe(expected);
});

test('0. update 伏見 鶴舞線（上小田井行）', () => {
    const p = { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1'], shortestTime: 1 };
    const V = [
        { name: '伏見', line: '東山線（高畑行）', shortestPath: ['伏見:1'], shortestTime: 2 },
        { name: '名古屋', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
        { name: '名古屋', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity },
        { name: '国際センター', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity },
        { name: '丸の内', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '丸の内', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity }
    ];
    const expected = [
        { name: '伏見', line: '東山線（高畑行）', shortestPath: ['伏見:1'], shortestTime: 2 },
        { name: '名古屋', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
        { name: '名古屋', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity },
        { name: '国際センター', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity },
        { name: '丸の内', line: '鶴舞線（上小田井行）', shortestPath: ['丸の内:2','伏見:1'], shortestTime: 2 },
        { name: '丸の内', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity }
    ];
    const actual = update(p, V, schedule);
    expect(actual).toStrictEqual(expected);
});


test('dijkstraMain 伏見 → 国際センター', () => {
    const V = [
        { name: '伏見', line: '東山線（高畑行）', shortestPath: ['伏見:2'], shortestTime: 2 },
        { name: '名古屋', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
        { name: '丸の内', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity },
        { name: '国際センター', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity },
        { name: '名古屋', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity },
        { name: '国際センター', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1'], shortestTime: 1 },
        { name: '丸の内', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }
    ];
    const actual = dijkstraMain(V, schedule);
    const expected = [
        { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1'], shortestTime: 1 },
        { name: '伏見', line: '東山線（高畑行）', shortestPath: ['伏見:2'], shortestTime: 2 },
        { name: '丸の内', line: '鶴舞線（上小田井行）', shortestPath: ['丸の内:2','伏見:1'], shortestTime: 2 },
        { name: '名古屋', line: '東山線（高畑行）', shortestPath: ['名古屋:5','伏見:2'], shortestTime: 5 },
        { name: '丸の内', line: '桜通線（中村区役所行）', shortestPath: ['丸の内:8','丸の内:2','伏見:1'], shortestTime: 8 },
        { name: '国際センター', line: '桜通線（中村区役所行）', shortestPath: ['国際センター:10','丸の内:8','丸の内:2','伏見:1'], shortestTime: 10 },
        { name: '名古屋', line: '桜通線（徳重行）', shortestPath: ['名古屋:12','名古屋:5','伏見:2'], shortestTime: 12 },
        { name: '国際センター', line: '桜通線（徳重行）', shortestPath: ['国際センター:13','名古屋:12','名古屋:5','伏見:2'], shortestTime: 13 }
    ];
    expect(actual).toStrictEqual(expected);
});

test('0. dijkstra 伏見 → 国際センター 0', () => {
    expect(dijkstra('伏見', 0, '国際センター', schedule)).toStrictEqual(
        { name: '国際センター', line: '桜通線（中村区役所行）', shortestPath: ['国際センター:10','丸の内:8','丸の内:2','伏見:1'], shortestTime: 10 }
    );
});

test('1. dijkstra 鶴舞 → 千種 0', () => {
    expect(dijkstra('鶴舞', 0, '千種', schedule)).toStrictEqual(
        { name: '千種', line: '東山線（藤が丘行）', shortestPath: ['千種:25','新栄町:23','栄:21','伏見:19','伏見:11','大須観音:9','上前津:7','鶴舞:5'], shortestTime: 25 }
    );
});

test('2. dijkstra 荒畑 → 今池 10', () => {
    expect(dijkstra('荒畑', 10, '今池', schedule)).toStrictEqual(
        { name: '今池', line: '桜通線（中村区役所行）', shortestPath: ['今池:30','吹上:28','御器所:26','御器所:13','荒畑:11'], shortestTime: 30 }
    );
});

test('3. dijkstra 荒畑 → 今池 11', () => {
    expect(dijkstra('荒畑', 11, '今池', schedule)).toStrictEqual(
        { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:37','千種:35','新栄町:33','栄:31','伏見:29','伏見:21','大須観音:19','上前津:17','鶴舞:15','荒畑:12'], shortestTime: 37 }
    );
});