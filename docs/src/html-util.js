/**
 * HTMLの特殊文字を実体参照に置換する
 * @param {string} str 
 * @returns {string} 置換後の文字列
 */
export const escapeSpecialCahrs = (str) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * HTML文字列からHTML要素を作成して返す
 * @param {string} html 
 * @returns 
 */
const htmlToElement = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstElementChild;
}

/**
 * HTML文字列からDOM Nodeを作成して返すタグ関数
 * @returns {Element}
 */
export const element = (strings, ...values) => {
    const htmlString = strings.reduce((result, str, i) => {
        const value = values[i - 1];
        if (typeof value === 'string') {
            return result + escapeSpecialCahrs(value) + str;
        } else {
            return result + String(value) + str;
        }
    });
    return htmlToElement(htmlString);
}