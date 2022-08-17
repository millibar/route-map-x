import fetch from "node-fetch";
import { getMinLatitude, getMaxLatitude, getMinLongitude, getMaxLongitude, convertStations, getRotateAngle, toInlineStyleString } from "../src/map.js";

const jsonUrl = 'http://localhost:3000/data/stations.json';

test('getMinLatitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMinLatitude(stations)).toBe(35.094986);
});

test('getMaxLatitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMaxLatitude(stations)).toBe(35.182441);
});

test('getMinLongitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMinLongitude(stations)).toBe(136.853226);
});

test('getMaxLongitude', async () => {
    const stations = await fetch(jsonUrl).then(response => response.json());
    expect(getMaxLongitude(stations)).toBe(137.021284);
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

test('convertStations', () => {
    const expected = [
        [   
            {
                ID: 'S01',
                stationName: '中村区役所',
                lineName: '桜通線',
                color: '#ca252b',
                x: 500,
                y: 250
            },
            {
                ID: 'S02',
                stationName: '名古屋',
                lineName: '桜通線',
                color: '#ca252b',
                x: 750,
                y: 500
            },
            {
                ID: 'S03',
                stationName: '国際センター',
                lineName: '桜通線',
                color: '#ca252b',
                x: 1000,
                y: 750
            }
        ],
        [
            {
                ID: 'H01',
                stationName: '高畑',
                lineName: '東山線',
                color: '#edaa36',
                x: 0,
                y: 500
            },
            {
                ID: 'H02',
                stationName: '八田',
                lineName: '東山線',
                color: '#edaa36',
                x: 0,
                y: 250
            },
            {
                ID: 'H03',
                stationName: '岩塚',
                lineName: '東山線',
                color: '#edaa36',
                x: 0,
                y: 0
            }
        ]
    ]
    const actual = convertStations(stationsForTest);
    expect(actual).toStrictEqual(expected);
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