import { setDayType, setDijkstraResult, setDijkstraStart, setScheduleArray, setTrainGenerator } from "../src/state.js";

const stateForTest = {
    dayType: '平日',
    routemap: null,
    stationArray: null,
    scheduleArray: null,
    trainGenerator: null,
    dijkstraStart: null,
    dijkstraResult: null
};

const scheduleArrayForTest = [
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

test('setDayType', () => {
    expect(setDayType(stateForTest, '土日休')).toStrictEqual({
        dayType: '土日休',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: null,
        dijkstraStart: null,
        dijkstraResult: null
    });
    
    // 引数は変更しない
    expect(stateForTest).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: null,
        dijkstraStart: null,
        dijkstraResult: null
    });
});

test('setScheduleArray', () => {
    expect(setScheduleArray(stateForTest, scheduleArrayForTest)).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: [
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
        ],
        trainGenerator: null,
        dijkstraStart: null,
        dijkstraResult: null
    });

    // 引数は変更しない
    expect(stateForTest).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: null,
        dijkstraStart: null,
        dijkstraResult: null
    });
});

test('setTrainGenerator', () => {
    class Dummy {
        constructor(){}
    }
    expect(setTrainGenerator(stateForTest, new Dummy())).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: new Dummy(),
        dijkstraStart: null,
        dijkstraResult: null
    });

    // 引数は変更しない
    expect(stateForTest).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: null,
        dijkstraStart: null,
        dijkstraResult: null
    });
});

test('setDijkstraStart', () => {
    expect(setDijkstraStart(stateForTest, '新瑞橋')).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: null,
        dijkstraStart: '新瑞橋',
        dijkstraResult: null
    });

    // 引数は変更しない
    expect(stateForTest).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: null,
        dijkstraStart: null,
        dijkstraResult: null
    });
});

test('setDijkstraResult', () => {
    expect(setDijkstraResult(stateForTest, { name: '国際センター', line: '桜通線（中村区役所行）', shortestPath: ['国際センター:10','丸の内:8','丸の内:2','伏見:1'], shortestTime: 10 })).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: null,
        dijkstraStart: null,
        dijkstraResult: { name: '国際センター', line: '桜通線（中村区役所行）', shortestPath: ['国際センター:10','丸の内:8','丸の内:2','伏見:1'], shortestTime: 10 }
    });

    // 引数は変更しない
    expect(stateForTest).toStrictEqual({
        dayType: '平日',
        routemap: null,
        stationArray: null,
        scheduleArray: null,
        trainGenerator: null,
        dijkstraStart: null,
        dijkstraResult: null
    });
});