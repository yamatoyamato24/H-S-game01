// --- 1. 基本変数の管理 ---
let level = 1;
let exp = 0;
let attackPower = 8; // ★初期攻撃力
let defensePower = 2; // ★初期防御力
let equipAtk = 0; // 武器の加算値
let equipDef = 0; // 防具の加算値
let playerHP = 100;
const maxPlayerHP = 100;
let monsterHP = 100;
let currentMaxHP = 100;
let enemyAttackTimer = null;
let defeatCount = 0;
const BOSS_INTERVAL = 10;
let currentStageId = 1;
let unlockedStage = 1;
let currentMonster;
let potionCount = 1; // 回復薬：初期所持数（テスト用に3個持たせておきます）
let isProcessingDefeat = false; 

// --- 2. データの読み込み ---
const savedData = localStorage.getItem('hacksla_data');
if (savedData) {
    const data = JSON.parse(savedData);
    level = data.level || 1;
    exp = data.exp || 0;
    attackPower = data.attackPower || 10;
    defensePower = data.defensePower || 5; // 防御力も読み込む
    currentStageId = Number(data.currentStageId) || 1;
    unlockedStage = data.unlockedStage || 1;
        potionCount = data.potionCount !== undefined ? data.potionCount : 3;

    // ★装備品の補正値を items.js から取得
    if (data.equipment) {
        if (data.equipment.weapon) {
            equipAtk = itemData.weapons[data.equipment.weapon]?.atk || 0;
        }
        if (data.equipment.armor) {
            equipDef = itemData.armors[data.equipment.armor]?.def || 0;
        }
    }
}

// --- 3. ステージ別データ ---  potionDropRate:回復薬は5% equipDropRate:装備品は30%
const stageMonsterData = {
    1: { name: "はじまりの草原", color: "#166534", potionDropRate: 5, equipDropRate: 30, enemies: [{ name: "クモ", exp: 30, hp: 30, damage: 5, def: 2, sprite: "assets/enemy.png", speed: 800 }, { name: "おじさん", exp: 50, hp: 100, damage: 25, def: 2, sprite: "assets/uncle.png", speed: 1500 }, { name: "幽霊", exp: 70, hp: 40, damage: 10, def: 2, sprite: "assets/ghost.png", speed: 2000 }, { name: "無", exp: 150, hp: 80, damage: 15, def: 2, sprite: "assets/nothing.png", speed: 1200 }], boss: { name: "MA（BOSS）", exp: 500, hp: 500, damage: 40, def: 10, sprite: "assets/marina_saku11.png", speed: 2500 } },
    2: { name: "青い湖", color: "#1e3a8a", potionDropRate: 5, equipDropRate: 30, enemies: [{ name: "なにこれ？", exp: 60, hp: 50, damage: 15, def: 5, sprite: "assets/marisaku03.png", speed: 700 }, { name: "手のようかい", exp: 90, hp: 150, damage: 35, def: 5, sprite: "assets/marisaku04.png", speed: 500 }, { name: "おばけかな？", exp: 100, hp: 200, damage: 25, def: 5, sprite: "assets/marisaku05.png", speed: 1000 }], boss: { name: "戦艦くん", exp: 1000, hp: 1200, damage: 60, def: 20, sprite: "assets/sorasaku01.png", speed: 2000 } },
    3: { name: "いなずまのとりで", color: "#854d0e", potionDropRate: 5, equipDropRate: 30, enemies: [{ name: "ネコもどき", exp: 120, hp: 120, damage: 30, def: 15, sprite: "assets/sorasaku02.png", speed: 1000 }, { name: "そっぽむき お化け", exp: 180, hp: 300, damage: 50, def: 15, sprite: "assets/sorasaku04.png", speed: 1600 }], boss: { name: "これでも船", exp: 2500, hp: 3000, damage: 100, def: 30, sprite: "assets/ship.png", speed: 2200 } },
    4: { name: "燃え盛る火山", color: "#7f1d1d", potionDropRate: 5, equipDropRate: 30, enemies: [{ name: "ニセ姫ブルー", exp: 350, hp: 800, damage: 90, def: 25, sprite: "assets/marisaku02blue.png", speed: 2500 }, { name: "ニセ姫グリーン", exp: 250, hp: 400, damage: 60, def: 25, sprite: "assets/marisaku02green.png", speed: 900 }, { name: "ニセ姫イエロー", exp: 300, hp: 600, damage: 70, def: 25, sprite: "assets/marisaku02yellow.png", speed: 1500 }], boss: { name: "ニセ姫BOSS", exp: 6000, hp: 7000, damage: 180, def: 40, sprite: "assets/marisaku02.png", speed: 3000 } },
    5: { name: "最果ての地", color: "#000000", potionDropRate: 5, equipDropRate: 30, boss: { name: "ラスボス", exp: 20000, hp: 50000, damage: 500, def: 50, sprite: "assets/boss_image.png", speed: 3500 } }
};

