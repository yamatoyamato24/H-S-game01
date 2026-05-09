// --- 1. 基本変数の管理 ---
let level = 1;
let exp = 0;
let attackPower = 10;
let playerHP = 100;
const maxPlayerHP = 100;
let monsterHP = 100;
let currentMaxHP = 100;
let enemyAttackTimer = null;
let defeatCount = 0;
const BOSS_INTERVAL = 10;
let currentStageId = 1;

// --- 2. データの読み込み ---
const savedData = localStorage.getItem('hacksla_data');
let unlockedStage = 1; // ★これを追加（読み込んだ解放状況を一時保存する変数）

if (savedData) {
    const data = JSON.parse(savedData);
    level = data.level || 1;
    exp = data.exp || 0;
    attackPower = data.attackPower || 10;
    // Number() で囲って確実に「数値」にする
    currentStageId = Number(data.currentStageId) || 1;
    unlockedStage = data.unlockedStage || 1; // ★これを追加（保存されていた解放状況を読み込む）

}

// --- 3. ステージ別データ（ここに案を書き込めます） ---
const stageMonsterData = {
    1: { 
        name: "はじまりの草原",
        color: "#166534", // ← 追加：深い緑
        enemies: [
            { name: "クモ", exp: 30, hp: 30, damage: 5, sprite: "assets/enemy.png", speed: 800 },
            { name: "おじさん", exp: 50, hp: 100, damage: 25, sprite: "assets/uncle.png", speed: 1500 },
            { name: "幽霊", exp: 70, hp: 40, damage: 10, sprite: "assets/ghost.png", speed: 2000 },
            { name: "無", exp: 150, hp: 80, damage: 15, sprite: "assets/nothing.png", speed: 1200 }
        ],
        boss: { name: "MA（BOSS）", exp: 500, hp: 500, damage: 40, sprite: "assets/marina_saku11.png", speed: 2500 }
    },
    2: { 
        name: "青い湖",
        color: "#1e3a8a", // ← 追加：青
        enemies: [
            { name: "なにこれ？", exp: 60, hp: 50, damage: 15, sprite: "assets/marisaku03.png", speed: 700 },
            { name: "手のようかい", exp: 90, hp: 150, damage: 35, sprite: "assets/marisaku04.png", speed: 500 },
            { name: "おばけかな？", exp: 100, hp: 200, damage: 25, sprite: "assets/marisaku05.png", speed: 1000 }
        ],
        boss: { name: "戦艦くん", exp: 1000, hp: 1200, damage: 60, sprite: "assets/sorasaku01.png", speed: 2000 }
    },
    3: { 
        name: "いなずまのとりで",
        color: "#854d0e", // ← 山吹色
        enemies: [
            { name: "ネコもどき", exp: 120, hp: 120, damage: 30, sprite: "assets/sorasaku02.png", speed: 1000 },
            { name: "そっぽむき お化け", exp: 180, hp: 300, damage: 50, sprite: "assets/sorasaku04.png", speed: 1600 }
        ],
        boss: { name: "これでも船", exp: 2500, hp: 3000, damage: 100, sprite: "assets/ship.png", speed: 2200 }
    },
    4: { 
        name: "燃え盛る火山",
        color: "#7f1d1d", // 赤
        enemies: [
            { name: "ニセ姫01", exp: 300, hp: 800, damage: 70, sprite: "assets/marisaku02.png", speed: 2500 },
            { name: "ニセ姫02", exp: 250, hp: 400, damage: 60, sprite: "assets/marisaku02.png", speed: 900 }
        ],
        boss: { name: "ニセ姫BOSS", exp: 6000, hp: 7000, damage: 180, sprite: "assets/marisaku02.png", speed: 3000 }
    },
    5: { 
        name: "最果ての地",
        color: "#000000", // 黒
        boss: { name: "ラスボス", exp: 20000, hp: 50000, damage: 500, sprite: "assets/boss_image.png", speed: 3500 }
    }
};



// --- 4. 要素の取得 ---
const monsterSprite = document.getElementById('monster-sprite');
const monsterNameText = document.getElementById('monster-name');
const hpBarFill = document.getElementById('hp-bar-fill');
const attackButton = document.getElementById('attack-button');
const messageText = document.getElementById('message-text');
const levelText = document.getElementById('level-text');
const expText = document.getElementById('exp-text');
const playerSprite = document.getElementById('player-sprite');
const homeReturnButton = document.getElementById('home-return-button');

