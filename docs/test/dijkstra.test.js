import { edgesForTest, scheduleArray } from '../src/schedule.js';
import { getNextStationName, getLineNames, calcShortestTime, initNodes, separeteShortestTimeNode, isConnected, update,
         dijkstraMain, dijkstra, toMapFromShortestPath, dijkstraStart, dijkstraEnd } from '../src/dijkstra.js';

test.each`
    stationName | lineName                   | edges            | expected
    ${'名古屋'} | ${'桜通線（徳重行）'}       | ${scheduleArray} | ${'国際センター'},
    ${'名古屋'} | ${'桜通線（中村区役所行）'} | ${scheduleArray} | ${'中村区役所'},
    ${'名古屋'} | ${'東山線（藤が丘行）'}     | ${scheduleArray} | ${'伏見'},
    ${'金山'}   | ${'名城線（右回り）'}       | ${scheduleArray} | ${'東別院'},
    ${'金山'}   | ${'名城線（左回り）'}       | ${scheduleArray} | ${'西高蔵'},
    ${'金山'}   | ${'名港線（名古屋港行）'}   | ${scheduleArray} | ${'日比野'},
    ${'金山'}   | ${'名港線（金山行）'}       | ${scheduleArray} | ${null},
`('getNextStationName($stationName, $lineName) => $expected', ({stationName, lineName, edges, expected}) => {
    expect(getNextStationName(stationName, lineName, edges)).toBe(expected);
});

test.each`
    stationName | edges            | expected
    ${'名古屋'} | ${scheduleArray} | ${['桜通線（徳重行）','桜通線（中村区役所行）','東山線（藤が丘行）','東山線（高畑行）']},
    ${'栄'}     | ${scheduleArray} | ${['名城線（右回り）','名城線（左回り）','名港線（名古屋港行）','東山線（藤が丘行）','東山線（高畑行）']},
    ${'鶴舞'}   | ${scheduleArray} | ${['鶴舞線（赤池行）','鶴舞線（上小田井行）']},
    ${'徳重'}   | ${scheduleArray} | ${['桜通線（徳重行）','桜通線（中村区役所行）']}
`('getLineNames($stationName)', ({stationName, edges, expected}) => {
    expect(getLineNames(stationName, edges)).toStrictEqual(expected);
});

test.each`
    stationName   | lineName                 | t        | edges            | expected
    ${'金山'}     | ${'名城線（右回り）'}     | ${0}     | ${scheduleArray} | ${19800},
    ${'金山'}     | ${'名城線（右回り）'}     | ${19800} | ${scheduleArray} | ${20640},
    ${'金山'}     | ${'名城線（右回り）'}     | ${25140} | ${scheduleArray} | ${25380},
    ${'金山'}     | ${'名城線（右回り）'}     | ${86040} | ${scheduleArray} | ${86640},
    ${'金山'}     | ${'名城線（右回り）'}     | ${86640} | ${scheduleArray} | ${undefined},
    ${'金山'}     | ${'名城線（右回り）'}     | ${99999} | ${scheduleArray} | ${undefined},
    ${'金山'}     | ${'名港線（名古屋港行）'} | ${26099} | ${scheduleArray} | ${26100},
    ${'名古屋港'} | ${'名港線（名古屋港行）'} | ${0}     | ${scheduleArray} | ${undefined}
`('calcShortestTime($stationName, $lineName, $t) => $expected', ({stationName, lineName, t, edges, expected}) => {
    expect(calcShortestTime(stationName, lineName, t, edges)).toBe(expected);
});

