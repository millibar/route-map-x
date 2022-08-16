/**
 * 駅を二次元平面のマップ上にプロットするため、駅の位置情報（緯度 latitude、経度 longitude）をx, y座標に変換する。
 * マップの原点O(0, 0)は領域の左上の点とし、x軸の正（右）方向が東、y軸の正（下）方向が南に対応する。
 * 
 * 駅の位置を地図上で区別しやすいように、
 * 対象とする駅のうち、最も西にある（経度が最小の）駅と最も東にある（経度が最大の）駅の距離を基準とした相対値（scaleFactor）を定義し
 * scaleFactorを用いて座標変換を行う。
 */


/**
 * 駅のJSONオブジェクトから、latitudeの最小値を取得する
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number}
 */
const getMinLatitude = (stations) => {
    const minValueOfLines = stations.map(line => {
        return line.stations.reduce((minValue, station) => {
            return minValue > station.latitude ? station.latitude : minValue;
        }, Infinity);
    });
    return minValueOfLines.reduce((a, b) => Math.min(a, b));
}

/**
 * 駅のJSONオブジェクトから、latitudeの最大値を取得する
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number}
 */
 const getMaxLatitude = (stations) => {
    const maxValueOfLines = stations.map(line => {
        return line.stations.reduce((maxValue, station) => {
            return maxValue < station.latitude ? station.latitude : maxValue;
        }, -Infinity);
    });
    return maxValueOfLines.reduce((a, b) => Math.max(a, b));
}

/**
 * 駅のJSONオブジェクトから、longitudeの最小値を取得する
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number}
 */
 const getMinLongitude = (stations) => {
    const minValueOfLines = stations.map(line => {
        return line.stations.reduce((minValue, station) => {
            return minValue > station.longitude ? station.longitude : minValue;
        }, Infinity);
    });
    return minValueOfLines.reduce((a, b) => Math.min(a, b));
}

/**
 * 駅のJSONオブジェクトから、longitudeの最大値を取得する
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number}
 */
 const getMaxLongitude = (stations) => {
    const maxValueOfLines = stations.map(line => {
        return line.stations.reduce((maxValue, station) => {
            return maxValue < station.longitude ? station.longitude : maxValue;
        }, -Infinity);
    });
    return maxValueOfLines.reduce((a, b) => Math.max(a, b));
}

/**
 * 経度をxy平面座標のxの値に変換する。
 * 経度が最小の点のx座標を0とする相対値で、倍率はscaleFactor
 * @param {number} longitude 経度
 * @param {number} X0 経度の最小値
 * @param {number} scaleFactor 倍率
 * @returns {number} 変換後のx
 */
 const toXFromLongitude = (longitude, X0, scaleFactor) => {
    return Math.round((longitude - X0) * scaleFactor);
}

/**
 * 緯度をxy平面座標のyの値に変換する。
 * 緯度が最大の点のy座標を0とする相対値で、倍率はscaleFactor
 * @param {number} latitude 緯度
 * @param {number} Y0 緯度の最大値
 * @param {number} scaleFactor 倍率
 * @returns {number} 変換後のy
 */
 const toYFromLatitude = (latitude, Y0, scaleFactor) => {
    return Math.round((Y0 - latitude) * scaleFactor);
}


/**
 * JSONの駅情報をHTMLに変換するために情報を変換する
 * @param {Object} station 
 * @param {string} lineName 路線名
 * @param {string} lineColor 路線の色
 * @param {number} X0 経度の最小値
 * @param {number} Y0 緯度の最大値
 * @param {number} scaleFactor 倍率
 * @returns {Object} 変換後の駅オブジェクト
 */
const convert = (station, lineName, lineColor, X0, Y0, scaleFactor) => {
    return {
        ID: station.ID,
        stationName: station.name,
        lineName: lineName, 
        color: lineColor,
        x: toXFromLongitude(station.longitude, X0, scaleFactor),
        y: toYFromLatitude(station.latitude, Y0, scaleFactor)
    };
}

const createStations = (stations) => {
    const X0 = getMinLongitude(stations);
    const Y0 = getMaxLatitude(stations);
    const dX = getMaxLongitude(stations) - getMinLongitude(stations);
    const scaleFactor = 1000/dX;

    return stations.flatMap(line => {
        return line.stations.map(station => convert(station, line.lineName, line.lineColor, X0, Y0, scaleFactor));
    });
}



export { getMinLatitude, getMaxLatitude, getMinLongitude, getMaxLongitude, createStations };