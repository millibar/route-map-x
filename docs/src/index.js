console.log('index.js loaded.');

import { convertStations  } from './map.js';
import { convertTimetable, makeSummaryMap, toSecFromNow } from './timetable.js';
import { addTimeNodes, removeElementsByClassName, createMap, removeClassAll, createTimetableNode, createTimetableContentNode, createSummaryNode, removeAllChildren } from './html-map.js';
import { TrainGenerator } from './html-train.js';
import { dijkstraEnd, dijkstraStart } from './dijkstra.js';
import { UIContainer } from './UI.js';
import { convertDayType, setDaySelector } from './day.js';
import { setDayType, setDijkstraStart, setDijkstraResult, setScheduleArray, setTrainGenerator } from './state.js';

/**
 * ./data にあるJSONファイルを取得し、オブジェクトに変換して返す
 * @param {string} fileName ./dataにあるファイル名。stations.json | timetable.json | holiday.json
 * @returns {Object} JSON Object
 */
const fetchJSONData = (fileName) => {
    return fetch(`./data/${fileName}`).then(response => {
        return response.json();
    }).catch(error => {
        console.error('JSONデータの取得に失敗しました：', error);
    });
}

/**
 * 平日・土日休選択ボタンが切り替わったとき呼ばれる。電車を再生成して、更新後の状態を返す
 * @param {State} state 状態
 * @param {string} dayType 平日 or 土日休
 * @param {Array.<Schedule>} scheduleArray
 * @returns {State} 更新後の状態
 */
const hundleDayChange = (state, dayType, scheduleArray) => {
    removeElementsByClassName('train');
    removeElementsByClassName('time');
    removeClassAll('active');
    removeClassAll('dijkstra-start');
    state.trainGenerator.stop();

    let newState = setDayType(state, dayType);
    newState = setScheduleArray(newState, scheduleArray);
    newState = setDijkstraStart(newState, null);
    newState = setDijkstraResult(newState, null);
    newState = setTrainGenerator(newState, new TrainGenerator(newState.scheduleArray, newState.stationArray, newState.routemap));
    newState.trainGenerator.generate();

    return newState;
}

/**
 * 最短経路を求めるために必要な状態と選択した駅を与えると、必要な処理を行ったうえで、更新後の状態を返す
 * @param {State} state 状態
 * @param {string} stationName クリックした駅名
 * @returns {State} 更新後の状態
 */
const hundleDijkstra = (state, stationName) => {
    // 以下のifは状態に応じた排他条件
    if (stationName === null) {
        const newState = setDijkstraStart(state, null);
        return setDijkstraResult(newState, null);
    }

    if (state.dijkstraStart != stationName && !state.dijkstraResult) {
        console.log(`${stationName}から`);
        return dijkstraStart(stationName, toSecFromNow(new Date()), 200, state.scheduleArray).then(result => {
            const newState = setDijkstraStart(state, stationName);
            return setDijkstraResult(newState, result);
        });
    }

    if (state.dijkstraStart != stationName && state.dijkstraResult) {
        console.log(`${stationName}までの最短経路`);
        const newState = setDijkstraStart(state, null);
        return setDijkstraResult(newState, null);
    }

    return state;
}

/**
 * 状態に応じてviewを更新する
 * @param {State} state 状態
 * @param {string} stationName 駅名
 * @param {event} event イベント
 * @returns {State} 更新後の状態
 */
