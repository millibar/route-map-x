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
 * 駅のJSONオブジェクトの経度の最大値と最小値の差を求める
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number} 地図の幅
 */
const calcMapWidth = (stations) => {
    return getMaxLongitude(stations) - getMinLongitude(stations);
}

/**
 * 駅のJSONオブジェクトの緯度の最大値と最小値の差を求める
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {number} 地図の高さ
 */
const calcMapHeight = (stations) => {
    return getMaxLatitude(stations) - getMinLatitude(stations);
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
 * 駅のJSONオブジェクトの１つの駅情報をHTML用に変換する
 * @param {Object} station 
 * @param {string} lineName 路線名
 * @param {string} lineColor 路線の色
 * @param {string} lineStyle 名港線のみ'double', それ以外はundefined
 * @param {number} X0 経度の最小値
 * @param {number} Y0 緯度の最大値
 * @param {number} scaleFactor 倍率
 * @returns {Station} 変換後の駅オブジェクト Station = { ID, name, line, color, x, y (,next, lineStyle) }
 */
const convert = (station, lineName, lineColor, lineStyle, X0, Y0, scaleFactor) => {
    const converted = {
        ID: station.ID,
        name: station.name,
        line: lineName,
        color: lineColor,
        x: toXFromLongitude(station.longitude, X0, scaleFactor),
        y: toYFromLatitude(station.latitude, Y0, scaleFactor)
    };
    if (station.next) { // 環状線は最後の駅にnextプロパティを持つ
        converted.next = station.next;
    }
    if (lineStyle) { // 名港線は double
        converted.lineStyle = lineStyle;
    }
    return converted;
}

/**
 * 路線ごとに、駅の経度・緯度をx, yに変換した駅オブジェクトの配列を返す
 * @param {Object} stations 駅のJSONオブジェクト
 * @param {number} baseWidth 地図の横幅
 * @returns {Array.<Array.<Station>>} 「駅オブジェクトの配列」の配列（路線ごと）
 */
const convertStations = (stations, baseWidth) => {
    const X0 = getMinLongitude(stations);
    const Y0 = getMaxLatitude(stations);
    const scaleFactor = baseWidth/calcMapWidth(stations);

    return stations.map(line => {
        return line.stations.map(station => convert(station, line.lineName, line.lineColor, line.lineStyle, X0, Y0, scaleFactor));
    });
}

/**
 * オブジェクトで表現されたCSSのスタイルをインラインスタイルに変換する
 * @param {Object} object 
 * @returns {string}
 */
const toInlineStyleString = (object) => {
    const styles = [];
    const camelCases = {
        'borderTop': 'border-top',
        'borderBottom': 'border-bottom'
    }
    for (const [key, value] of Object.entries(object)) {
        if (camelCases[key]) {
            styles.push(`${camelCases[key]}: ${value}`);
        } else {
            styles.push(`${key}: ${value}`);
        }
    }
    return styles.join('; ') + ';';
}

/**
 * 点Aから点Bに向かうとき、線分ABとx軸のなす角度を求める。
 * CSSのtransform: rotate()の回転角に使う想定なのでラジアンではなくdegで求める。
 * @param {number} dX 右側を正とする水平方向の変位
 * @param {number} dY 下側を正とする垂直方向の変位
 * @return {number} deg
 */
 const getRotateAngle = (dX, dY) => {
    if (dX === 0) {
        return dY > 0 ? 90 : -90; // dX, dYともに0のときも -90になるが、想定しない
    }

    const rad = Math.atan(dY/dX);
    let deg = rad * 180/Math.PI;

    return dX > 0 ? deg : deg + 180; // atanの値域は、-π/2 < rad < π/2 なので、値域を360°に拡張する
}

/**
 * 路線名から駅の色コードを取得する
 * @param {string} lineName 路線名
 * @param {Array.<Station>} stationArray 
 * @returns {string} 色コード
 */
const getStationColor = (lineName, stationArray) => {
    return stationArray.filter(station => station.line === lineName.split('（')[0])[0].color;
}

/**
 * ２つの駅名からその駅（路線）の色コードを取得する
 * @param {string} stationName1 駅名
 * @param {string} stationName2 駅名
 * @param {Array.<Station>} stationArray 
 * @returns {string} 色コード
 */
const getStationColorByStationNames = (stationName1, stationName2, stationArray) => {
    let color;
    for (const station1 of stationArray) {
        if (station1.name === stationName1) {
            color = station1.color;
            for (const station2 of stationArray) {
                if (station2.name === stationName2 && color === station2.color) {
                    return color;
                }
            }
        }
    }
}


export {
    getMinLatitude, getMaxLatitude, getMinLongitude, getMaxLongitude, 
    calcMapWidth, calcMapHeight, convertStations, getRotateAngle, toInlineStyleString, getStationColor, getStationColorByStationNames
};