import { element } from "./html-util.js";
import { getRotateAngle } from "./map.js";
import { isBetween, maxValueLessThanOrEqualTo, minValueGreaterThanOrEqualTo, splitArrayAfter, toSecFromNow } from "./timetable.js";

/**
 * 出発駅と到着駅の座標と時刻表を持ってインスタンス化する
 */
class Train {
    constructor(currSchedule, nextSchedule, currStation, nextStation, color, scheduleArray, stationArray) {
        this.x = 0;
        this.y = 0;
        this.deg = 0;
        this.element = element`<span class="train" style="background-color: ${color}"></span>`;
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
        this.start = () => {
            document.querySelector('.routemap').appendChild(this.element);
            console.log(`${this.currStation.name} →  ${this.nextStation.name}`);
            this.update();
        }

        /**
         * 終点に到着したとき呼ばれる。updateを停止し、電車を削除する
         */
        this.stop = () => {
            console.log(`${this.nextStation.line}の終点、${this.nextStation.name}に到着`);
            window.cancelAnimationFrame(this.reqId);
            document.querySelector('.routemap').removeChild(this.element);
        }

        /**
         * 次の駅に到着したとき呼ばれる。出発駅と到着駅を更新する
         */
        this.next = () => {
            this.currSchedule = this.nextSchedule;
            this.nextSchedule = this.scheduleArray.shift();
            this.currStation = this.nextStation;
            this.nextStation = this.stationArray.shift();

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

            // scheduleArrayのnextScheduleより後の部分を作る
            const f = (schedule) => schedule.name === nextSchedule.name;
            const scheduleRest = splitArrayAfter(f, scheduleArray);

            // stationArrayのnextStationより後の部分を作る
            const g = (station) => station.name === nextStation.name;
            const stationRest = splitArrayAfter(g, stationArray);

            const train = new Train(currSchedule, nextSchedule, currStation, nextStation, currStation.color, scheduleRest, stationRest);
            trains.push(train);
        }
    }
    return trains;
}

export { generateTrains };