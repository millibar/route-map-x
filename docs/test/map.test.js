import fetch from "node-fetch";
import { getMinLatitude, getMaxLatitude, getMinLongitude, getMaxLongitude, 
         calcMapWidth, calcMapHeight, convertStations, getRotateAngle, toInlineStyleString,
         setDijkstraStart, setDijkstraResult } from "../src/map.js";

const jsonUrl = 'http://localhost:3000/data/stations.json';

test('getMinLatitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMinLatitude(stations)).toBe(35.093178); // 名古屋港
});

test('getMaxLatitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMaxLatitude(stations)).toBe(35.223557); // 上小田井
});

test('getMinLongitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMinLongitude(stations)).toBe(136.853226); // 八田
});

test('getMaxLongitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMaxLongitude(stations)).toBe(137.021284); // 藤が丘
});

const stationsForTest = [
    {
        lineName: "桜通線",
        lineColor: "#ca252b",
        stations: [
            {
                ID: "S01",
                name: "中村区役所",
                longitude: 136.2,
                latitude: 35.2
            },
            {
                ID: "S02",
                name: "名古屋",
                longitude: 136.3,
                latitude: 35.1
            },
            {
                ID: "S03",
                name: "国際センター",
                longitude: 136.4,
                latitude: 35.0
            }
        ]
    },
    {
        lineName: "東山線",
        lineColor: "#edaa36",
        stations: [
            {
                ID: "H01",
                name: "高畑",
                longitude: 136.0,
                latitude: 35.1
            },
            {
                ID: "H02",
                name: "八田",
                longitude: 136.0,
                latitude: 35.2
            },
            {
                ID: "H03",
                name: "岩塚",
                longitude: 136.0,
                latitude: 35.3
            }
        ]
    }
];

test('calcMapWidth', () => {
    expect(calcMapWidth(stationsForTest)).toBeCloseTo(0.4);
});

test('calcMapHeight', () => {
    expect(calcMapHeight(stationsForTest)).toBeCloseTo(0.3);
});

test('convertStations', () => {
    const expected = [
        [   
            {
                ID: 'S01',
                name: '中村区役所',
                line: '桜通線',
                color: '#ca252b',
                x: 500,
                y: 250
            },
            {
                ID: 'S02',
                name: '名古屋',
                line: '桜通線',
                color: '#ca252b',
                x: 750,
                y: 500
            },
            {
                ID: 'S03',
                name: '国際センター',
                line: '桜通線',
                color: '#ca252b',
                x: 1000,
                y: 750
            }
        ],
        [
            {
                ID: 'H01',
                name: '高畑',
                line: '東山線',
                color: '#edaa36',
                x: 0,
                y: 500
            },
            {
                ID: 'H02',
                name: '八田',
                line: '東山線',
                color: '#edaa36',
                x: 0,
                y: 250
            },
            {
                ID: 'H03',
                name: '岩塚',
                line: '東山線',
                color: '#edaa36',
                x: 0,
                y: 0
            }
        ]
    ]
    expect(convertStations(stationsForTest, 1000)).toStrictEqual(expected);
});

test.each([
    [0,  1,  90],
    [0, -1, -90],
    [1,  1,  45],
    [1, -1, -45],
    [-1, 1, 135],
    [-1, -1, 225]
])('%#. getRotateAngle(%i, %i) => %i', (dX, dY, expected) => {
    expect(getRotateAngle(dX, dY)).toBe(expected);
});

test('toInlineStyleString', () => {
    const style = {
        top: '10px',
        left: 0,
        width: '100px'
    };
    expect(toInlineStyleString(style)).toBe('top: 10px; left: 0; width: 100px;');
});

const stateForTest = {
    dijkstraStart: null,
    dijkstraResult: null
};

test('setDijkstraStart', () => {
    expect(setDijkstraStart(stateForTest, '新瑞橋')).toStrictEqual({
        dijkstraStart: '新瑞橋',
        dijkstraResult: null
    });

    // 引数は変更しない
    expect(stateForTest).toStrictEqual({
        dijkstraStart: null,
        dijkstraResult: null
    });
});

test('setDijkstraResult', () => {
    expect(setDijkstraResult(stateForTest, { name: '国際センター', line: '桜通線（中村区役所行）', shortestPath: ['国際センター:10','丸の内:8','丸の内:2','伏見:1'], shortestTime: 10 })).toStrictEqual({
        dijkstraStart: null,
        dijkstraResult: { name: '国際センター', line: '桜通線（中村区役所行）', shortestPath: ['国際センター:10','丸の内:8','丸の内:2','伏見:1'], shortestTime: 10 }
    });

    // 引数は変更しない
    expect(stateForTest).toStrictEqual({
        dijkstraStart: null,
        dijkstraResult: null
    });
});