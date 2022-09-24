import { setDayType, setDijkstraResult, setDijkstraStart } from "../src/state.js";

test('setDayType', () => {
    const state = {
        dayType: '平日',
        dijkstraStart: null,
        dijkstraResult: null
    };

    const expected = {
        dayType: '土日休',
        dijkstraStart: null,
        dijkstraResult: null
    }

    expect(setDayType(state, '土日休')).toStrictEqual(expected);
    expect(state).toStrictEqual({
        dayType: '平日',
        dijkstraStart: null,
        dijkstraResult: null
    });
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