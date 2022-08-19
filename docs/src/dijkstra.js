
/**
 * 始点となる駅名と路線名を与えると、次の駅名を返す。
 * @param {string} stationName 始点となる駅名
 * @param {string} lineName 始点となる駅の路線名
 * @param {Array.<Edge>} edges 駅のつながりの配列
 * @returns {string} 次の駅名
 */
const getNextStationName = (stationName, lineName, edges) => {
    return edges.filter(e => e.name === stationName && e.line === lineName)[0].next;
}

/**
 * 駅名を与えると、その駅の路線名の配列を返す。
 * @param {string} stationName 駅名 
 * @param {Array.<Edge>} edges 駅のつながりの配列
 * @returns {Array.<string>} 路線名
 */
const getLineNames = (stationName, edges) => {
    return edges.filter(e => e.name == stationName).map(e => e.line);
}

/**
 * 昇順に並んだ数値の配列から nより大きい最小値を求める。
 * @param {Array.<number>} array 
 * @param {number} n 
 * @returns {number} nより大きい最小値
 */
const minValueGreaterThan = (array, n) => {
    return array.filter(e => e > n)[0]; // 2分探索すればもっと早いかも nより大きい値がない場合は？
}

/**
 * 指定した駅名、路線名の時刻表から、tより大きい最小の時刻の値を取得する
 * @param {string} stationName 駅名
 * @param {string} lineName 路線名
 * @param {number} t 時刻
 * @param {Array.<Edge>} edges 時刻表
 * @returns {number} その駅の時刻表のうち、tより大きい最小の値
 */
const calcShortestTime = (stationName, lineName, t, edges) => {
    const target = edges.filter(e => e.name === stationName && e.line === lineName)[0].time;
    return minValueGreaterThan(target, t);
}

/**
 * 最初の駅名と出発時刻、時刻表からNodeのリストの初期状態を作る
 * @param {string} S0 最初の駅の名前
 * @param {number} T0 出発時刻
 * @param {Array.<Edge>} edges 時刻表
 * @returns {Array.<Node>} Nodeのリストの初期状態 
 */
const initNodes = (S0, T0, edges) => {
    const lineNames = getLineNames(S0, edges);

    return edges.map(e => {
        const name = e.name;
        const line = e.line;
        
        const isTarget = (S0 === name && lineNames.includes(line));
        
        const shortestTime = isTarget ? calcShortestTime(S0, line, T0, edges) : Infinity;
        const shortestPath = isTarget ? [`${name}:${shortestTime}`] : [];
        return { name, line, shortestPath, shortestTime };
    });
}

/**
 * Nodeのリストを与えると、「shortestTimeが最小のNode」pと「それ以外のNodeのリスト」Vの組（配列）を返す
 * @param {Array.<Node>} nodes 
 * @returns {Array} [p, V]
 */
const separeteShortestTimeNode = (nodes) => {
    if (!nodes.length) {
        return [];
    }
    const [first, ...rest] = nodes;
    const [p, V] = separeteShortestTimeNode(rest);

    if (!p) {
        return [first, []];
    }

    return first.shortestTime <= p.shortestTime ? [first, [...rest] ] : [p, [first, ...V] ];
}

/**
 * 時刻表において、駅p→駅qと連続していればtrue。同じ駅名（すなわち乗り換え）の場合もtrue
 * @param {Node} p 駅p
 * @param {Node} q 駅q
 * @param {Array.<Edge>} edges 時刻表
 * @returns {boolean}
 */
const isConnected = (p, q, edges) => {
    if (p.name === q.name) {
        return true;
    }
    const nextStationName = getNextStationName(p.name, p.line, edges);
    return nextStationName === q.name && p.line === q.line;
}

/**
 * 直前に確定したNode p、未確定のNode qのリストV、Edgeのリストを与えると、必要な更新処理を行った後の未確定のNodeのリストを返す
 * @param {Node} p 直前に確定したNode
 * @param {Array.<Node>} V 未確定のNode qのリスト
 * @param {Array.<Edge>} edges 
 * @returns {Array.<Node>} 更新処理後の未確定のNodeのリストV'
 * 
 */
const update = (p, V, edges) => {
    return V.map(q => {
        /**
         * 直前に確定したNode pと未確定のNode qを与えると、pとqが直接つながっているかどうかを調べ、
         * つながっているかつpの確定時刻の直後のqの時刻表の時刻が、現在のqのshortestTimeより小さいなら、
         * shortestPathとshortestTimeを更新したqを、そうでないなら、qをそのまま返す
         * @param {Node} p 直前に確定したNode
         * @param {Node} q 未確定のNode
         * @returns {Node} 更新後のq
         */
        if (isConnected(p, q, edges)) {
            // ToDo qが終点の場合、qのtime = []（空の配列）

            const Tp = p.shortestTime;
            // pとqの路線が異なる場合、乗り換え時間として Tx = 4min を加える
            const Tx = p.line === q.line ? 0 : 4;
            const Tq = calcShortestTime(q.name, q.line, Tp + Tx, edges);
            if (Tq < q.shortestTime) {
                q.shortestTime = Tq;
                q.shortestPath = [`${q.name}:${Tq}`, ...p.shortestPath]; // 駅名:時刻
            }
        };
        return q;
    });
}

/**
 * 未確定のNodeのリストVとEdgeのリストを与えると、
 * ダイクストラ法により各NodeのshortestPathとshortestTimeを更新したNodeのリストを返す
 * @param {Array.<Node>} V 未確定のNodeのリスト
 * @param {Array.<Edge>} edges 
 * @returns {Array.<Node>} 確定したNodeのリスト（shortestTime昇順）
 */
const dijkstraMain = (V, edges) => {
    if (!V.length) {
        return [];
    }
    const [p, V0] = separeteShortestTimeNode(V);
    const V1 = update(p, V0, edges);
    return [p, ...dijkstraMain(V1, edges)];
}

/**
 * 始点となる駅名、終点となる駅名、出発時刻を与えると、ダイクストラ法で求めた終点のNodeを返す
 * @param {string} S0 出発駅のname
 * @param {number} T0 出発時刻（秒）
 * @param {string} G 到着駅のname
 * @param {Array.<Edge>} edges 時刻表
 * @returns {Node} 到着駅の情報
 */
 const dijkstra = (S0, T0, G, edges) => {
    const V = initNodes(S0, T0, edges);
    const U = dijkstraMain(V, edges);
    return U.filter(node => node.name === G)[0];
}

/**
 * shortestPathを駅名と時刻のMapに変換する
 * 同じ駅名（乗換駅）がある場合、目的地に近いほうの駅を追加する
 * @param {Array.<string>} shortestPath ['駅名:時刻', '駅名:時刻', ...]
 * @returns {Map.<string, number>}
 */
const toMapFromShortestPath = (shortestPath) => {
    const stationName2Time = new Map();
    for (const item of shortestPath) {
        const [station, time] = item.split(':');
        if(!stationName2Time.has(station)) {
            stationName2Time.set(station, Number(time));
        }
    }
    return stationName2Time;
}

export {
    getNextStationName,
    getLineNames,
    calcShortestTime,
    initNodes,
    separeteShortestTimeNode,
    isConnected,
    update,
    dijkstraMain,
    dijkstra,
    toMapFromShortestPath
};








