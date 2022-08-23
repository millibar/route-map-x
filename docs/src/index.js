console.log('index.js loaded.');

import { convertStations, setDijkstraStart, setDijkstraResult } from './map.js';
import { convertTimetable, toSecFromNow } from './timetable.js';
import { addTimeNodes, removeElementsByClassName, createMap  } from './html-map.js';
import { createTrains } from './train.js';
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

    const now = toSecFromNow(new Date());
    const trains = createTrains(scheduleArray, station2DArray, now);
    trains.flat().forEach(train => train.start(routemap));

    

    
    
    

    let state = {
        dijkstraStart: null,
        dijkstraResult: null
    };

    // 各駅にダイクストラのイベントリスナーを設定する
    const stationElements = document.querySelectorAll('.station');
    stationElements.forEach(station => {
        station.addEventListener('click', (e) => {
            removeElementsByClassName('time');
            const stationName = e.target.id;

            if (state.dijkstraStart && state.dijkstraResult) {
                console.log(`${stationName}までの最短経路`);
                const stationName2Time = dijkstraEnd(stationName, state.dijkstraResult);
                addTimeNodes(routemap, stationName2Time);
                state.dijkstraStart.classList.remove('dijkstra-start');
                state = setDijkstraStart(state, null);
                state = setDijkstraResult(state, null);
            } else {
                console.log(`${stationName}から`);
                const result = dijkstraStart(stationName, toSecFromNow(new Date()), scheduleArray);
                state = setDijkstraStart(state, e.target);
                state = setDijkstraResult(state, result);
                e.target.classList.add('dijkstra-start');
            }
            
        });
    });

}

display();