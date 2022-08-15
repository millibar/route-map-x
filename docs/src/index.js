console.log('index.js loaded.');

import { getMinLatitude } from "./map.js";

/**
 * ./data にあるJSONファイルを取得し、オブジェクトに変換して返す
 * @param {string} fileName ./dataにあるファイル名。stations.json or timetable.json
 * @returns {Object} JSON Object
 */
const fetchJSONData = (fileName) => {
    return fetch(`../data/${fileName}`).then(response => {
        return response.json();
    }).catch(error => {
        console.error('JSONデータの取得に失敗しました：', error);
    });
}



const display = async () => {
    const stations = await fetchJSONData('stations.json');
    console.log(stations[0].stations[0].stationName);

    console.log(getMinLatitude(stations));
}

display();


export { fetchJSONData };
