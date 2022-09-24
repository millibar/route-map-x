/**
 * 今日の日付と祝日の配列を渡すと、'平日' or '土日休'という文字列を返す
 * @param {Date} today 今日の日付 new Date()
 * @param {Array.<string>} holidays ['2022/10/10', '2022/11/3', '2022/11/23']形式
 * @returns {string} 平日 or 土日休
 */
const convertDayType = (today, holidays) => {
    return '平日';
}

/**
 * 平日・土日休選択ボタンにチェックを入れる
 * @param {string} dayType 平日 or 土日休 
 * @param {HTMLElement} daySelectors input要素のリスト
 */
const setDaySelector = (dayType, daySelectors) => {
    const values = {
        '平日'  : 'weekday',
        '土日休': 'holiday'
    }
    const value = values[dayType];
    daySelectors.forEach(input => {
        if (input.value === value) {
            input.checked = true;
        } else {
            input.checked = false;
        }
    });
}


export { convertDayType, setDaySelector };