// --- 4. 要素の取得 ---
const monsterSprite = document.getElementById('monster-sprite');
const monsterNameText = document.getElementById('monster-name');
const hpBarFill = document.getElementById('hp-bar-fill');
const attackButton = document.getElementById('attack-button');
const messageText = document.getElementById('message-text');
const playerSprite = document.getElementById('player-sprite');
const homeReturnButton = document.getElementById('home-return-button');
const healButton = document.getElementById('heal-button');
const potionCountText = document.getElementById('potion-count');

// --- 5. 関数の定義 ---

// --- 回復UIの更新関数 ---
// --- 回復UIの更新関数（最大9個の表示に対応） ---
function updateHealUI() {
    const potionText = document.getElementById('potion-count');
    if (!potionText) return;

    // 個数表示
    potionText.innerText = potionCount;

    // 9個（最大）の時の色変え
    if (potionCount >= 9) {
        potionText.style.color = "#ffaa00"; 
        potionText.innerText = "9 (MAX)";
    } else {
        potionText.style.color = "#ffffff";
    }

    // --- 0個ならボタンを無効化（グレー化）して押せなくする ---
    if (potionCount <= 0) {
        healButton.disabled = true;   // ボタンを無効化（ブラウザ標準のグレーになる）
        healButton.style.backgroundColor = "#555"; // 念押しで背景も暗く
    } else {
        healButton.disabled = false;  // 1個以上なら有効化
        healButton.style.backgroundColor = "#27ae60"; // 元の緑色
    }
}

// 回復ボタンクリック
healButton.onclick = function() {
    if (typeof itemData === 'undefined') {
        console.error("items.js が読み込まれていません");
        return;
    }
    
    const potionInfo = itemData.potions.p01; 
    const healAmount = potionInfo.heal;

    // 1. 【正常に回復できる場合】
    if (potionCount > 0 && playerHP < maxPlayerHP) {
        potionCount--; // 1個消費
        
        playerHP += healAmount;
        if (playerHP > maxPlayerHP) playerHP = maxPlayerHP;

        // UI（バーと残数）更新
        updateHealUI();
        document.getElementById('player-hp-bar-fill').style.width = (playerHP / maxPlayerHP) * 100 + "%";
        
        messageText.innerText = `${potionInfo.name}を使用した！ HPが${healAmount}回復！`;
        messageText.style.color = "#00ff88"; 
        setTimeout(() => {
            messageText.style.color = "#ffcc00"; 
        }, 1000);
        
        saveGameData(); 

    // 2. 【HPがすでに満タンの場合】
    } else if (playerHP >= maxPlayerHP) {
        messageText.innerText = "HPは満タンです！";
    } else {
        messageText.innerText = "回復薬が足りません！";
    }
};

// セーブデータにカバンを追加するイメージ
let inventory = {
    weapons: [], // ["w01", "w02"] などIDで保管
    armors: [],
    potions: 1   // 回復薬は個数で管理
};

// 最後に実行命令を追加
updateHealUI();


// 経験値UI更新
function updateExpUI() {
    const nextExp = level * 30;
    const percent = Math.min((exp / nextExp) * 100, 100);
    const bar = document.getElementById('exp-bar-fill');
    if (bar) bar.style.width = percent + "%";
    const lvText = document.getElementById('level-text');
    if (lvText) lvText.innerText = level;
    const nextText = document.getElementById('exp-needed-text');
    if (nextText) nextText.innerText = (nextExp - exp);
}

// データ保存
function saveGameData() {
    localStorage.setItem('hacksla_data', JSON.stringify({ 
        level, exp, attackPower, defensePower, currentStageId, unlockedStage, potionCount,
        inventory // これを追加！
    }));
}

