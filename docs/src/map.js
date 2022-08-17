import { element } from "./html-util.js";
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
 * 駅のJSONオブジェクトの１つの駅情報をHTML用に変換する
 * @param {Object} station 
 * @param {string} lineName 路線名
 * @param {string} lineColor 路線の色
 * @param {number} X0 経度の最小値
 * @param {number} Y0 緯度の最大値
 * @param {number} scaleFactor 倍率
 * @returns {Station} 変換後の駅オブジェクト { ID, stationName, lineName, color, x, y }
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

/**
 * 駅のJSONオブジェクトからHTML用の駅オブジェクトの配列に変換する
 * @param {Object} stations 駅のJSONオブジェクト
 * @returns {Array.<Array.<Station>>} 駅オブジェクトの配列の配列
 */
const convertStations = (stations) => {
    const X0 = getMinLongitude(stations);
    const Y0 = getMaxLatitude(stations);
    const dX = getMaxLongitude(stations) - X0;
    const scaleFactor = 1000/dX;

    return stations.map(line => {
        return line.stations.map(station => convert(station, line.lineName, line.lineColor, X0, Y0, scaleFactor));
    });
}

/**
 * オブジェクトで表現されたCSSのスタイルをインラインスタイルに変換する
 * @param {Object} object 
 * @returns {string}
 */
const toInlineStyleString = (object) => {
    const styles = [];
    for (const [key, value] of Object.entries(object)) {
        styles.push(`${key}: ${value}`);
    }
    return styles.join('; ');
}

/**
 * 
 * @param {HTML Element} parentElement 駅を追加する親要素
 * @param {Array.<Station>} stationArray 駅オブジェクトの配列
 */
const addStationNodes = (parentElement, stationArray) => {
    const addedStations = []; // 追加済みの駅名を格納する
    stationArray.forEach(station => {
        if (addedStations.includes(station.stationName)) {
            // 乗換駅が2重に追加されないように、追加済みの駅に対しては、class名とcolorだけ変更する
            const transferStation = document.querySelector(`#${station.stationName}`);
            transferStation.classList.add(station.lineName);
            transferStation.style.color = '#777';
        } else {
            const style = {
                top: `${station.y}px`,
                left: `${station.x}px`,
                color: station.color
            };
            const stationElement = element`<div id="${station.stationName}" class="station ${station.lineName}" style="${toInlineStyleString(style)}"><span>${station.stationName}</span></div>`;
            parentElement.appendChild(stationElement);
            addedStations.push(station.stationName);
        }
    });
}

/**
 * 点Aから点Bに向かうとき、線分ABとx軸のなす角度を求める。
 * CSSのtransform: rotate()の回転角に使う想定なのでラジアンではなくdegで求める。
 * @param {numbar} dX 右側を正とする水平方向の変位
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
 * 駅Aと駅Bをつなぐ線分のHTML要素を生成して返す。
 * @param {Station} stationA 
 * @param {Station} stationB 
 * @returns {HTML Element}
 */
 const createLine = (stationA, stationB) => {
    const dX = stationB.x - stationA.x;
    const dY = stationB.y - stationA.y;
    const r = Math.hypot(dX, dY);
    const deg = getRotateAngle(dX, dY);

    const style = {
        top: `${stationA.y}px`,
        left: `${stationA.x}px`,
        width: `${r}px`,
        transform: `rotate(${deg}deg) translate(0, -3px)`,
        background: stationA.color
    }

    const lineElement = element`<span class="line" style="${toInlineStyleString(style)}"></span>`;
    return lineElement;
}

/**
 * 
 * @param {HTML Element} parentElement 路線を追加する親要素
 * @param {Array.<Station>} stationArray 駅オブジェクトの配列
 */
const addLineNodes = (parentElement, stationArray) => {
    for (let i = 0; i < stationArray.length - 1; i++) {
        const A = stationArray[i];
        const B = stationArray[i + 1];
        const lineElement = createLine(A, B);
        parentElement.appendChild(lineElement);
    }
}

export { getMinLatitude, getMaxLatitude, getMinLongitude, getMaxLongitude, convertStations, addStationNodes, getRotateAngle, toInlineStyleString, addLineNodes };