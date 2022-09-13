/**
 * 文字列で与えられた時刻を0:00からの経過時間（秒）として整数値で返す
 * @param {string} str '10:35'のような時刻を表す文字列
 * @return {number} 38100のような整数
 */
 const toSecFromTimeString = (str) => {
    const [h, m] = str.split(':');
    return Number(h) * 3600 + Number(m) * 60;
}

/**
 * 現在時刻を当日0:00からの経過時間（秒）として整数値で返す
 * 0:00～4:00までは24時～28時とみなす
 * たとえば、5:32 => 19920, 0:05 => 86700
 * @param {Date} now new Date()を渡す
 * @returns {number}
 */
 const toSecFromNow = (now) => {
    let [h, m, s] = [now.getHours(), now.getMinutes(), now.getSeconds()];
    if (h < 5) {
        h += 24;
    }
    return h * 3600 + m * 60 + s;
}

/**
 * 0:00からの経過時間（秒）を時刻を表す文字列に変換する
 * @param {number} sec 38100のような時刻を0:00からの経過時間（秒）で表した整数
 * @returns {string} '10:35'のような時刻を表す文字列
 */
const toTimeStringFromSec = (sec) => {
    const hh = Math.floor(sec / 3600);
    const mm = Math.floor((sec % 3600)/60);
    return `${hh}:${String(mm).padStart(2, 0)}`;
}

/**
 * 数値の配列の中から、n以下の最大値を求める。n以下の数値がない場合、-Infinityを返す
 * @param {number} n 
 * @param {Array.<number>} array 
 * @returns {number} n以下の最大値
 */
const maxValueLessThanOrEqualTo = (n, array) => {
    return array.filter(e => e <= n ).reduce((a, b) => {return Math.max(a, b)}, -Infinity);
}

/**
 * 数値の配列の中から、n以上の最小値を求める。n以上の数値がない場合、Infinityを返す
 * @param {number} n 
 * @param {Array.<number>} array 
 * @returns {number} n以上の最小値
 */
const minValueGreaterThanOrEqualTo = (n, array) => {
    return array.filter(e => e >= n ).reduce((a, b) => {return Math.min(a, b)}, Infinity);
}

/**
 * 昇順に並んでいる数値の配列1,2から、差分の配列を作る
 * @param {Array.<number>} array1 数値の配列1
 * @param {Array.<number>} array2 数値の配列2
 * @returns {Array.<number>} 
 */
 const makeDiffs = (array1, array2) => {
    if (!array1.length) {
        return [];
    }
    const [first1, ...rest1] = array1;
    const item2 = array2.filter(e => e > first1)[0];
    if (item2) {
        const diff = item2 - first1;
        return [diff, ...makeDiffs(rest1, array2)];
    } else {
        return makeDiffs(rest1, array2);
    }
}

/**
 * 数値の配列から中央値を求める
 * @param {Array.<number>} array 数値の配列
 * @returns {number} 中央値
 */
const getMedian = (array) => {
    if (!array.length) {
        return null;
    }
    const m = Math.floor(array.length / 2);
    const sorted = [...array].sort();
    return array.length % 2 ? sorted[m] : sorted[m - 1];
}

/**
 * 〇線（×行）、〇線（△行）のように、路線名が同じで方向が違う場合True
 * @param {string} lineName1 
 * @param {string} lineName2 
 * @returns 
 */
const isReversedLine = (lineName1, lineName2) => {
    if (lineName1 === lineName2) {
        return false;
    }
    return lineName1.split('（')[0] === lineName2.split('（')[0];
}

/**
 * 時刻表のJSONオブジェクトから平日または土日休のscheduleに変換する
 * @param {Object} timetable 時刻表のJSONオブジェクト
 * @param {string} type 平日 or 土日休
 * @returns {Array.<Schedule>} Schedule = { name, next, line, time, timeToNext }
 */
 const convertTimetable = (timetable, type) => {
    const scheduleArray = timetable.filter(line => line.type === type).flatMap(line => {
        const lineName = line.lineName;
        const stations = line.stations;
        const converted = [];
        for (let i = 0; i < stations.length; i++) {
            let next = null;
            if (i < stations.length - 1) {
                next = stations[i + 1].name;
            } else if (line.loop) {
                next = stations[0].name;
            }
            const station = {
                name: stations[i].name,
                next: next,
                line: lineName,
                time: stations[i].time.map(str => toSecFromTimeString(str))
            }
            converted.push(station);
        }
        return converted;
    });
    /*
    scheduleArray = [
        {
            name: '駅名',
            next: '次の駅名',
            line: '路線名',
            time: [number]
        },
    ]
     */
    // timeToNextプロパティを追加する
    return scheduleArray.map(currSchedule => {
        const nextSchedule = currSchedule.next === null ? null : scheduleArray.filter(schedule => schedule.name === currSchedule.next && schedule.line === currSchedule.line)[0];

        let currTime = currSchedule.time;
        let nextTime = currSchedule.next === null ? [] : nextSchedule.time;

        // 終点のひとつ前の駅は、timeには値があるが、次の駅（終点）のtimeは空なので、timeToNextが計算できないので
        // 逆方向の路線を使ってtimeToNextを求める
        if (currTime.length && !nextTime.length) {
            const reversedSchedule = scheduleArray.filter(schedule => isReversedLine(schedule.line, currSchedule.line));
            const reversedLine = reversedSchedule.length ? reversedSchedule[0].line : '';

            const currSchedule2 = scheduleArray.filter(schedule => schedule.line === reversedLine && schedule.name === currSchedule.next);
            const nextSchedule2 = scheduleArray.filter(schedule => schedule.line === reversedLine && schedule.name === currSchedule.name);
            currTime = currSchedule2.length ? currSchedule2[0].time : currTime;
            nextTime = nextSchedule2.length ? nextSchedule2[0].time : nextTime;
        }

        const diffTime = makeDiffs(currTime, nextTime);
        return {
            ...currSchedule,
            timeToNext: getMedian(diffTime)
        }
    });
}

