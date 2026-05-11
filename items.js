// items.js
const itemData = {
    weapons: {
        "w01": { name: "けしゴム", atk: 4, price: 100 },
        "w02": { name: "えんぴつ", atk: 12, price: 300 },
        "w03": { name: "コンパス", atk: 25, price: 500 },
        "w04": { name: "30cmものさし", atk: 45, price: 700 },
        "w05": { name: "伝説のえんぴつ", atk: 80, price: 1000 },
    },
    armors: {
        "a01": { name: "おりがみ", def: 3, price: 80 },
        "a02": { name: "三角じょうぎ", def: 12, price: 200 },
        "a03": { name: "下じき", def: 25, price: 400 },
        "a04": { name: "ふでばこ", def: 45, price: 700 },
        "a05": { name: "伝説の下じき", def: 100, price: 1000 },
    },
    potions: {
        "p01": { name: "回復薬", heal: 30, price: 500 }
    }
};

const dropTable = {
    1: ["w01", "a01", "p01"], // ステージ1で落ちるアイテムID
    2: ["w02", "a02", "p01"], // ステージ2
    3: ["w03", "a03", "p03"], // ステージ3
    4: ["w04", "a04", "p04"], // ステージ4
    5: ["w05", "a05", "p05"], // ステージ5
};

// ドロップ判定成功時のイメージ
function grantDropItem(type) {
    let itemId;
    const pool = itemData[type]; // itemData.weapons など
    const keys = Object.keys(pool);
    
    // ランダムに1つ選択
    itemId = keys[Math.floor(Math.random() * keys.length)];
    
    // インベントリに追加
    hacksla_data.inventory[type].push(itemId);
    
    // 通知用の名前を返す
    return pool[itemId].name;
}
