import { element } from "./html-util.js";
import { addTimeNodes, removeElementsByClassName } from "./html-map.js";
import { getRotateAngle } from "./map.js";
import { extractSchedules, isBetween, maxValueLessThanOrEqualTo, minValueGreaterThanOrEqualTo, toSecFromNow, convertTimetable } from "./timetable.js";

/**
 * 出発駅と到着駅の座標と時刻表を持ってインスタンス化する
 */
class Train {
    constructor(currSchedule, nextSchedule, currStation, nextStation, color, scheduleArray, stationArray) {
        this.x = 0;
        this.y = 0;
        this.deg = 0;
        this.element = element`<span class="train ${currStation.line}" ></span>`;//style="background-color: ${color}"
        this.reqId = null;
    
        this.currSchedule = currSchedule;
        this.nextSchedule = nextSchedule;
        this.currStation = currStation;
        this.nextStation = nextStation;

        this.scheduleArray = scheduleArray;
        this.stationArray = stationArray;

        /**
         * フレーム更新ごとに呼ばれる。現在時刻tにおける電車の座標x, yと角度degを更新する
         */
        this.update = () => {
            const t = toSecFromNow(new Date());

            // 出発駅から到着駅までの時間は
            const t1 = maxValueLessThanOrEqualTo(t, this.currSchedule.time);
            const t2 = minValueGreaterThanOrEqualTo(t, this.nextSchedule.time);
            const dT = t2 - t1;

            // 出発駅から到着駅までの距離は
            const dX = this.nextStation.x - this.currStation.x;
            const dY = this.nextStation.y - this.currStation.y;

            // 出発駅から到着駅までの平均速度は
            const Vx = dX/dT;
            const Vy = dY/dT;

            // 時刻tにおける電車の位置と角度を更新する
            this.x = this.currStation.x + Vx * (t - t1);
            this.y = this.currStation.y + Vy * (t - t1);
            this.deg = getRotateAngle(dX, dY);

            this.go();

            // 到着駅に着いた場合、currとnextを更新する
            if (t >= t2) {
                if (this.nextSchedule.next) {
                    this.next();
                } else {
                    this.stop();
                }
            } else {
                this.reqId = window.requestAnimationFrame(this.update);
            }
        }

        /**
         * 最初に１回だけ呼ばれる。電車を地図上に追加する
         */
        this.start = (parentElement) => {
            parentElement.appendChild(this.element);
            this.element.addEventListener('click', () => {this.displaySchedule(parentElement)});
            console.log(`${this.currStation.name} →  ${this.nextStation.name}`);
            this.update();
        }

        /**
         * 終点に到着したとき呼ばれる。updateを停止し、30秒後に電車を削除する
         */
        this.stop = () => {
            console.log(`${this.nextStation.line}の終点、${this.nextStation.name}に到着`);
            window.cancelAnimationFrame(this.reqId);
            setTimeout(() => {
                document.querySelector('.routemap').removeChild(this.element);
            }, 30000);
        }

        /**
         * 次の駅に到着したとき呼ばれる。出発駅と到着駅を更新する
         */
        this.next = () => {
            this.currSchedule = this.nextSchedule;
            this.nextSchedule = this.scheduleArray.filter(schedule => schedule.name === this.currSchedule.next)[0];
            
            this.currStation = this.nextStation;
            this.nextStation = this.stationArray.filter(station => station.name === this.currSchedule.next)[0];

            console.log(`${this.currStation.name} →  ${this.nextStation.name}`);
            this.update();
        }

        /**
         * フレーム更新ごとに呼ばれる。地図上の電車の位置を更新する
         */
        this.go = () => {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
            this.element.style.transform = `rotate(${this.deg}deg) translate(-12px, -12px)`; // width, height 24pxなので、半分ずらす
        }

        /**
         * 電車をタップすると、その電車の進行方向の駅に時刻を表示する
         */
        this.displaySchedule = (parentElement) => {
            removeElementsByClassName('time');

            // 次の駅以降のスケジュールを取得する
            const schedules = extractSchedules(this.scheduleArray, this.nextSchedule.name);

            // 駅名:時刻のMapを作る
            const stationName2Time = new Map();
            for (let i = 0; i < schedules.length; i++) {
                const t = (i === 0) ? toSecFromNow(new Date()) : stationName2Time.get(schedules[i - 1].name);
                const time = minValueGreaterThanOrEqualTo(t, schedules[i].time);
                stationName2Time.set(schedules[i].name, time);
            }
            addTimeNodes(parentElement, stationName2Time);
        }
    }
}

/**
 * 現在時刻tにおいて、指定した路線上に電車を生成する
 * @param {Array.<Schedule>} scheduleArray 
 * @param {Array.<Station>} stationArray 
 * @param {number} t 現在時刻を0:00からの経過秒で表した数値
 * @returns {Array.<Train>} Trainインスタンスの配列
 */
const generateTrains = (scheduleArray, stationArray, t) => {
    const trains = [];
    for (const currSchedule of scheduleArray) {
        // 終点のとき、処理しない
        if (currSchedule.next === null) {
            break;
        }
        const nextSchedule = scheduleArray.filter(schedule => schedule.name === currSchedule.next)[0];
         
        if (isBetween(currSchedule, nextSchedule, t)) {
            const currStation = stationArray.filter(station => station.name === currSchedule.name)[0];
            const nextStation = stationArray.filter(station => station.name === currSchedule.next)[0];

            const train = new Train(currSchedule, nextSchedule, currStation, nextStation, currStation.color, scheduleArray, stationArray);
            trains.push(train);
        }
    }
    return trains;
}

/**
 * 
 * @param {Array.<Schedule>} scheduleArray 
 * @param {Array.<Array.<Station>>} station2DArray 「駅オブジェクトの配列」の配列（路線ごと） 
 * @param {number} now 現在時刻を0:00からの秒で表した整数
 * @returns {Array.<Array.<Train>>} 「電車の配列」の配列 （路線ごと）
 */
const createTrains = (scheduleArray, station2DArray, now) => {
    const lineNameSet = new Set(scheduleArray.map(schedule => schedule.line));

    const trains = [];

    for (const lineName of lineNameSet) {
        const scheduleArrayOfThisLine = scheduleArray.filter(schedule => schedule.line === lineName);
        const stationArrayOfThisLine = station2DArray.flat().filter(station => station.line === lineName.split('（')[0]);

        const trainsOfThisLine = generateTrains(scheduleArrayOfThisLine, stationArrayOfThisLine, now);
        trains.push(trainsOfThisLine);
    }

    return trains;
}

export { generateTrains, createTrains };