import { element } from "./html-util.js";
import { toInlineStyleString, getRotateAngle, calcMapWidth, calcMapHeight, convertStations } from './map.js';
import { toTimeStringFromSec } from './timetable.js';
/**
 * 駅オブジェクトから駅のHTML要素を生成して返す
 * @param {Station} station 
 * @returns {HTML Element}
 */
 const createStation = (station) => {
    const style = {
        top: `${station.y}px`,
        left: `${station.x}px`,
        color: station.color
    };
    const stationElement = element`<div id="${station.name}" class="station ${station.line}" style="${toInlineStyleString(style)}"><span>${station.name}</span></div>`;
    return stationElement;
}

/**
 * 対象のHTML要素の子に駅HTML要素を追加する
 * @param {HTML Element} parentElement 駅を追加する親要素
 * @param {Array.<Station>} stationArray 駅オブジェクトの配列
 */
 const addStationNodes = (parentElement, stationArray) => {
    const addedStations = []; // 追加済みの駅名を格納する
    stationArray.forEach(station => {
        if (addedStations.includes(station.name)) {
            // 乗換駅が2重に追加されないように、追加済みの駅に対しては、class名とcolorだけ変更する
            const transferStation = parentElement.querySelector(`#${station.name}`);
            transferStation.classList.add(station.line);
            transferStation.style.color = '#999';
        } else {
            const stationElement = createStation(station);
            parentElement.appendChild(stationElement);
            addedStations.push(station.name);
        }
    });
}

/**
 * 駅Aと駅Bをつなぐ線分のHTML要素を生成して返す
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
 * 対象のHTML要素の子に路線HTML要素を追加する
 * @param {HTML Element} parentElement 路線を追加する親要素
 * @param {Array.<Station>} stationArray 駅オブジェクトの配列
 */
const addLineNodes = (parentElement, stationArray) => {
    for (let i = 1; i < stationArray.length; i++) {
        const A = stationArray[i];
        const B = stationArray[i - 1];
        const lineElement = createLine(A, B);
        parentElement.appendChild(lineElement);

        if (A.next) { // 環状線は最後の駅にnextプロパティを持つ
            const C = stationArray.filter(station => station.ID === A.next)[0];
            const lineElement2 = createLine(A, C);
            parentElement.appendChild(lineElement2);
        }
    }
}

/**
 * 駅HTML要素に時刻HTML要素`<span class="time">hh:mm</span>`を追加する
 * @param {Map.<string, number>} stationName2Time 駅名：時刻のMap
 */
const addTimeNodes = (stationName2Time) => {
    for (const [stationName, time_s] of stationName2Time.entries()) {
        const stationElement = document.getElementById(stationName);
        const span = element`<span class="time">${toTimeStringFromSec(time_s)}</span>`;
        stationElement.appendChild(span);
    }
}

/**
 * 指定したクラス名を持つHTML要素を削除する
 * @param {string} className クラス名
 */
const removeElementsByClassName = (className) => {
    const nodeList = document.querySelectorAll(`.${className}`);
    nodeList.forEach(element => {element.remove()});
}

/**
 * 路線図のHTML要素を返す
 * @param {Array.<Array.<Station>>} station2DArray 「駅オブジェクトの配列」の配列（路線ごと）
 * @returns {HTML Element} 路線図要素`<div class="routemap"></div>`
 */
const createMap = (station2DArray) => {
    const routemap = element`<div class="routemap"></div>`;

    const maxX = station2DArray.flat().reduce((maxValue, station) => {
        return maxValue < station.x ? station.x : maxValue;
    }, -Infinity);

    const minX = station2DArray.flat().reduce((minValue, station) => {
        return minValue > station.x ? station.x : minValue;
    }, Infinity);

    const maxY = station2DArray.flat().reduce((maxValue, station) => {
        return maxValue < station.y ? station.y : maxValue;
    }, -Infinity);

    const minY = station2DArray.flat().reduce((minValue, station) => {
        return minValue > station.y ? station.y : minValue;
    }, Infinity);

    routemap.style.width = `${maxX - minX}px`;
    routemap.style.height = `${maxY - minY}px`;

    addStationNodes(routemap, station2DArray.flat());
    for (const line of station2DArray) {
        addLineNodes(routemap, line);
    }
    return routemap;
}

export { createStation, addStationNodes, createLine, addLineNodes, addTimeNodes, removeElementsByClassName, createMap };
