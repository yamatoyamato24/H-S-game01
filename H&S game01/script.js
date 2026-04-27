// ゲームの状態管理
let playerAtk = 10;
let enemyHp = 50;
let baseEnemyHp = 50;

const logElement = document.getElementById('log');
const enemyHpElement = document.getElementById('enemy-hp');
const playerAtkElement = document.getElementById('player-atk');
const itemList = document.getElementById('item-list');

// 攻撃ボタンの処理
document.getElementById('attack-btn').onclick = () => {
    enemyHp -= playerAtk;
    
    if (enemyHp <= 0) {
        logElement.innerText = "敵を倒した！アイテムをドロップ！";
        dropItem();
        // 敵をリセット（少しずつ強くする）
        baseEnemyHp += 10;
        enemyHp = baseEnemyHp;
    } else {
        logElement.innerText = `敵に ${playerAtk} のダメージ！`;
    }
    updateDisplay();
};

// アイテムドロップ（ハクスラ要素）
function dropItem() {
    const rarity = Math.floor(Math.random() * 10) + 1; // 1~10のランダム性能
    const newItem = document.createElement('li');
    newItem.innerText = `伝説の剣 (攻撃力 +${rarity})`;
    
    // 装備機能
    newItem.onclick = () => {
        playerAtk = 10 + rarity; // 基礎攻撃力に加算
        logElement.innerText = `武器を装備した！攻撃力が ${playerAtk} になった。`;
        updateDisplay();
    };
    
    itemList.appendChild(newItem);
}

function updateDisplay() {
    enemyHpElement.innerText = enemyHp;
    playerAtkElement.innerText = playerAtk;
}
