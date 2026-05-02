let monsterHP = 100;
const maxHP = 100;
let level = 1;
let exp = 0;
let attackPower = 10;

const monsters = [
    { name: "クモ", exp: 30, sprite: "assets/enemy.png" },
    { name: "おじさん", exp: 50, sprite: "assets/uncle.png" },
    { name: "幽霊", exp: 70, sprite: "assets/ghost.png" },
    { name: "無", exp: 150, sprite: "assets/nothing.png" }
];
let currentMonster = monsters[0];

const hpBarFill = document.getElementById('hp-bar-fill');
const attackButton = document.getElementById('attack-button');
const messageText = document.getElementById('message-text');
const levelText = document.getElementById('level-text');
const expText = document.getElementById('exp-text');
const monsterNameText = document.getElementById('monster-name');
const monsterSprite = document.getElementById('monster-sprite');
const damageEffect = document.getElementById('damage-effect');
const enemySide = document.getElementById('enemy-side');

attackButton.onclick = function() {
    let currentPower = attackPower + (level - 1) * 2;
    let damage = Math.floor(Math.random() * 11) + currentPower;

    monsterHP -= damage;
    if (monsterHP < 0) { monsterHP = 0; }

    // 演出（ダメージ数字と揺れ）
    if (damageEffect) {
        damageEffect.innerText = "-" + damage;
        damageEffect.classList.remove('damage-animation');
        void damageEffect.offsetWidth; 
        damageEffect.classList.add('damage-animation');
    }
    if (enemySide) {
        enemySide.classList.remove('shake-animation');
        void enemySide.offsetWidth;
        enemySide.classList.add('shake-animation');
    }

    // 画面更新
    if (hpBarFill) hpBarFill.style.width = (monsterHP / maxHP) * 100 + "%";
    messageText.innerText = damage + " のダメージを与えた！";

    // モンスターを倒したか判定
    if (monsterHP === 0) {
        exp += currentMonster.exp;
        messageText.innerText = currentMonster.name + "を倒した！" + currentMonster.exp + "の経験値獲得！";
        
        if (exp >= 100) {
            level++;
            exp = 0;
            messageText.innerText = "レベルアップ！ Lv." + level;
        }

        levelText.innerText = level;
        expText.innerText = exp;
        attackButton.disabled = true;

        setTimeout(function() {
            const randomIndex = Math.floor(Math.random() * monsters.length);
            currentMonster = monsters[randomIndex];
            monsterNameText.innerText = currentMonster.name + "があらわれた！";
            if (monsterSprite) monsterSprite.src = currentMonster.sprite;
            monsterHP = 100;
            if (hpBarFill) hpBarFill.style.width = "100%";
            attackButton.disabled = false;
        }, 1500);
    }
}; // ← ここで onclick の動作が全部終わる（これが大事！）