// 初回表示
levelText.innerText = level;
expText.innerText = exp;

// --- 5. バトルロジック ---

function saveGameData() {
    // 保存する時に、読み込んでおいた unlockedStage もセットで保存し直す
    localStorage.setItem('hacksla_data', JSON.stringify({ 
        level, exp, attackPower, currentStageId,
        unlockedStage: unlockedStage // ★ここが重要！これを忘れるとリセットされます
    }));
}

function enemyAttack() {
    if (monsterHP <= 0 || playerHP <= 0) return; 

    // 敵の攻撃演出
    monsterSprite.classList.remove('shake-animation');
    void monsterSprite.offsetWidth;
    monsterSprite.classList.add('shake-animation');

    let baseDamage = currentMonster.damage; 
    let damage = Math.floor(Math.random() * 5) + (baseDamage - 2); 
    if (damage < 1) damage = 1;

    playerHP -= damage;
    if (playerHP < 0) playerHP = 0;
    
    // 青いプレイヤーHPバー
    document.getElementById('player-hp-bar-fill').style.width = (playerHP / maxPlayerHP) * 100 + "%";
    
    const pDamageEffect = document.getElementById('player-damage-effect');
    if (pDamageEffect) {
        pDamageEffect.innerText = "-" + damage;
        pDamageEffect.classList.remove('damage-animation');
        void pDamageEffect.offsetWidth;
        pDamageEffect.classList.add('damage-animation');
    }

    messageText.innerText = `${currentMonster.name}の攻撃！ ${damage}ダメ！`;

    if (playerHP <= 0) {
        messageText.innerText = "敗北してしまった…";
        attackButton.disabled = true;
        clearInterval(enemyAttackTimer);
        // ★ここに追加！負けた時点の状態をセーブする
        saveGameData(); 

        // 1秒待ってゲームオーバー表示
        setTimeout(() => {
            document.getElementById('gameover-modal').style.display = "flex";
        }, 1000);
    }
}

let currentMonster;

