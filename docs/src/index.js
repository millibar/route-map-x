console.log('index.js loaded.');

import { convertStations, setDijkstraStart, setDijkstraResult } from './map.js';
import { convertTimetable, toSecFromNow } from './timetable.js';
import { addTimeNodes, removeElementsByClassName, createMap  } from './html-map.js';
import { TrainGenerator } from './html-train.js';
import { dijkstraEnd, dijkstraStart } from './dijkstra.js';

/**
 * ./data にあるJSONファイルを取得し、オブジェクトに変換して返す
 * @param {string} fileName ./dataにあるファイル名。stations.json or timetable.json
 * @returns {Object} JSON Object
 */
const fetchJSONData = (fileName) => {
    return fetch(`./data/${fileName}`).then(response => {
        return response.json();
    }).catch(error => {
        console.error('JSONデータの取得に失敗しました：', error);
    });
}






const display = async () => {
    // 地図を追加する
    const stations = await fetchJSONData('stations.json');
    const station2DArray = convertStations(stations, 1000);
    const routemap = createMap(station2DArray);
    document.body.appendChild(routemap);

    // 電車を地図に追加する
    const timetable = await fetchJSONData('timetable.json');
    const scheduleArray = convertTimetable(timetable, '平日');
    const trainGenerator = new TrainGenerator(scheduleArray, station2DArray.flat(), routemap);
    trainGenerator.generate();
    
    let state = {
        dijkstraStart: null,
        dijkstraResult: null
    };

    const hundleDijkstra = (station) => {
        removeElementsByClassName('time');

        if (station === null) {
            const elements = document.querySelectorAll('.dijkstra-start');
            elements.forEach(element => {
                element.classList.remove('dijkstra-start');
            });
            state = setDijkstraStart(state, null);
            state = setDijkstraResult(state, null);
            return;
        }

        const stationName = station.id;

        if (state.dijkstraStart != station && !state.dijkstraResult) {
            console.log(`${stationName}から`);
            const result = dijkstraStart(stationName, toSecFromNow(new Date()), scheduleArray);
            state = setDijkstraStart(state, station);
            state = setDijkstraResult(state, result);
            station.classList.add('dijkstra-start');
        }

        if (state.dijkstraStart != station && state.dijkstraResult) {
            console.log(`${stationName}までの最短経路`);
            const stationName2Time = dijkstraEnd(stationName, state.dijkstraResult);
            addTimeNodes(routemap, stationName2Time);
            state.dijkstraStart.classList.remove('dijkstra-start');
            state = setDijkstraStart(state, null);
            state = setDijkstraResult(state, null);
        } 
    }

    // 各駅にダイクストラのイベントリスナーを設定する
    const stationElements = document.querySelectorAll('.station');
    stationElements.forEach(station => {
        station.addEventListener('click', (e) => {
            e.stopPropagation();
            hundleDijkstra(e.target);
        });
    });

    // 各駅のラベルにダイクストラのイベントリスナーを設定する
    const stationLabels = document.querySelectorAll('.station span');
    stationLabels.forEach(label => {
        label.addEventListener('click', (e) => {
            e.stopPropagation();
            hundleDijkstra(e.target.parentElement);
        });
    });

    // マップ上をクリックするとダイクストラの計算をキャンセルする
    routemap.addEventListener('click', (e) => {
        console.log('キャンセル');
        e.stopPropagation();
        hundleDijkstra(null);
    });

}

display();