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
 * 時刻表のJSONオブジェクトから平日または土日休のscheduleに変換する
 * @param {Object} timetable 時刻表のJSONオブジェクト
 * @param {string} type 平日 or 土日休
 * @returns {Array.<Schedule>}
 */
const convertTimetable = (timetable, type) => {
    return timetable.filter(line => line.type === type).flatMap(line => {
        const lineName = line.lineName;
        const stations = line.stations;
        const converted = [];
        for (let i = 0; i < stations.length; i++) {
            const station = {
                name: stations[i].name,
                next: i < stations.length - 1 ? stations[i + 1].name : null,
                line: lineName,
                time: stations[i].time.map(str => toSecFromTimeString(str))
            }
            converted.push(station);
        }
        return converted;
    });
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
 * 現在時刻tについて、t1 <= t < t2となる時刻t1, t2が現在の駅と次の駅のtimeに含まれており、
 * t2 - t1 <= （t1の次の時刻との差）を満たせば、true 
 * @param {Schedule} currSchedule 現在の駅の時刻表
 * @param {Schedule} nextSchedule 次の駅の時刻表
 * @param {number} t 現在時刻を0:00からの経過秒で表した数値
 * @returns 
 */
const isBetween = (currSchedule, nextSchedule, t) => {
    // t以下の最大値を求める
    const t1 = maxValueLessThanOrEqualTo(t, currSchedule.time);
    // tより大きい最小値を求める
    const t2 = minValueGreaterThanOrEqualTo(t, nextSchedule.time);
    
    // 条件を満たすt1, t2が見つからなかった場合、false
    if (t1 === -Infinity || t2  === Infinity) {
        return false;
    }
    
    // t1の次の時刻を求める。t1が終電のときはInfinityとする
    const t1NextCandidates = currSchedule.time.filter(time => time > t1);
    const t1Next = t1NextCandidates.length ? t1NextCandidates[0] : Infinity;

    return (t2 - t1) <= (t1Next - t1);
}

/**
 * 配列の要素にcondition関数を適用した結果がtrueとなるとき、それより後ろの配列を返す
 * @param {Function} condition 
 * @param {Array} array 
 * @returns {Array}
 */
const splitArrayAfter = (condition, array) => {
    if (!array.length) {
        return [];
    }
    const [first, ...rest] = array;
    return condition(first) ? [...rest] : splitArrayAfter(condition, rest);
}

export { toSecFromTimeString, toSecFromNow, convertTimetable, maxValueLessThanOrEqualTo, minValueGreaterThanOrEqualTo, isBetween, splitArrayAfter };