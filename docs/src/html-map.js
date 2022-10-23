import { element } from "./html-util.js";
import { toInlineStyleString, getRotateAngle, getStationColorByStationNames } from './map.js';
import { toTimeStringFromSec, makeLineName2DirectionMap } from './timetable.js';
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
 * 駅HTML要素の位置に時刻HTML要素`<span class="time">hh:mm</span>`を追加する
 * @param {HTML Element} parentElement 時刻を追加する親要素
 * @param {Map.<string, number>} stationName2Time 駅名：時刻のMap
 */
const addTimeNodes = (parentElement, stationName2Time) => {
    const nodeArray = [];
    for (const [stationName, time_s] of stationName2Time.entries()) {
        const stationElement = document.getElementById(stationName);
        const style = {
            top: stationElement.style.top,
            left: stationElement.style.left
        }
        const span = element`<span class="time" style="${toInlineStyleString(style)}">${toTimeStringFromSec(time_s)}</span>`;
        nodeArray.push(span);
    }
    const addNodes = (nodeArray) => {
        requestAnimationFrame(() => {
            if (!nodeArray.length) {
                return;
            }
            const [first, ...rest] = nodeArray;
            parentElement.appendChild(first);
            return addNodes(rest);
        });
    }
    addNodes(nodeArray);
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

/**
 * 指定したclass名を持つ要素からそのclass名を取り除く
 * @param {string} className 
 */
const removeClassAll = (className) => {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(element => {
        element.classList.remove(className);
    });
}

/**
 * 指定した要素の子要素をすべて取り除く
 * @param {HTML Element} parentElement 
 */
const removeAllChildren = (parentElement) => {
    while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
    }
}

/**
 * 指定した駅の時刻表のHTML要素を作って返す
 * @param {Array.<Schedule>} scheduleArray 
 * @param {Array.<Station>} stationArray 
 * @param {string} stationName 駅名
 * @param {event} event イベント
 * @returns {HTML Element}
 */
const createTimetableNode = (scheduleArray, stationArray, stationName, event) => {
    const style = {
        left: `${event.clientX - 30}px`,
        bottom: `${window.innerHeight - event.clientY}px`
    };
    const timetable = element`<div class="timetable" style="${toInlineStyleString(style)}"><h1>
        <span class="station-name">${stationName}</span>
        <span class="arrows">
            <span class="arrow1"></span>
            <span class="arrow2"></span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="square" stroke-linejoin="miter" fill="none">
            <path d="M8 15H3v-5"/>
            <path d="M5 13c5-5 12.575-4.275 16 1"/>
            <path stroke-linecap="round" d="M3 15l2-2"/>
        </svg>
        </h1></div>`;
    const container = element`<div class="container"></div>`;

    const schedules = scheduleArray.filter(schedule => schedule.name === stationName);
    const lineName2DirectionMap = makeLineName2DirectionMap(schedules, new Map());
    const num = lineName2DirectionMap.size;

    for (const [lineName, directionMap] of lineName2DirectionMap.entries()) {
        const color = stationArray.filter(station => station.line === lineName)[0].color;
        const style = {
            width: `calc(100%/${num})`,
            background: color
        }
        const input = element`<input type="radio" name="line" id="${lineName}"></input>`;
        const label = element`<label for="${lineName}" style="${toInlineStyleString(style)}">${lineName}</label>`;
        const table = element`<table><thead style="background: ${color}"></thead><tbody></tbody></table>`;
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        const [direction1, direction2] = directionMap.keys(); // keyは最大２つの想定
        const existDirection1 = directionMap.has(direction1) && directionMap.get(direction1).size;
        const existDirection2 = directionMap.has(direction2) && directionMap.get(direction2).size;

        // direction1だけに時刻表がある場合
        if (existDirection1 && !existDirection2) {
            table.classList.add('one-way');
            const head = element`<tr><th></th><th>${direction1}</th></tr>`;
            thead.appendChild(head);
            for (const hh of directionMap.get(direction1).keys()) {
                const tr = element`<tr><th>${hh}</th></tr>`;
                const td = element`<td>${directionMap.get(direction1).get(hh).join(' ')}</td>`;
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
        }
        // direction2だけに時刻表がある場合
        if (!existDirection1 && existDirection2) {
            table.classList.add('one-way');
            const head = element`<tr><th></th><th>${direction2}</th></tr>`;
            thead.appendChild(head);
            for (const hh of directionMap.get(direction2).keys()) {
                const tr = element`<tr><th>${hh}</th></tr>`;
                const td = element`<td>${directionMap.get(direction2).get(hh).join(' ')}</td>`;
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
        }
        // 両方に時刻表がある場合
        if (existDirection1 && existDirection2) {
            const head = element`<tr><th></th><th>${direction1}</th><th>${direction2}</th></tr>`;
            thead.appendChild(head);
            for (const hh of directionMap.get(direction1).keys()) {
                const tr = element`<tr><th>${hh}</th></tr>`;
                const td1 = element`<td>${directionMap.get(direction1).get(hh).join(' ')}</td>`;
                const td2 = directionMap.get(direction2).get(hh) ? element`<td>${directionMap.get(direction2).get(hh).join(' ')}</td>`
                                                                 : element`<td></td>`;
                tr.appendChild(td1);
                tr.appendChild(td2);
                tbody.appendChild(tr);
            }
        }
        container.appendChild(input);
        container.appendChild(label);
        container.appendChild(table);
    }
    container.querySelector('input').checked = true; // 先頭のラジオボタンにチェックを入れる
    timetable.appendChild(container);
    return timetable;
}

/**
 * 出発駅、乗換駅、到着駅のMapを与えると、div要素を返す
 * @param {Map.<string, number>} summaryMap { 駅名 => 出発時刻 } のMap
 * @param {Array.<Station>} stationArray
 * @returns {HTML Element}
 */
const createSummaryNode = (summaryMap, stationArray) => {
    const div = element`<div class="summary"><ol></ol></div>`;
    const ol = div.querySelector('ol');

    const stations = [];
    for (const [stationName, time] of summaryMap.entries()) {
        stations.push([stationName, time]);
    }
    for (let i = 0; i < stations.length; i++) {
        const stationName1 = stations[i][0];
        const time1 = stations[i][1];
        let color;
        if (i + 1 < stations.length) {
            const stationName2 = stations[i+1][0];
            color = getStationColorByStationNames(stationName1, stationName2, stationArray);
        }
        const li = element`<li><span class="start-time">${toTimeStringFromSec(time1)}</span><span class="station-name">${stationName1}</span></li>`;
        ol.appendChild(li);
        if (color) {
            const li = element`<li style="color: ${color}"></li>`;
            ol.appendChild(li);
        }
    }

    if (!summaryMap.size) {
        const li = element`<li>終電です</li>`;
        ol.appendChild(li);
    }
    return div;
}



export { createStation, addStationNodes, createLine, addLineNodes, addTimeNodes, removeElementsByClassName, createMap, removeClassAll,
        createTimetableNode, createSummaryNode, removeAllChildren };
