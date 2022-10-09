/**
 * @param {State} state 状態
 * @param {string} dayType 平日 or 土日休 
 * @returns {State} 更新後の状態
 */
 const setDayType = (state, dayType) => {
    return {...state, dayType };
}

/**
 * @param {State} state 状態
 * @param {Array.<Schedule>} scheduleArray 
 * @returns {State} 更新後の状態
 */
 const setScheduleArray = (state, scheduleArray) => {
    return {...state, scheduleArray};
}

/**
 * @param {State} state 状態
 * @param {TrainGenerator} trainGenerator 
 * @returns {State} 更新後の状態
 */
const setTrainGenerator = (state, trainGenerator) => {
    return {...state, trainGenerator};
}

/**
 * ダイクストラ法による最短経路問題で、出発駅を選択した状態を返す
 * @param {State} state 状態
 * @param {string} stationName 駅名
 * @returns {State} 更新後の状態
 */
 const setDijkstraStart = (state, stationName) => {
    return {
        ...state,
        dijkstraStart: stationName
    };
}

/**
 * ダイクストラ法による最短経路問題の結果をもった状態を返す
 * @param {State} state 状態
 * @param {Array.<Node>} result 出発駅から各駅への最短経路の情報
 * @returns {State} 更新後の状態
 */
const setDijkstraResult = (state, result) => {
    return {
        ...state,
        dijkstraResult: result
    };
}

/**
 * ダイクストラ法による最短経路問題で、到着駅と到着時刻をもった状態を返す
 * @param {State} state 状態
 * @param {Array.<string, numver>} end 到着駅名と到着時刻
 * @returns {State} 更新後の状態
 */
 const setDijkstraEnd = (state, end) => {
    return {
        ...state,
        dijkstraEnd: end
    };
}

export {
    setDayType, setDijkstraResult, setDijkstraStart, setDijkstraEnd, setScheduleArray, setTrainGenerator
};