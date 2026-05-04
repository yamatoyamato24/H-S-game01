const homeReturnButton = document.getElementById('home-return-button');
let monsterHP = 100;
let currentMaxHP = 100;
let level = 1;
let exp = 0;
let attackPower = 10;
let playerHP = 100;
const maxPlayerHP = 100;
let enemyAttackTimer = null; // タイマー保存用
let defeatCount = 0; // 敵を倒した合計数
const BOSS_INTERVAL = 10; // 何体ごとにボスを出すか

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
    { name: "クモ", exp: 30, hp: 30, damage: 5,
    sprite: "assets/enemy.png", speed: 800 },     // （速い）
    { name: "おじさん", exp: 50, hp: 100, damage: 25,
    sprite: "assets/uncle.png", speed: 1500 }, // （遅い）
    { name: "幽霊", exp: 70,  hp: 40, damage: 10,
    sprite: "assets/ghost.png", speed: 2000 },     // 2秒
    { name: "無", exp: 150, hp: 80, damage: 15,
    sprite: "assets/nothing.png", speed: 1200 }      // 1.2秒
];

// ボス専用

const bossMonster = { 
    name: "MA（BOSS）", 
    exp: 500, 
    hp: 500, 
    maxHp: 500, // ボスはHPバーが長いので専用のmaxHPを持つと良い
    damage: 40, 
    sprite: "assets/marina_saku11.png", 
    speed: 2500 
};


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

    // ★ここを書き換え：固定ダメージではなく、モンスターごとのダメージを反映
    // currentMonster.damage をベースに、少しだけバラつき（±2程度）を持たせる例
    let baseDamage = currentMonster.damage; 
    let damage = Math.floor(Math.random() * 5) + (baseDamage - 2); 
    if (damage < 1) damage = 1; // 最低1ダメージは保証

    // プレイヤーへのダメージ計算
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

// カウント用の変数を関数の「外」に作っておく（ファイルの上のほう、levelなどの近くに追加してください）
// let defeatCount = 0; 
// const BOSS_INTERVAL = 10;
function spawnMonster() {
    defeatCount++;

    if (defeatCount % BOSS_INTERVAL === 0) {
        currentMonster = { 
            name: "MA（BOSS）", 
            exp: 500, 
            hp: 500, 
            damage: 40, 
            sprite: "assets/marina_saku11.png", 
            speed: 2500 
        };
        monsterNameText.innerText = "危険" + currentMonster.name + " が立ちはだかる！";
    } else {
        const randomIndex = Math.floor(Math.random() * monsters.length);
        currentMonster = monsters[randomIndex];
        monsterNameText.innerText = currentMonster.name + "があらわれた！";
    }

    if (monsterSprite) {
        monsterSprite.src = currentMonster.sprite;
        monsterSprite.classList.remove('enemy-appear'); 
        void monsterSprite.offsetWidth;                
        monsterSprite.classList.add('enemy-appear');    
    }
    
    monsterHP = currentMonster.hp;
    currentMaxHP = currentMonster.hp;
    
    // ✅ 出現時はシンプルに100%にするだけでOK
    if (hpBarFill) {
        hpBarFill.style.width = "100%";
    }

    attackButton.disabled = false;
    if (homeReturnButton) homeReturnButton.style.display = "none";

    clearInterval(enemyAttackTimer);
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
     if (hpBarFill) {
        hpBarFill.style.width = (monsterHP / currentMaxHP) * 100 + "%";
    }
    messageText.innerText = damage + " のダメージを与えた！";

    // 5. 【判定】敵を倒したとき
    if (monsterHP === 0) {
        clearInterval(enemyAttackTimer); // 敵の攻撃を止める
        attackButton.disabled = true; // ボタン連打防止

        // 経験値などの共通処理
        exp += currentMonster.exp;
        
        // レベルアップ判定
        let lvUpMessage = "";
        if (exp >= 100) {
            level++;
            exp = 0;
            lvUpMessage = "<br>レベルアップ！ Lv." + level;
        }

        levelText.innerText = level;
        expText.innerText = exp;
        saveGameData();

        // --- ここからボスかどうかの分岐 ---
        if (defeatCount % BOSS_INTERVAL === 0) {
            // ★ボスを倒した時
            messageText.innerHTML = currentMonster.name + "を撃破した！" + lvUpMessage + "<br>自動で拠点に帰還します";
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 3000);

        } else {
            // ★通常のザコ敵を倒した時
            const remaining = BOSS_INTERVAL - (defeatCount % BOSS_INTERVAL);
            messageText.innerHTML = currentMonster.name + "を倒した！" + currentMonster.exp + "の経験値獲得！" + lvUpMessage + "<br>ボスまであと " + remaining + " 体！";
            
            if (homeReturnButton) homeReturnButton.style.display = "block";
            
            // 3秒後に次のモンスターへ
            setTimeout(spawnMonster, 3000);
        }
    }
}