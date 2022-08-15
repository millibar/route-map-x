/**
 * 駅を二次元平面のマップ上にプロットするため、駅の位置情報（経度、緯度）をx, y座標に変換する。
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
 * 経度をxy平面座標のxの値に変換する。
 * @param {number} latitude 
 * @param {number} X0 
 * @param {number} scaleFactor 
 * @returns 
 */
 const toXFromLatitude = (latitude, X0, scaleFactor) => {
    return latitude;

}

/**
 * 緯度をxy平面座標のyの値に変換する。
 * @param {number} longitude 
 * @param {number} Y0 
 * @param {number} scaleFactor 
 * @returns 
 */
const toYFromLongitude = (longitude, Y0, scaleFactor) => {
    return longitude;
}


export { getMinLatitude };