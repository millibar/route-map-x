import { element } from "./html-util.js";
import { toInlineStyleString, getRotateAngle } from './map.js';
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
    const stationElement = element`<div id="${station.stationName}" class="station ${station.lineName}" style="${toInlineStyleString(style)}"><span>${station.stationName}</span></div>`;
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
        if (addedStations.includes(station.stationName)) {
            // 乗換駅が2重に追加されないように、追加済みの駅に対しては、class名とcolorだけ変更する
            const transferStation = document.querySelector(`#${station.stationName}`);
            transferStation.classList.add(station.lineName);
            transferStation.style.color = '#777';
        } else {
            const stationElement = createStation(station);
            parentElement.appendChild(stationElement);
            addedStations.push(station.stationName);
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
    for (let i = 0; i < stationArray.length - 1; i++) {
        const A = stationArray[i];
        const B = stationArray[i + 1];
        const lineElement = createLine(A, B);
        parentElement.appendChild(lineElement);
    }
}

export { createStation, addStationNodes, createLine, addLineNodes };