function spawnMonster() {
    defeatCount++;
    
    // 1. 現在のステージのデータを取得
    const stage = stageMonsterData[currentStageId]; 
    const isBoss = (defeatCount % BOSS_INTERVAL === 0) || (currentStageId === 5);

    // --- 背景色の切り替え処理を追加 ---
    // #battle-field の背景色を指定された色（stage.color）に変える
    const battleField = document.getElementById('battle-field');
    if (battleField && stage.color) {
        // 少し暗めの色にするために背景色を直接設定
        battleField.style.backgroundColor = stage.color;
        // 格子演出をより際立たせるための処理
        battleField.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.7), ${stage.color})`;
    }

    // モンスターの選択
    if (isBoss) {
        currentMonster = stage.boss;
        // ステージ5なら「ラスボス」、それ以外なら「ボス」
        const prefix = (currentStageId === 5) ? "【ラスボス】" : "【ボス】";
        monsterNameText.innerText = prefix + currentMonster.name;
    } else {
        const enemyList = stage.enemies;
        currentMonster = enemyList[Math.floor(Math.random() * enemyList.length)];
        monsterNameText.innerText = currentMonster.name;
    }

    // 3. ステージに合わせて格子の色を変える（演出）
    if (stage && stage.color) {
        const floor = document.querySelector('.grid-floor');
        if (floor) {
            floor.style.borderColor = stage.color;
            floor.style.boxShadow = `0 0 20px ${stage.color}`;
        }
    }

    monsterSprite.src = currentMonster.sprite;

    // --- ラスボス巨大化処理 ---
    if (currentStageId === 5) {
        // クラスを追加して巨大化させる
        monsterSprite.classList.add('boss-giant-mode');
    } else {
        // 通常ステージではクラスを外す
        monsterSprite.classList.remove('boss-giant-mode');
    }

    // HPバーの幅調整（画像の下にそのまま出ます）
    const hpBarContainer = monsterSprite.nextElementSibling;
    if (hpBarContainer) {
        hpBarContainer.style.width = (currentStageId === 5) ? "280px" : "100px";
    }

    // 登場アニメーション
    monsterSprite.classList.remove('enemy-appear'); 
    void monsterSprite.offsetWidth;                
    monsterSprite.classList.add('enemy-appear');    
    
    monsterHP = currentMonster.hp;
    currentMaxHP = currentMonster.hp;
    hpBarFill.style.width = "100%";
    
    attackButton.disabled = false;
    homeReturnButton.style.display = "none";

    // 5. 敵の攻撃開始
    clearInterval(enemyAttackTimer);
    enemyAttackTimer = setInterval(enemyAttack, currentMonster.speed);
}

// ゲーム開始時に最初の敵を出す
spawnMonster();

// --- 6. プレイヤー攻撃の処理 ---
attackButton.onclick = function() {
    let damage = Math.floor(Math.random() * 11) + (attackPower + (level - 1) * 2);
    monsterHP -= damage;
    if (monsterHP < 0) monsterHP = 0;

    // ダメージ数字演出
    const dEffect = document.getElementById('damage-effect');
    if (dEffect) {
        dEffect.innerText = "-" + damage;
        dEffect.classList.remove('damage-animation');
        void dEffect.offsetWidth; 
        dEffect.classList.add('damage-animation');
    }

    // プレイヤーの揺れ
    playerSprite.classList.remove('player-shake-effect');
    void playerSprite.offsetWidth; 
    playerSprite.classList.add('player-shake-effect');

    // 打撃エフェクト
    const hit = document.createElement('div');
    hit.className = 'hit-effect';
    const enemyRect = monsterSprite.getBoundingClientRect();
    const fieldRect = document.getElementById('battle-field').getBoundingClientRect();
    hit.style.left = (enemyRect.left - fieldRect.left + enemyRect.width / 2 - 50) + 'px';
    hit.style.top = (enemyRect.top - fieldRect.top + enemyRect.height / 2 - 50) + 'px';
    document.getElementById('battle-field').appendChild(hit);
    setTimeout(() => hit.remove(), 300);

    // HPバーとメッセージ更新
    hpBarFill.style.width = (monsterHP / currentMaxHP) * 100 + "%";
    messageText.innerText = `${damage} のダメージ！`;
    // 撃破判定
    if (monsterHP === 0) {
        clearInterval(enemyAttackTimer);
        attackButton.disabled = true;

        // 1秒のタメ（余韻）を作ってからリザルト処理
        setTimeout(() => {
            exp += currentMonster.exp;
            let lvUp = "";
            if (exp >= 100) { level++; exp = 0; lvUp = "<br>レベルアップ！"; }
            levelText.innerText = level;
            expText.innerText = exp;

            if (defeatCount % BOSS_INTERVAL === 0) {
                // 【ボスを倒した時】の保存処理
                // 1. まず現在の全データをしっかり読み込む
                let savedDataObj = JSON.parse(localStorage.getItem('hacksla_data') || '{}');
                
                // 2. 解放状況を更新
                let unlocked = Number(savedDataObj.unlockedStage) || 1;

                // 「今の解放状況(unlocked)」と同じか、それより先のステージをクリアしたら解放する
                if (Number(currentStageId) >= unlocked) {
                    savedDataObj.unlockedStage = Number(currentStageId) + 1;
                }
                
                // 3. 次回開始ステージを「次のステージ」に予約
                savedDataObj.currentStageId = Number(currentStageId) + 1; 

                // 4. 現在の強さ（レベル等）も忘れずに保存！
                savedDataObj.level = level;
                savedDataObj.exp = exp;
                savedDataObj.attackPower = attackPower;

                // 5. 保存
                localStorage.setItem('hacksla_data', JSON.stringify(savedDataObj));

                messageText.innerHTML = `${currentMonster.name}撃破！${lvUp}<br>新エリア解放！帰還します...`;
                setTimeout(() => { window.location.href = 'home.html'; }, 3000);

            } else {
                // （ザコ敵を倒した時は今のままでOK）
                saveGameData(); // 通常セーブ
                const rem = BOSS_INTERVAL - (defeatCount % BOSS_INTERVAL);
                messageText.innerHTML = `勝利！Bossまであと ${rem} 体${lvUp}`;
                homeReturnButton.style.display = "block";
                setTimeout(spawnMonster, 2000); // 2秒で次の敵へ
            }
        }, 1000); // ここが1秒のタメ
    }
};
