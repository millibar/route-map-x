import { getRotateAngle } from "./map.js";
import { extractSchedules, isBetween, maxValueLessThanOrEqualTo, minValueGreaterThanOrEqualTo, toSecFromNow } from "./timetable.js";
import { element } from "./html-util.js";
import { addTimeNodes, removeElementsByClassName } from "./html-map.js";

export class TrainGenerator {
    constructor(scheduleArray, stationArray, parentElement) {
        this.scheduleArray = scheduleArray;
        this.stationArray = stationArray;
        this.parentElement = parentElement;

        /**
         * フレームごとに呼ばれ、地図上に電車を設置する
         */
        this.generate = () => {
            const now = toSecFromNow(new Date());
            for (let i = 0; i < this.scheduleArray.length; i++) {
                const currSchedule = this.scheduleArray[i];
                const nextSchedule = this.scheduleArray.filter(schedule => (schedule.name === currSchedule.next) && (schedule.line === currSchedule.line))[0];

                // 終点の場合は処理しない
                if (!nextSchedule) { continue; }

                const id = `${currSchedule.line}-${currSchedule.name}→${currSchedule.next}`;
                const trainElement =  this.parentElement.querySelector(`#${id}`);

                // 電車が地図上に存在せず、現在時刻でこの2駅の間に電車がすべき場合は電車を追加する
                if (!trainElement && isBetween(currSchedule, nextSchedule, now)) {
                    const train = new Train(this, currSchedule, nextSchedule, id);
                    train.update();
                }
            }
            window.requestAnimationFrame(this.generate);
        }
    }
}

class Train {
    constructor(generator, currSchedule, nextSchedule, id) {
        this.generator = generator;
        this.currSchedule = currSchedule;
        this.nextSchedule = nextSchedule;
        this.element = element`<span class="train" id="${id}"></span>`;
        this.stationArray = this.generator.stationArray;

        this.generator.parentElement.appendChild(this.element);
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.displaySchedule(this.generator.parentElement);
        });

        this.reqId = null;

        /**
         * フレームごとに電車の位置を更新する
         */
        this.update = () => {
            const now = toSecFromNow(new Date());

            // 現在時刻でこの2駅の間に電車がある場合は電車の位置を更新する
            if (isBetween(currSchedule, nextSchedule, now)) {
                const [x, y, deg, arrived] = this.getPosition(currSchedule, nextSchedule, now);
                this.updatePosition(x, y, deg, arrived);
                this.reqId = window.requestAnimationFrame(this.update);
            } else { // 電車がこの２駅の間にない場合は電車を削除する
                this.element.remove();
                window.cancelAnimationFrame(this.reqId);
            }
        }

        /**
         * 時刻tにおける電車の座標と角度を返す
         */
        this.getPosition = (currSchedule, nextSchedule, t) => {
            // 出発駅から到着駅までの時間は
            const dt = 20; // 停車時間
            const t1 = maxValueLessThanOrEqualTo(t, currSchedule.time);
            const t2 = minValueGreaterThanOrEqualTo(t, nextSchedule.time);
            const dT = (t2 - dt) - t1;

            // 出発駅から到着駅までの距離は
            const currStation = this.stationArray.filter(station => station.name === currSchedule.name)[0];
            const nextStation = this.stationArray.filter(station => station.name === nextSchedule.name)[0];
            const dX = nextStation.x - currStation.x;
            const dY = nextStation.y - currStation.y;

            // 出発駅から到着駅までの平均速度は
            const Vx = dX/dT;
            const Vy = dY/dT;

            // 時刻tにおける電車の位置と角度は
            const arrived = (t2 - dt) < t;
            const x = arrived ? nextStation.x : currStation.x + Vx * (t - t1);
            const y = arrived ? nextStation.y : currStation.y + Vy * (t - t1);

            let deg;
            // 到着したら、向きだけ変えておく
            if (nextSchedule.next && arrived) {
                const nextNextStation = this.stationArray.filter(station => station.name === nextSchedule.next)[0];
                const dX2 = nextNextStation.x - nextStation.x;
                const dY2 = nextNextStation.y - nextStation.y;
                deg = getRotateAngle(dX2, dY2);
            } else {
                deg = getRotateAngle(dX, dY);
            }

            return [x, y, deg, arrived];
        }

        /**
         * 電車の座標と角度を更新する
         * @param {number} x 
         * @param {number} y 
         * @param {number} deg 
         * @param {boolean} arrived 駅に到着したかどうか
         */
        this.updatePosition = (x, y, deg, arrived) => {
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            this.element.style.transform = `rotate(${deg}deg) translate(-12px, -12px)`; // width, height 24pxなので、半分ずらす
            if (arrived) {
                this.element.classList.add('wait');
            }
        }

        /**
         * 電車の進行方向の駅に時刻を表示する
         */
        this.displaySchedule = (parentElement) => {
            removeElementsByClassName('time');
            // 次の駅以降のスケジュールを取得する
            const scheduleArray = this.generator.scheduleArray.filter(schedule => schedule.line === this.currSchedule.line);
            const schedules = extractSchedules(scheduleArray, this.nextSchedule.name);

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