const homeReturnButton = document.getElementById('home-return-button');
let monsterHP = 100;
const maxHP = 100;
let level = 1;
let exp = 0;
let attackPower = 10;
let playerHP = 100;
const maxPlayerHP = 100;
let enemyAttackTimer = null; // タイマー保存用

// 1. 【読み込み】保存データがあれば復元
const savedData = localStorage.getItem('hacksla_data');
if (savedData) {
    const data = JSON.parse(savedData);
    level = data.level;
    exp = data.exp;
    attackPower = data.attackPower;
    document.getElementById('level-text').innerText = level;
    document.getElementById('exp-text').innerText = exp;
}

const monsters = [
    { name: "クモ", exp: 30, sprite: "assets/enemy.png", speed: 1500 },     // 1.5秒（速い）
    { name: "おじさん", exp: 50, sprite: "assets/uncle.png", speed: 4000 }, // 4秒（遅い）
    { name: "幽霊", exp: 70, sprite: "assets/ghost.png", speed: 3000 },     // 3秒
    { name: "無", exp: 150, sprite: "assets/nothing.png", speed: 2000 }      // 2秒
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
const playerSprite = document.getElementById('player-sprite');

// 2. 【共通関数】保存
function saveGameData() {
    const gameData = {
        level: level,
        exp: exp,
        attackPower: attackPower
    };
    localStorage.setItem('hacksla_data', JSON.stringify(gameData));
}

// 敵の攻撃処理
function enemyAttack() {
    if (monsterHP <= 0 || playerHP <= 0) return; 

    // 演出：敵が揺れる
    monsterSprite.classList.remove('shake-animation');
    void monsterSprite.offsetWidth;
    monsterSprite.classList.add('shake-animation');

    // プレイヤーへのダメージ計算
    let damage = Math.floor(Math.random() * 11) + 5;
    playerHP -= damage;
    if (playerHP < 0) playerHP = 0;

    // プレイヤーHPバー更新
    document.getElementById('player-hp-bar-fill').style.width = (playerHP / maxPlayerHP) * 100 + "%";
    
    // プレイヤーダメージ数字演出
    const pDamageEffect = document.getElementById('player-damage-effect');
    if (pDamageEffect) {
        pDamageEffect.innerText = "-" + damage;
        pDamageEffect.classList.remove('damage-animation');
        void pDamageEffect.offsetWidth;
        pDamageEffect.classList.add('damage-animation');
    }

    messageText.innerText = currentMonster.name + " の攻撃！ " + damage + " 受けた！";

    if (playerHP <= 0) {
        playerHP = 0;
        messageText.innerText = "敗北してしまった…";
        attackButton.disabled = true;
        clearInterval(enemyAttackTimer); // 敵の攻撃を止める

        // GAME OVERのポップアップを表示
        const goModal = document.getElementById('gameover-modal');
        if (goModal) {
            goModal.style.display = "flex";
        }
    }
}

// 3. 【共通関数】モンスター出現
function spawnMonster() {
    const randomIndex = Math.floor(Math.random() * monsters.length);
    currentMonster = monsters[randomIndex];
    
    monsterNameText.innerText = currentMonster.name + "があらわれた！";
    if (monsterSprite) {
        monsterSprite.src = currentMonster.sprite;
        monsterSprite.classList.remove('enemy-appear');
        void monsterSprite.offsetWidth;
        monsterSprite.classList.add('enemy-appear');
    }
    
    monsterHP = 100;
    if (hpBarFill) hpBarFill.style.width = "100%";
    attackButton.disabled = false;
    if (homeReturnButton) homeReturnButton.style.display = "none";

    // 敵の攻撃タイマー開始（3秒おき）
    clearInterval(enemyAttackTimer);
    
    enemyAttackTimer = setInterval(enemyAttack, 3000);

    attackButton.disabled = false;
    if (homeReturnButton) homeReturnButton.style.display = "none";

    const pBar = document.getElementById('player-hp-bar-fill');

    // 敵の攻撃タイマー開始
    clearInterval(enemyAttackTimer);
    // 次にやる「モンスターごとの速度」を反映しやすいようにしておきます
    const speed = currentMonster.speed || 3000; 
    enemyAttackTimer = setInterval(enemyAttack, speed);

}

// 最初の起動
spawnMonster();

// 4. 【メイン処理】攻撃ボタンクリック
attackButton.onclick = function() {
    let currentPower = attackPower + (level - 1) * 2;
    let damage = Math.floor(Math.random() * 11) + currentPower;

    monsterHP -= damage;
    if (monsterHP < 0) { monsterHP = 0; }

    // 演出：ダメージ数字
    if (damageEffect) {
        damageEffect.innerText = "-" + damage;
        damageEffect.classList.remove('damage-animation');
        void damageEffect.offsetWidth; 
        damageEffect.classList.add('damage-animation');
    }

    // 演出：プレイヤー揺れ（自分が叩いた時）
    if (playerSprite) {
        playerSprite.classList.remove('player-shake-effect');
        void playerSprite.offsetWidth; 
        playerSprite.classList.add('player-shake-effect');
    }

    // 演出：打撃エフェクト
    const hit = document.createElement('div');
    hit.className = 'hit-effect';
    const enemyRect = monsterSprite.getBoundingClientRect();
    const fieldRect = document.getElementById('battle-field').getBoundingClientRect();
    hit.style.left = (enemyRect.left - fieldRect.left + enemyRect.width / 2 - 50) + 'px';
    hit.style.top = (enemyRect.top - fieldRect.top + enemyRect.height / 2 - 50) + 'px';
    document.getElementById('battle-field').appendChild(hit);
    setTimeout(() => { hit.remove(); }, 300);

    // HP更新
    if (hpBarFill) hpBarFill.style.width = (monsterHP / maxHP) * 100 + "%";
    messageText.innerText = damage + " のダメージを与えた！";

    // 5. 【判定】敵を倒したとき
    if (monsterHP === 0) {
        clearInterval(enemyAttackTimer); // 攻撃を止める
        if (homeReturnButton) homeReturnButton.style.display = "block";

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

        saveGameData();
        setTimeout(spawnMonster, 3000);
    }
};
