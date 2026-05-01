// --- 1. ゲームの初期設定 ---
let monsterHP = 100;
const maxHP = 100;
let level = 1;
let exp = 0;
let attackPower = 10;

const monsters = [
    { name: "スライム", exp: 30, sprite: "👾" },
    { name: "ゴブリン", exp: 50, sprite: "👹" },
    { name: "スケルトン", exp: 70, sprite: "💀" },
    { name: "ドラゴン", exp: 150, sprite: "🐲" }
];
let currentMonster = monsters[0];

// --- 2. 部品の取得 ---
const hpText = document.getElementById('hp-text');
const hpBarFill = document.getElementById('hp-bar-fill');
const attackButton = document.getElementById('attack-button');
const messageText = document.getElementById('message-text');
const levelText = document.getElementById('level-text');
const expText = document.getElementById('exp-text');
const monsterNameText = document.getElementById('monster-name');
const monsterSprite = document.getElementById('monster-sprite'); // 追加
const damageEffect = document.getElementById('damage-effect');

// --- 3. ボタンを押した時の動き ---
attackButton.onclick = function() {
    // ダメージ計算
    let currentPower = attackPower + (level - 1) * 2;
    let damage = Math.floor(Math.random() * 11) + currentPower;

    monsterHP = monsterHP - damage;
    if (monsterHP < 0) { monsterHP = 0; }

    // ダメージエフェクト（数字が飛び出す）
    damageEffect.innerText = "-" + damage;
    damageEffect.classList.remove('damage-animation');
    void damageEffect.offsetWidth; 
    damageEffect.classList.add('damage-animation');

    // 画面更新
    hpText.innerText = monsterHP;
    hpBarFill.style.width = (monsterHP / maxHP) * 100 + "%";
    messageText.innerText = damage + " のダメージを与えた！";

    // モンスターを倒したか判定
    if (monsterHP === 0) {
        exp = exp + currentMonster.exp;
        messageText.innerText = currentMonster.name + "を倒した！" + currentMonster.exp + "の経験値を獲得！";
        
        if (exp >= 100) {
            level = level + 1;
            exp = 0;
            messageText.innerText = "レベルアップ！ Lv." + level + " になった！";
        }

        levelText.innerText = level;
        expText.innerText = exp;
        attackButton.disabled = true;

        setTimeout(function() {
            // 次のモンスターをランダムに選ぶ
            const randomIndex = Math.floor(Math.random() * monsters.length);
            currentMonster = monsters[randomIndex];
            
            monsterNameText.innerText = currentMonster.name + "があらわれた！";
            // モンスターの見た目も変える
            if(monsterSprite) monsterSprite.innerText = currentMonster.sprite; 
            
            monsterHP = 100;
            hpText.innerText = monsterHP;
            hpBarFill.style.width = "100%";
            attackButton.disabled = false;
        }, 1500);
    }
}; // ← ここでしっかりボタンの動作を閉じる