/**
 * 現在時刻t, 現在の駅の出発時刻t1, 次の駅の出発時刻t2について、概ね下記を満たすときtrue
 * ・t1 <= t <= t2となる時刻t1, t2が現在の駅と次の駅のtimeに含まれている
 * ・t - t1 <= timeToNext
 * @param {Schedule} currSchedule 現在の駅の時刻表
 * @param {Schedule} nextSchedule 次の駅の時刻表
 * @param {number} t 現在時刻を0:00からの経過秒で表した数値
 * @returns 
 */
const isBetween = (currSchedule, nextSchedule, t) => {
    // t以下の最大値t1を求める
    const t1 = maxValueLessThanOrEqualTo(t, currSchedule.time);
    // t1が見つからなかった場合、false
    if (t1 === -Infinity) { return false; }

    // nextSchedule.timeが空のとき、次の駅が終点なので、(t - t1) <= timeToNextならtrue、そうでなければfalse
    if (!nextSchedule.time.length) { return (t - t1 <= currSchedule.timeToNext); }

    // t1より大きい最小値t2を求める
    const t2 = minValueGreaterThanOrEqualTo(t1 + 1, nextSchedule.time);
    // t2が見つからなかった場合、false
    if (t2 === Infinity) { return false; }

    // t1 <= t <= t2かつt1 < t2を満たさない場合、false
    if (t > t2) { return false; }

    // t2 - t1とtimeToNextの差が2分以下の場合、true
    if (Math.abs(t2 - t1 - currSchedule.timeToNext) <= 120) { return true; }

    // t - t1がtimeToNext以内なら、true
    return (t - t1 <= currSchedule.timeToNext);
}

/**
 * scheduleArrayから、引数で指定した駅名を起点に、name → next と辿ってScheduleを抽出する
 * 環状線にも対応する（scheduleArrayの長さを上限に辿る、つまり１週）
 * @param {Array.<Schedule>} scheduleArray 
 * @param {string} startName 駅名
 * @returns {Array.<Schedule>} 
 */
const extractSchedules = (scheduleArray, startName) => {
    const resultScheduleArray = [];
    let targetName = startName;
    while (resultScheduleArray.length < scheduleArray.length) {
        const targetSchedules = scheduleArray.filter(schedule => schedule.name === targetName);
        if (targetSchedules.length) {
            resultScheduleArray.push(targetSchedules[0]);
            targetName = targetSchedules[0].next;
        } else {
            return resultScheduleArray;
        }   
    }
    return resultScheduleArray;
}

/**
 * 現在時刻より後の駅名とその駅の出発時刻のMapを作る
 * ある駅について、ひとつ前の駅の出発時刻より遅い出発時刻が存在しない場合、ひとつ前の出発時刻＋timeToNextをその駅の時刻として、
 * その駅で検索を打ち切る
 * @param {Array.<Schedule>} scheduleArray 
 * @param {number} currentTime 現在時刻を0:00からの経過秒で表した数値
 * @returns {Map.<string, number>} 駅名 => 時刻のMap
 */
const makeStationName2TimeMap = (scheduleArray, currentTime) => {
    const stationName2Time = new Map();

    for (let i = 0; i < scheduleArray.length; i++) {
        const schedule = scheduleArray[i];
        if (i === 0) {
            stationName2Time.set(schedule.name, minValueGreaterThanOrEqualTo(currentTime, schedule.time));
            continue;
        }
        // i > 0のとき
        const prevSchedule = scheduleArray[i - 1];
        const prevTime = stationName2Time.get(prevSchedule.name);
        const time = minValueGreaterThanOrEqualTo(prevTime, schedule.time);
        if (time === Infinity || // 終点 or 終電
            time > prevTime + prevSchedule.timeToNext + 120) { // 環状線の途切れ
            stationName2Time.set(schedule.name, prevTime + prevSchedule.timeToNext);
            break;
        } else {
            stationName2Time.set(schedule.name, time);
        }
    }

    return stationName2Time;
}

export { 
    toSecFromTimeString, toSecFromNow, toTimeStringFromSec, 
    makeDiffs, getMedian, isReversedLine, convertTimetable, 
    maxValueLessThanOrEqualTo, minValueGreaterThanOrEqualTo, isBetween, extractSchedules, makeStationName2TimeMap 
};