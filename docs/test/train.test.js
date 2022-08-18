/**
 * @jest-environment jsdom
 */
import { generateTrains } from '../src/train.js';

const scheduleArray = [
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

const stationArray = [   
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
];

test('generateTrains: trains.length === 1', () => {
    const t = 19850;
    const trains = generateTrains(scheduleArray, stationArray, t);
    expect(trains.length).toBe(1);
});

test('generateTrains: currSchedule, nextSchedule', () => {
    const t = 19850;
    const trains = generateTrains(scheduleArray, stationArray, t);
    expect(trains[0].currSchedule).toStrictEqual({
        name: '中村区役所',
        next: '名古屋',
        line: '桜通線（徳重行）',
        time: [19800, 20400, 21000]
    });

    expect(trains[0].nextSchedule).toStrictEqual({
        name: '名古屋',
        next: '国際センター',
        line: '桜通線（徳重行）',
        time: [19860, 20520, 21120]
    });
});

test('generateTrains: currStation, nextStation', () => {
    const t = 19850;
    const trains = generateTrains(scheduleArray, stationArray, t);
    expect(trains[0].currStation).toStrictEqual({
        ID: 'S01',
        name: '中村区役所',
        line: '桜通線',
        color: '#ca252b',
        x: 500,
        y: 250
    });

    expect(trains[0].nextStation).toStrictEqual({
        ID: 'S02',
        name: '名古屋',
        line: '桜通線',
        color: '#ca252b',
        x: 750,
        y: 500
    });
});

test('generateTrains: scheduleArray', () => {
    const t = 19850;
    const trains = generateTrains(scheduleArray, stationArray, t);
    expect(trains[0].scheduleArray).toStrictEqual([{
        name: '国際センター',
        next: null,
        line: '桜通線（徳重行）',
        time: [19980, 20580, 21180]
    }]);
});

test('generateTrains: stationArray', () => {
    const t = 19850;
    const trains = generateTrains(scheduleArray, stationArray, t);
    expect(trains[0].stationArray).toStrictEqual([{
        ID: 'S03',
        name: '国際センター',
        line: '桜通線',
        color: '#ca252b',
        x: 1000,
        y: 750
    }]);
});