test('initNode(栄, 180)', () => {
    const actual = initNodes('栄', 180, edgesForTest);
    const expected = [
        { name: '上前津', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
        { name: '矢場町', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
        { name: '栄', line: '名城線（右回り）', shortestPath: ['栄:420'], shortestTime: 420 },

        { name: '栄', line: '名城線（左回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '矢場町', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },

        { name: '伏見', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
        { name: '栄', line: '東山線（藤が丘行）', shortestPath: ['栄:240'], shortestTime: 240 },

        { name: '栄', line: '東山線（高畑行）', shortestPath: ['栄:240'], shortestTime: 240 },
        { name: '伏見', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },

        { name: '伏見', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '大須観音', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },

        { name: '上前津', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }
    ]
    expect(actual).toStrictEqual(expected);
});

test('0. separeteShortestTimeNode', () => {
    const actual = separeteShortestTimeNode([
        { name: '上前津', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
        { name: '矢場町', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
        { name: '栄', line: '名城線（右回り）', shortestPath: ['栄:420'], shortestTime: 420 },

        { name: '栄', line: '名城線（左回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '矢場町', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },

        { name: '伏見', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
        { name: '栄', line: '東山線（藤が丘行）', shortestPath: ['栄:240'], shortestTime: 240 },

        { name: '栄', line: '東山線（高畑行）', shortestPath: ['栄:240'], shortestTime: 240 },
        { name: '伏見', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },

        { name: '伏見', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '大須観音', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },

        { name: '上前津', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }
    ]);
    const expected = [
        { name: '栄', line: '東山線（藤が丘行）', shortestPath: ['栄:240'], shortestTime: 240 },
        [
            { name: '上前津', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
            { name: '矢場町', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
            { name: '栄', line: '名城線（右回り）', shortestPath: ['栄:420'], shortestTime: 420 },

            { name: '栄', line: '名城線（左回り）', shortestPath: ['栄:420'], shortestTime: 420 },
            { name: '矢場町', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },
            { name: '上前津', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },

            { name: '伏見', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },

            { name: '栄', line: '東山線（高畑行）', shortestPath: ['栄:240'], shortestTime: 240 },
            { name: '伏見', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },

            { name: '伏見', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
            { name: '大須観音', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
            { name: '上前津', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },

            { name: '上前津', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
            { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
            { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }
        ]
    ];
    expect(actual).toStrictEqual(expected);
});

test('1. separeteShortestTimeNode', () => {
    const actual = separeteShortestTimeNode([
        { name: '池下', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:240'], shortestTime: 240 },
        { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:420'], shortestTime: 420 },
        { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity }
    ]);
    const expected = [
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:240'], shortestTime: 240 },
        [
            { name: '池下', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
            { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:420'], shortestTime: 420 },
            { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity }
        ]
    ]
    expect(actual).toStrictEqual(expected);
});

test('2. separeteShortestTimeNode', () => {
    const actual = separeteShortestTimeNode([
        { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:420'], shortestTime: 420 },
        { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
        { name: '桜山', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity },
        { name: '御器所', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity }
    ]);
    const expected = [
        { name: '今池', line: '東山線（藤が丘行）', shortestPath: ['今池:420'], shortestTime: 420 },
        [
            { name: '池下', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
            { name: '桜山', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity },
            { name: '御器所', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity }
        ]
    ]
    expect(actual).toStrictEqual(expected);
});

test('3. separeteShortestTimeNode', () => {
    const actual = separeteShortestTimeNode([
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:240'], shortestTime: 240 }
    ]);
    const expected = [
        { name: '今池', line: '東山線（高畑行）', shortestPath: ['今池:240'], shortestTime: 240 },
        []
    ]
    expect(actual).toStrictEqual(expected);
});

test.each([
    [{ name: '名古屋', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
     { name: '名古屋', line: '桜通線（徳重行）', shortestPath: [], shortestTime: Infinity }, scheduleArray , true],

    [{ name: '伏見',   line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
     { name: '丸の内', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }, scheduleArray, true],

    [{ name: '伏見',   line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
     { name: '丸の内', line: '桜通線（中村区役所行）', shortestPath: [], shortestTime: Infinity }, scheduleArray, false],

    [{ name: '伏見',     line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
     { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }, scheduleArray, false],

     [{ name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
      { name: '伏見',     line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }, scheduleArray, true],

    [{ name: '伏見',   line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
     { name: '浅間町', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }, scheduleArray, false]
])('%#. isConnected', (p, q, edges, expected) => {
    expect(isConnected(p, q, edges)).toBe(expected);
});

test('update', () => {
    const p = { name: '栄', line: '東山線（高畑行）', shortestPath: ['栄:240'], shortestTime: 240 };
    const V = [
        { name: '上前津', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
        { name: '矢場町', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
        { name: '栄', line: '名城線（右回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '栄', line: '名城線（左回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '矢場町', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '東山線（高畑行）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '大須観音', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }
    ];
    const expected = [
        { name: '上前津', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
        { name: '矢場町', line: '名城線（右回り）', shortestPath: [], shortestTime: Infinity },
        { name: '栄', line: '名城線（右回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '栄', line: '名城線（左回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '矢場町', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '名城線（左回り）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '東山線（藤が丘行）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '東山線（高畑行）', shortestPath: ['伏見:360','栄:240'], shortestTime: 360 },
        { name: '伏見', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '大須観音', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '鶴舞線（赤池行）', shortestPath: [], shortestTime: Infinity },
        { name: '上前津', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity },
        { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: [], shortestTime: Infinity }
    ];
    const actual = update(p, V, 0, edgesForTest);
    expect(actual).toStrictEqual(expected);
});


test('dijkstraMain 栄スタート、乗り換え時間 0分', () => {
    const V = initNodes('栄', 180, edgesForTest);
    const actual = dijkstraMain(V, 0, edgesForTest);
    const expected = [
        { name: '栄', line: '東山線（藤が丘行）', shortestPath: ['栄:240'], shortestTime: 240 },
        { name: '栄', line: '東山線（高畑行）', shortestPath: ['栄:240'], shortestTime: 240 },
        { name: '伏見', line: '東山線（高畑行）', shortestPath: ['伏見:360','栄:240'], shortestTime: 360 },
        { name: '栄', line: '名城線（右回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '栄', line: '名城線（左回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '伏見', line: '東山線（藤が丘行）', shortestPath: ['伏見:480','伏見:360','栄:240'], shortestTime: 480 },
        { name: '矢場町', line: '名城線（左回り）', shortestPath: ['矢場町:540','栄:420'], shortestTime: 540 },
        { name: '矢場町', line: '名城線（右回り）', shortestPath: ['矢場町:600','矢場町:540','栄:420'], shortestTime: 600 },
        { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:600','伏見:360','栄:240'], shortestTime: 600 },
        { name: '上前津', line: '名城線（左回り）', shortestPath: ['上前津:660','矢場町:540','栄:420'], shortestTime: 660 },
        { name: '上前津', line: '名城線（右回り）', shortestPath: ['上前津:780','上前津:660','矢場町:540','栄:420'], shortestTime: 780 },
        { name: '伏見', line: '鶴舞線（赤池行）', shortestPath: ['伏見:780','伏見:360','栄:240'], shortestTime: 780 },
        { name: '上前津', line: '鶴舞線（上小田井行）', shortestPath: ['上前津:780','上前津:660','矢場町:540','栄:420'], shortestTime: 780 },
        { name: '大須観音', line: '鶴舞線（赤池行）', shortestPath: ['大須観音:900','伏見:780','伏見:360','栄:240'], shortestTime: 900 },
        { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: ['大須観音:900','上前津:780','上前津:660','矢場町:540','栄:420'], shortestTime: 900 },
        { name: '上前津', line: '鶴舞線（赤池行）', shortestPath: ['上前津:1020','上前津:660','矢場町:540','栄:420'], shortestTime: 1020 },
    ];
    expect(actual).toStrictEqual(expected);
});

test('dijkstraMain 栄スタート、乗り換え時間 4分', () => {
    const V = initNodes('栄', 180, edgesForTest);
    const actual = dijkstraMain(V, 240, edgesForTest);
    const expected = [
        { name: '栄', line: '東山線（藤が丘行）', shortestPath: ['栄:240'], shortestTime: 240 },
        { name: '栄', line: '東山線（高畑行）', shortestPath: ['栄:240'], shortestTime: 240 },
        { name: '伏見', line: '東山線（高畑行）', shortestPath: ['伏見:360','栄:240'], shortestTime: 360 },
        { name: '栄', line: '名城線（右回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '栄', line: '名城線（左回り）', shortestPath: ['栄:420'], shortestTime: 420 },
        { name: '矢場町', line: '名城線（左回り）', shortestPath: ['矢場町:540','栄:420'], shortestTime: 540 },
        { name: '上前津', line: '名城線（左回り）', shortestPath: ['上前津:660','矢場町:540','栄:420'], shortestTime: 660 },
        { name: '伏見', line: '鶴舞線（赤池行）', shortestPath: ['伏見:780','伏見:360','栄:240'], shortestTime: 780 },
        { name: '伏見', line: '東山線（藤が丘行）', shortestPath: ['伏見:840','伏見:360','栄:240'], shortestTime: 840 },
        { name: '矢場町', line: '名城線（右回り）', shortestPath: ['矢場町:900','矢場町:540','栄:420'], shortestTime: 900 },
        { name: '大須観音', line: '鶴舞線（赤池行）', shortestPath: ['大須観音:900','伏見:780','伏見:360','栄:240'], shortestTime: 900 },
        { name: '上前津', line: '鶴舞線（赤池行）', shortestPath: ['上前津:1020','上前津:660','矢場町:540','栄:420'], shortestTime: 1020 },
        { name: '伏見', line: '鶴舞線（上小田井行）', shortestPath: ['伏見:1020','伏見:360','栄:240'], shortestTime: 1020 },
        { name: '上前津', line: '名城線（右回り）', shortestPath: ['上前津:1080','上前津:660','矢場町:540','栄:420'], shortestTime: 1080 },
        { name: '上前津', line: '鶴舞線（上小田井行）', shortestPath: ['上前津:1260','上前津:660','矢場町:540','栄:420'], shortestTime: 1260 },
        { name: '大須観音', line: '鶴舞線（上小田井行）', shortestPath: ['大須観音:1380','大須観音:900','伏見:780','伏見:360','栄:240'], shortestTime: 1380 },
    ];
    expect(actual).toStrictEqual(expected);
});

test('dijkstra 8:00 新瑞橋 → 8:23 名古屋' , () => {
    const actual = dijkstra('新瑞橋', 28800, '名古屋', 0, scheduleArray);
    const expected = { name: '名古屋', line: '桜通線（中村区役所行）', shortestPath: ['名古屋:30180','国際センター:30120','丸の内:30000','久屋大通:29880','高岳:29760','車道:29640','今池:29520','吹上:29400','御器所:29280','桜山:29160','瑞穂区役所:29040','瑞穂運動場西:28920','新瑞橋:28860'], shortestTime: 30180 };
    expect(actual).toStrictEqual(expected);
});

test('dijkstra 7:55 荒畑 → 8:14 新栄町' , () => {
    const actual = dijkstra('荒畑', 28500, '新栄町', 200, scheduleArray);
    const expected = { name: '新栄町', line: '東山線（藤が丘行）', shortestPath: ['新栄町:29640','栄:29520','伏見:29460','伏見:29160','大須観音:29040','上前津:28920','鶴舞:28800','荒畑:28620'], shortestTime: 29640 };
    expect(actual).toStrictEqual(expected);
});

test('dijkstra 7:55 御器所 → 8:08 新栄町' , () => {
    const actual = dijkstra('御器所', 28500, '新栄町', 200, scheduleArray);
    const expected = { name: '新栄町', line: '東山線（高畑行）', shortestPath: ['新栄町:29280','千種:29160','今池:29040','今池:28800','吹上:28680','御器所:28560'], shortestTime: 29280 };
    expect(actual).toStrictEqual(expected);
});

test('toMapFromShortestPath', () => {
    const expected = new Map();
    expected.set('伏見', 1);
    expected.set('丸の内', 8);
    expected.set('国際センター', 10);

    expect(toMapFromShortestPath(['伏見:1','丸の内:2','丸の内:8','国際センター:10'])).toStrictEqual(expected);
});

test('dijkstraStart 御器所 → End 新栄町', async () => {
    const U = await dijkstraStart('御器所', 28500, 200, scheduleArray);
    const expected = new Map();
    expected.set('新栄町', 29280);
    expected.set('千種', 29160);
    expected.set('今池', 29040);
    expected.set('吹上', 28680);
    expected.set('御器所', 28560);
    expect(dijkstraEnd('新栄町', U)).toStrictEqual(expected);
});