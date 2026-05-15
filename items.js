// items.js
const itemData = {
    weapons: {
        "w01": { name: "けしゴム", atk: 4, price: 100 },
        "w02": { name: "えんぴつ", atk: 12, price: 300 },
        "w03": { name: "コンパス", atk: 25, price: 500 },
        "w04": { name: "30cmものさし", atk: 45, price: 700 },
        "w05": { name: "伝説のえんぴつ", atk: 80, price: 1000 },
                // 🔥【新規追加】裏ステージ用超強力武器
        "w06": { name: "奇跡のえんぴつ", atk: 150, price: 2500 }, // ステージ6用
        "w07": { name: "終焉のえんぴつ", atk: 240, price: 5000 }, // ステージ7用
  
    },
    armors: {
        "a01": { name: "おりがみ", def: 3, price: 80 },
        "a02": { name: "三角じょうぎ", def: 12, price: 200 },
        "a03": { name: "下じき", def: 25, price: 400 },
        "a04": { name: "ふでばこ", def: 45, price: 700 },
        "a05": { name: "伝説の下じき", def: 100, price: 1000 },
        "a06": { name: "奇跡の体操服", def: 120, price: 2500 }, // ステージ6用
        "a07": { name: "終焉のランドセル", def: 180, price: 5000 }, // ステージ7用
    },
    potions: {
        "p01": { name: "回復薬", heal: 30, price: 500 }
    }
};

const dropTable = {
    1: ["w01", "a01", "p01"], // ステージ1で落ちるアイテムID
    2: ["w02", "a02", "p01"], // ステージ2
    3: ["w03", "a03", "p01"], // ステージ3
    4: ["w04", "a04", "p01"], // ステージ4
    5: ["w05", "a05", "p01"], // ステージ5
        // 🔥【新規追加】裏ステージ用ドロッププール（ステージ8は不要なため未登録）
    6: ["w06", "a06", "p01"], // ステージ6
    7: ["w07", "a07", "p01"], // ステージ7
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
