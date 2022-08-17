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
 * @returns {Schedule}
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

export { toSecFromTimeString, toSecFromNow, convertTimetable };