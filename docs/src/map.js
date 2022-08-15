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
    return stations[0].stations.reduce((minValue, station) => {
        return minValue > station.latitude ? station.latitude : minValue;
    }, Infinity);
}

/**
 * 駅のJSONオブジェクトから、latitudeの最大値を取得する
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number}
 */
 const getMaxLatitude = (stations) => {
    return stations[0].stations.reduce((maxValue, station) => {
        return maxValue < station.latitude ? station.latitude : maxValue;
    }, -Infinity);
}

/**
 * 駅のJSONオブジェクトから、longitudeの最小値を取得する
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number}
 */
 const getMinLongitude = (stations) => {
    return stations[0].stations.reduce((minValue, station) => {
        return minValue > station.longitude ? station.longitude : minValue;
    }, Infinity);
}

/**
 * 駅のJSONオブジェクトから、longitudeの最大値を取得する
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number}
 */
 const getMaxLongitude = (stations) => {
    return stations[0].stations.reduce((maxValue, station) => {
        return maxValue < station.longitude ? station.longitude : maxValue;
    }, -Infinity);
}

/**
 * 経度をxy平面座標のxの値に変換する。
 * 経度が最小の点のx座標を0とする相対値で、倍率はscaleFactor
 * @param {number} longitude 経度
 * @param {number} X0 経度の最小値
 * @param {number} scaleFactor 倍率
 * @returns 
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
 * @returns 
 */
 const toYFromLatitude = (latitude, Y0, scaleFactor) => {
    return Math.round((Y0 - latitude) * scaleFactor);
}





export { getMinLatitude, getMaxLatitude, getMinLongitude, getMaxLongitude };