// 敵の出現（スライド登場復活版）
function spawnMonster() {
    defeatCount++;
    const stage = stageMonsterData[currentStageId]; 
    const isBoss = (defeatCount % BOSS_INTERVAL === 0) || (currentStageId === 5);
    
    // 背景設定などはそのまま
    const battleField = document.getElementById('battle-field');
    if (battleField && stage.color) {
        battleField.style.backgroundColor = stage.color;
        battleField.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.7), ${stage.color})`;
    }

    if (isBoss) {
        currentMonster = stage.boss;
        monsterNameText.innerText = (currentStageId === 5 ? "【ラスボス】" : "【ボス】") + currentMonster.name;
    } else {
        currentMonster = stage.enemies[Math.floor(Math.random() * stage.enemies.length)];
        monsterNameText.innerText = currentMonster.name;
    }

    // ★★★ ここが修正ポイント：スライド登場を100%発生させる手順 ★★★
    
    // 1. まずアニメーションクラスを消し、アニメーション自体を一時停止
    monsterSprite.classList.remove('enemy-appear'); 
    monsterSprite.style.animation = 'none'; 
    
    // 2. 「void」でおまじないをかけ、ブラウザに「リセットされた」と確信させる
    void monsterSprite.offsetWidth; 

    // 3. 画像をセット（enemy.pngが連続しても大丈夫になります）
    monsterSprite.src = currentMonster.sprite;

    // 4. アニメーションを有効に戻し、クラスを付け直して実行！
    monsterSprite.style.animation = ''; 
    monsterSprite.classList.add('enemy-appear');

    // ----------------------------------------------------------

    if (currentStageId === 5) { monsterSprite.classList.add('boss-giant-mode'); } 
    else { monsterSprite.classList.remove('boss-giant-mode'); }

    const hpBarContainer = monsterSprite.nextElementSibling;
    if (hpBarContainer) { hpBarContainer.style.width = (currentStageId === 5) ? "280px" : "100px"; }

    monsterHP = currentMonster.hp;
    currentMaxHP = currentMonster.hp;
    hpBarFill.style.width = "100%";
    attackButton.disabled = false;
    homeReturnButton.style.display = "none";
    clearInterval(enemyAttackTimer);
    enemyAttackTimer = setInterval(enemyAttack, currentMonster.speed);
}

// 敵の攻撃
// --- 敵の攻撃処理（防御力を反映） ---
function enemyAttack() {
    if (monsterHP <= 0 || playerHP <= 0) return; 
    monsterSprite.classList.remove('shake-animation');
    void monsterSprite.offsetWidth;
    monsterSprite.classList.add('shake-animation');

    // 💡 防御力計算：(敵の攻撃力) - (プレイヤーの防御力)
    let levelDef = (level - 1) * 2;
    let totalDef = defensePower + levelDef + equipDef;
    let baseDamage = currentMonster.damage; 

    let damage = (Math.floor(Math.random() * 5) + baseDamage) - totalDef;
    // 最低1ダメージを保証
    if (damage < 1) damage = 1;

    playerHP -= damage;
    if (playerHP < 0) playerHP = 0;
    
    document.getElementById('player-hp-bar-fill').style.width = (playerHP / maxPlayerHP) * 100 + "%";
    
    // ダメージ数字のポップアップ演出
    const pDamageEffect = document.getElementById('player-damage-effect');
    if (pDamageEffect) {
        pDamageEffect.innerText = "-" + damage;
        pDamageEffect.classList.remove('damage-animation');
        void pDamageEffect.offsetWidth;
        pDamageEffect.classList.add('damage-animation');
    }

    if (playerHP <= 0) {
        messageText.innerText = "敗北してしまった…";
        attackButton.disabled = true;
        clearInterval(enemyAttackTimer);
        saveGameData(); 
        setTimeout(() => { document.getElementById('gameover-modal').style.display = "flex"; }, 1000);
    }
}

// --- 攻撃ボタンクリック（HP全回復なし版） ---
attackButton.onclick = function() {
    if (monsterHP <= 0 || playerHP <= 0 || (typeof isProcessingDefeat !== 'undefined' && isProcessingDefeat)) return;

    // ダメージ計算
    let levelAtk = (level - 1) * 2;
    let totalAtk = attackPower + levelAtk + equipAtk;
    let enemyDef = currentMonster.def || 0;
    
    let damage = (Math.floor(Math.random() * 11) + totalAtk) - enemyDef;
    if (damage < 1) damage = 1;

    monsterHP -= damage;
    if (monsterHP < 0) monsterHP = 0;

    // 演出：ダメージ数字ポップアップ
    const dEffect = document.getElementById('damage-effect');
    if (dEffect) {
        dEffect.innerText = "-" + damage;
        dEffect.classList.remove('damage-animation');
        void dEffect.offsetWidth; 
        dEffect.classList.add('damage-animation');
    }

    // 演出：プレイヤーの揺れと打撃エフェクト
    playerSprite.classList.remove('player-shake-effect');
    void playerSprite.offsetWidth; 
    playerSprite.classList.add('player-shake-effect');

    const hit = document.createElement('div');
    hit.className = 'hit-effect';
    const enemyRect = monsterSprite.getBoundingClientRect();
    const fieldRect = document.getElementById('battle-field').getBoundingClientRect();
    hit.style.left = (enemyRect.left - fieldRect.left + enemyRect.width / 2 - 50) + 'px';
    hit.style.top = (enemyRect.top - fieldRect.top + enemyRect.height / 2 - 50) + 'px';
    document.getElementById('battle-field').appendChild(hit);
    setTimeout(() => hit.remove(), 300);

    hpBarFill.style.width = (monsterHP / currentMaxHP) * 100 + "%";
    
    // 敵のHPが0になった時の処理
    if (monsterHP === 0) {
        isProcessingDefeat = true; 
        clearInterval(enemyAttackTimer);
        attackButton.disabled = true;

        setTimeout(() => {
            exp += currentMonster.exp;
            let lvUpTriggered = false;
            const nextExp = level * 30;

            if (exp >= nextExp) {
                level++;
                exp -= nextExp;
                attackPower += 3;
                defensePower += 1; 
                lvUpTriggered = true;
                // ★HP全回復の処理を削除しました
            }

            updateExpUI();

            // ドロップ判定
            let dropMsg = "";
            const currentStage = stageMonsterData[currentStageId];
            let savedDataObj = JSON.parse(localStorage.getItem('hacksla_data') || '{}');
            if (!savedDataObj.inventory) savedDataObj.inventory = { weapons: [], armors: [] };

            // 1. 回復薬（上限9個）
            if (Math.random() * 100 < (currentStage.potionDropRate || 5)) {
                if (potionCount < 9) {
                    potionCount++;
                    updateHealUI();
                    dropMsg += `<br><span style="color:#00ff88;">★${itemData.potions.p01.name}を拾った！</span>`;
                } else {
                    dropMsg += `<br><span style="color:#888;">（回復薬が満タンです）</span>`;
                }
            }

            // 2. 装備品
            if (Math.random() * 100 < (currentStage.equipDropRate || 30)) {
                const possibleItems = dropTable[currentStageId];
                const equipPool = possibleItems.filter(id => id.startsWith('w') || id.startsWith('a'));
                if (equipPool.length > 0) {
                    const droppedId = equipPool[Math.floor(Math.random() * equipPool.length)];
                    const itemType = droppedId.startsWith('w') ? 'weapons' : 'armors';
                    savedDataObj.inventory[itemType].push(droppedId);
                    const itemName = itemData[itemType][droppedId].name;
                    dropMsg += `<br><span style="color:#ffcc00;">★${itemName}を拾った！</span>`;
                }
            }

            // レベルアップ演出
            if (lvUpTriggered) {
                playerSprite.classList.remove('player-lvup-flash');
                void playerSprite.offsetWidth; 
                playerSprite.classList.add('player-lvup-flash');

                const lvDisplay = document.createElement('div');
                lvDisplay.className = 'lvup-float';
                lvDisplay.innerText = "LEVEL UP!";
                document.getElementById('game-container').appendChild(lvDisplay);
                setTimeout(() => lvDisplay.remove(), 1200);
            }

            // 保存
            savedDataObj.level = level;
            savedDataObj.exp = exp;
            savedDataObj.attackPower = attackPower;
            savedDataObj.defensePower = defensePower; 
            savedDataObj.potionCount = potionCount;

            if (defeatCount % BOSS_INTERVAL === 0) {
                // ボス撃破
                let unlocked = Number(savedDataObj.unlockedStage) || 1;
                if (Number(currentStageId) >= unlocked) {
                    savedDataObj.unlockedStage = Number(currentStageId) + 1;
                }
                savedDataObj.currentStageId = Number(currentStageId) + 1; 
                localStorage.setItem('hacksla_data', JSON.stringify(savedDataObj));

                let lvUpMsg = lvUpTriggered ? "<br><span style='color:#ffcc00; font-weight:bold;'>LEVEL UP!</span>" : "";
                messageText.innerHTML = `${currentMonster.name}撃破！${lvUpMsg}${dropMsg}<br>新エリア解放！帰還します...`;
                setTimeout(() => { window.location.href = 'home.html'; }, 3000);
            } else {
                // ザコ撃破
                localStorage.setItem('hacksla_data', JSON.stringify(savedDataObj));
                let lvUpMsg = lvUpTriggered ? "<span style='color:#ffcc00; font-weight:bold;'>LEVEL UP!</span><br>" : "";
                const rem = BOSS_INTERVAL - (defeatCount % BOSS_INTERVAL);
                messageText.innerHTML = `${lvUpMsg}Bossまであと ${rem} 体${dropMsg}`;
                homeReturnButton.style.display = "block";
                
                setTimeout(() => {
                    isProcessingDefeat = false; 
                    spawnMonster();
                }, 2000);
            }
        }, 1000);
    }
};


// --- 6. 最後に実行命令を出す ---
updateExpUI();
spawnMonster();