const hundleTimetable = (state, stationName, event) => {

    const init = () => {
        state.UI.activate();
        removeElementsByClassName('time');
        removeClassAll('active');

        const elements = document.querySelectorAll('.dijkstra-start');
        elements.forEach(element => element.classList.remove('dijkstra-start'));

        const daySelectors = document.querySelectorAll('.day-selector input');
        daySelectors.forEach(input => input.disabled = false);

        const timetableElement = document.querySelector('.timetable');
        if (timetableElement) {
            timetableElement.removeEventListener('click', open);
            const closeBtn = timetableElement.querySelector('svg');
            closeBtn.removeEventListener('click', close);
            timetableElement.remove();
        }

        const summaryElement = document.querySelector('.summary');
        if (summaryElement) {
            summaryElement.remove();
        }
    }

    if (stationName === null) {
        init();
        return state;
    }

    // ダイクストラの始点を決めたとき
    if (!state.dijkstraResult) {
        init();
        const daySelectors = document.querySelectorAll('.day-selector input');
        daySelectors.forEach(input => input.disabled = true);

        const station = document.getElementById(stationName);
        station.classList.add('dijkstra-start');

        const timetableElement = createTimetableNode(stationName, event);
        const closeBtn = timetableElement.querySelector('svg');
        document.body.appendChild(timetableElement);

        timetableElement.addEventListener('click', open = (e) => {
            e.stopPropagation();
            timetableElement.classList.remove('close');
            timetableElement.classList.add('open');
            state.UI.deactivate();
        });

        closeBtn.addEventListener('click', close = (e) => {
            e.stopPropagation();
            timetableElement.classList.remove('open');
            timetableElement.classList.add('close');
            state.UI.activate();
        });

        setTimeout(() => {
            // この処理は少し重いので非同期で行う
            const timetableContentElement = createTimetableContentNode(state.scheduleArray, state.stationArray, stationName);
            timetableElement.appendChild(timetableContentElement);
        }, 10);
        
        return state;
    }

    // ダイクストラの終点を決めたとき
    if (state.dijkstraStart != stationName && state.dijkstraResult) {
        removeElementsByClassName('time');
        removeClassAll('active');

        // 出発駅のラベル表示を消す
        const timetableElement = document.querySelector('.timetable');
        timetableElement.removeEventListener('click', open);
        const closeBtn = timetableElement.querySelector('svg');
        closeBtn.removeEventListener('click', close);
        timetableElement.remove();

        // 出発駅のスタイルを消す
        const startStation = document.getElementById(state.dijkstraStart);
        startStation.classList.remove('dijkstra-start');

        // 出発駅から到着駅までの経路上に各駅の出発時刻を表示する
        const shortestPathMap = dijkstraEnd(stationName, state.dijkstraResult); // 駅名=> [時刻]
        const stationName2Time = new Map();
        shortestPathMap.forEach((times, stationName) => {
            stationName2Time.set(stationName, times[times.length - 1]);
        });
        addTimeNodes(state.routemap, stationName2Time);
        
        // 出発駅 >> （乗換駅）>> 到着駅のラベルを表示する
        const summaryMap = makeSummaryMap(shortestPathMap); // 終電の場合は空のMap
        const summaryElement = createSummaryNode(summaryMap, state.stationArray);
        document.body.appendChild(summaryElement);
        
        return state;
    }

    // それ以外
    return state;
}


const start = async () => {
    // 地図を追加する
    const stations = await fetchJSONData('stations.json');
    const station2DArray = convertStations(stations, 1000);
    const routemap = createMap(station2DArray);
    document.body.appendChild(routemap);

    // 地図に移動・拡大縮小機能を追加する
    const container = new UIContainer(routemap);
    const scaleBtn = document.querySelector('.zoom');
    container.add(scaleBtn, container.initScale.bind(container));

    // 休日情報を読み込む
    const holidays = await fetchJSONData('holiday.json');
    const dayType = convertDayType(new Date(), holidays);

    // 平日・土日休選択ボタンにdayTypeをセットする
    const daySelectors = document.querySelectorAll('.day-selector input');
    setDaySelector(dayType, daySelectors);

    // 時刻表を読み込む
    const timetable = await fetchJSONData('timetable.json');
    const scheduleArrayWeekday = convertTimetable(timetable, '平日');
    const scheduleArrayHoliday = convertTimetable(timetable, '土日休');
    const scheduleArray = dayType === '平日' ? scheduleArrayWeekday : scheduleArrayHoliday;

    // 電車を追加する
    const stationArray = station2DArray.flat();
    let state = {
        dayType: dayType,
        routemap: routemap,
        stationArray: stationArray,
        scheduleArray: scheduleArray,
        trainGenerator: new TrainGenerator(scheduleArray, stationArray, routemap),
        dijkstraStart: null,
        dijkstraResult: null,
        UI: container
    };
    state.trainGenerator.generate();

    // 平日・土日休選択ボタンにscheduleArrayを再設定するイベントリスナーを登録する
    const dayTypes = {
        'weekday': '平日',
        'holiday': '土日休'
    };
    daySelectors.forEach(input => {
        input.addEventListener('change', () => {
            const dayType = dayTypes[input.value];
            const scheduleArray = dayType === '平日' ? scheduleArrayWeekday : scheduleArrayHoliday;
            state = hundleDayChange(state, dayType, scheduleArray);
        });
    });

    // 各駅にダイクストラのイベントリスナーを登録する
    const stationElements = document.querySelectorAll('.station');
    stationElements.forEach(station => {
        station.addEventListener('click', async (e) => {
            e.stopPropagation();
            const stationName = e.target.id;
            state = hundleTimetable(state, stationName, e);
            state = await hundleDijkstra(state, stationName);
        });
    });

    // 各駅のラベルにダイクストラのイベントリスナーを登録する
    const stationLabels = document.querySelectorAll('.station span');
    stationLabels.forEach(label => {
        label.addEventListener('click', async (e) => {
            e.stopPropagation();
            const stationName = e.target.parentElement.id;
            state = hundleTimetable(state, stationName, e);
            state = await hundleDijkstra(state, stationName);
        });
    });

    // マップ上をクリックするとダイクストラの計算をキャンセルする
    routemap.addEventListener('click', (e) => {
        console.log('キャンセル');
        e.stopPropagation();
        state = hundleTimetable(state, null, e);
        state = hundleDijkstra(state, null);
    });
}

start();