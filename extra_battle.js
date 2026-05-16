// --- 1. 基本変数の管理 ---
let level = 1;
let exp = 0;
let attackPower = 8; // 初期攻撃力
let defensePower = 2; // 初期防御力
let equipAtk = 0; // 武器の加算値
let equipDef = 0; // 防具の加算値
let playerHP = 100;
const maxPlayerHP = 100;
let monsterHP = 100;
let currentMaxHP = 100;
let enemyAttackTimer = null;
let defeatCount = 0;
const BOSS_INTERVAL = 5; // 通常ロジックに合わせた5体ボス仕様
let currentStageId = 6; // 裏ステージ初期値（6, 7, 8）
let unlockedStage = 1;
let currentMonster;
let potionCount = 1; 
let isProcessingDefeat = false; 

// セーブデータ用インベントリの初期構造
let inventory = {
    weapons: [], 
    armors: [],
    potions: 1   
};

// --- 2. データの読み込み ---
const savedData = localStorage.getItem('hacksla_data');
if (savedData) {
    const data = JSON.parse(savedData);
    level = data.level || 1;
    exp = data.exp || 0;
    attackPower = data.attackPower || 10;
    defensePower = data.defensePower || 5; 
    currentStageId = Number(data.currentStageId) || 6; // 選択した6, 7, 8を正しく取得
    unlockedStage = data.unlockedStage || 1;
    potionCount = data.potionCount !== undefined ? data.potionCount : 3;
    if (data.inventory) {
        inventory = data.inventory;
    }

    if (data.equipment) {
        if (data.equipment.weapon) {
            equipAtk = itemData.weapons[data.equipment.weapon]?.atk || 0;
        }
        if (data.equipment.armor) {
            equipDef = itemData.armors[data.equipment.armor]?.def || 0;
        }
    }
}

// --- 3. 【最重要】裏ステージ用モンスターデータの紐付け ---
const stageMonsterData = typeof extraMonsterData !== 'undefined' ? extraMonsterData : null;

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

// 回復UIの更新関数
function updateHealUI() {
    const potionText = document.getElementById('potion-count');
    if (!potionText) return;

    potionText.innerText = potionCount;

    if (potionCount >= 9) {
        potionText.style.color = "#ffaa00"; 
        potionText.innerText = "9 (MAX)";
    } else {
        potionText.style.color = "#ffffff";
    }

    if (potionCount <= 0) {
        healButton.disabled = true;   
        healButton.style.backgroundColor = "#555"; 
    } else {
        healButton.disabled = false;  
        healButton.style.backgroundColor = "#27ae60"; 
    }
}

// 回復ボタンクリック
healButton.onclick = function() {
    if (typeof itemData === 'undefined') {
        console.error("itemData.js が読み込まれていません");
        return;
    }
    const potionInfo = itemData.potions.p01;  
    const healAmount = potionInfo.heal;

    if (potionCount > 0 && playerHP < maxPlayerHP) {
        potionCount--; 
        playerHP += healAmount;
        if (playerHP > maxPlayerHP) playerHP = maxPlayerHP;

        updateHealUI();
        document.getElementById('player-hp-bar-fill').style.width = (playerHP / maxPlayerHP) * 100 + "%";
        messageText.innerText = `${potionInfo.name}を使用した！ HPが${healAmount}回復！`;

        saveGameData();
    } else if (playerHP >= maxPlayerHP) {
        messageText.innerText = "HPは満タンです！";
    } else {
        messageText.innerText = "回復薬が足りません！";
    }
};

// 最後に実行命令を追加
updateHealUI();

// 経験値UI更新
function updateExpUI() {
    const nextExp = level * 50;
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
        inventory,
        isExtraUnlocked: true // 裏拠点への動線固定フラグ
    }));
}
// 敵の出現（スライド登場・真ボス専用背景＆赤いオーラ完全対応版）
function spawnMonster() {
    if (isProcessingDefeat || !stageMonsterData || !stageMonsterData[currentStageId]) return;

    const stage = stageMonsterData[currentStageId];
    
    // 💡【修正ポイント】10体目（BOSS_INTERVAL）のタイミング、または「ステージ8」である場合はボスを出す
    const isBoss = ((defeatCount + 1) % BOSS_INTERVAL === 0) || (Number(currentStageId) === 8);
    const battleField = document.getElementById('battle-field');
    const curtain = document.getElementById('boss-curtain');

    if (battleField) {
        battleField.style.backgroundColor = stage.color || "#000";
    }
    if (curtain) {
        curtain.style.display = "none"; 
    }

    // （spawnMonster関数内の、ボス・雑魚の出現分岐の箇所を以下に上書きアップデート）
    if (isBoss) {
        currentMonster = stage.boss;
        monsterNameText.innerText = currentMonster.name;
        if (monsterSprite) monsterSprite.classList.add('boss-giant-mode');

        // 🔥【最重要】ステージ8（真ボス）の時だけ、時空の歪みエフェクトを点火！
        const distortionContainer = document.getElementById('extra-distortion-bg');
        if (Number(currentStageId) === 8) {
            // ① 真ボスの体に赤い脈動オーラをまとわせる
            if (monsterSprite) monsterSprite.classList.add('true-boss-aura');
            
            // ② 疑似的に「クロノトリガー魔王戦」の吸い込み歪み背景レイヤーをHTMLへ動的追加！
            if (distortionContainer) {
                distortionContainer.innerHTML = '<div class="chrono-magus-distortion"></div>';
            }
        } else {
            // ステージ6や7のボスは通常通り（オーラなし・歪み背景も消去）
            if (monsterSprite) monsterSprite.classList.remove('true-boss-aura');
            if (distortionContainer) distortionContainer.innerHTML = '';
        }

    } else {
        // ステージ6・7の雑魚敵選出
        const enemyList = stage.enemies;
        currentMonster = enemyList[Math.floor(Math.random() * enemyList.length)];
        monsterNameText.innerText = currentMonster.name;
        if (monsterSprite) monsterSprite.classList.remove('boss-giant-mode');
        
        // 雑魚敵の時もオーラと歪み背景を完全に消去
        if (monsterSprite) monsterSprite.classList.remove('true-boss-aura');
        const distortionContainer = document.getElementById('extra-distortion-bg');
        if (distortionContainer) distortionContainer.innerHTML = '';
        
        const rem = BOSS_INTERVAL - ((defeatCount + 1) % BOSS_INTERVAL);
        messageText.innerText = `Bossまであと ${rem} 体`;
    }


    // --- 演出リセット：スライド登場制御 ---
    if (monsterSprite) {
        monsterSprite.classList.remove('enemy-appear'); 
        monsterSprite.style.animation = ''; 
        monsterSprite.style.display = "none"; 
        void monsterSprite.offsetWidth; 

        monsterSprite.src = currentMonster.sprite;
        monsterSprite.style.display = "block";
        monsterSprite.classList.add('enemy-appear');
    }

    // 登場クラスを1秒後に消去して攻撃時の左スライドバグを完全に防止
    setTimeout(() => {
        if (monsterSprite) monsterSprite.classList.remove('enemy-appear');
    }, 1000);

    monsterHP = currentMonster.hp;
    currentMaxHP = currentMonster.hp;
    if (hpBarFill) hpBarFill.style.width = "100%";
    attackButton.disabled = false;
    if (homeReturnButton) homeReturnButton.style.display = "none";
    
    clearInterval(enemyAttackTimer);
    enemyAttackTimer = setInterval(enemyAttack, currentMonster.speed);
}


// --- 敵の攻撃（通常互換・裏ステージ補正計算版・エラー完全解消仕様） ---
function enemyAttack() {
    if (monsterHP <= 0 || playerHP <= 0 || isProcessingDefeat) return;
    
    // 💡【確実な揺らし方】一度クラスを完全に消去し、わずか1ミリ秒後に再付与して点火
    if (monsterSprite) {
        monsterSprite.classList.remove('shake-animation');
        setTimeout(() => {
            monsterSprite.classList.add('shake-animation');
        }, 1);
        
        // 攻撃アニメーションが終わる0.4秒後にクラスを綺麗に掃除しておく
        setTimeout(() => {
            monsterSprite.classList.remove('shake-animation');
        }, 400);
    }

    // （以下、レベル防御の計算やプレイヤーへのダメージ処理）
    let levelDef = (level - 1) * 2;
    let totalDef = defensePower + levelDef + equipDef;
    
    let damage = (Math.floor(Math.random() * 5) + currentMonster.damage) - totalDef;
    if (damage < 1) damage = 1;

    playerHP -= damage;
    if (playerHP < 0) playerHP = 0;
    
    const pHPBar = document.getElementById('player-hp-bar-fill');
    if (pHPBar) pHPBar.style.width = (playerHP / maxPlayerHP) * 100 + "%";
    
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

        // 🛡️ 装備保護ロジック：既存のセーブデータを丸ごと読み込む
        let currentData = JSON.parse(localStorage.getItem('hacksla_data') || '{}');

        // 基本ステータスやポーション数を安全に更新（現在の装備やカバンはそのまま維持される）
        currentData.level = level;
        currentData.exp = exp;
        currentData.attackPower = attackPower;
        currentData.defensePower = defensePower;
        currentData.potionCount = potionCount;
        currentData.inventory = inventory;
        currentData.isExtraUnlocked = true;

        // 確実に保存
        localStorage.setItem('hacksla_data', JSON.stringify(currentData));

        const goModal = document.getElementById('gameover-modal');
        if (goModal) {
            setTimeout(() => { goModal.style.display = "flex"; }, 1000);
        } else {
            setTimeout(() => { location.href = 'home.html'; }, 2000);
        }
    }
}

// --- 攻撃ボタンクリック（演出・ドロップ全合流完全版） ---
// --- 攻撃ボタンクリック（演出・通常互換・裏ステージ完全対応版） ---
attackButton.onclick = function() {
    if (monsterHP <= 0 || playerHP <= 0 || isProcessingDefeat) return;

    // 通常ステージと同じ攻撃・与ダメ補正計算（ランダム幅11）
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

    // 演出：プレイヤー揺れとヒットエフェクト
    if (playerSprite) {
        playerSprite.classList.remove('player-shake-effect');
        void playerSprite.offsetWidth; 
        playerSprite.classList.add('player-shake-effect');
    }

    const hit = document.createElement('div');
    hit.className = 'hit-effect';
    const enemyRect = monsterSprite.getBoundingClientRect();
    const fieldRect = document.getElementById('battle-field').getBoundingClientRect();
    hit.style.left = (enemyRect.left - fieldRect.left + enemyRect.width / 2 - 50) + 'px';
    hit.style.top = (enemyRect.top - fieldRect.top + enemyRect.height / 2 - 50) + 'px';
    document.getElementById('battle-field').appendChild(hit);
    setTimeout(() => hit.remove(), 300);

    if (hpBarFill) {
        hpBarFill.style.width = (monsterHP / currentMaxHP) * 100 + "%";
    }
    
    // ==========================================================
    // 🏆 【ここが心臓部】敵のHPが0になった時の撃破判定とクリア処理
    // ==========================================================
    if (monsterHP === 0) {
        isProcessingDefeat = true; 
        clearInterval(enemyAttackTimer);
        attackButton.disabled = true;

        setTimeout(() => {
            // 経験値・レベルアップ処理（大量獲得時のマイナスバグをループで解決）
            exp += currentMonster.exp;
            let lvUpTriggered = false;
            
            let nextExp = level * 50;
            while (exp >= nextExp) {
                exp -= nextExp;
                level++;
                attackPower += 3;
                defensePower += 1; 
                lvUpTriggered = true;
                nextExp = level * 50;
            }
            updateExpUI();

            // ドロップ判定（回復薬）
            let dropMsg = "";
            const currentStage = stageMonsterData[currentStageId];

            if (Math.random() * 100 < (currentStage.potionDropRate || 5)) {
                if (potionCount < 9) {
                    potionCount++;
                    updateHealUI();
                    dropMsg += `<br><span style="color:#00ff88;">★回復薬を拾った！</span>`;
                }
            }

            // 裏ステージ（6・7）限定の装備ドロップ抽選
            if (Number(currentStageId) !== 8 && (Math.random() * 100 < (currentStage.equipDropRate || 30))) {
                const possibleItems = typeof dropTable !== 'undefined' ? dropTable[currentStageId] : null;
                if (possibleItems) {
                    const equipPool = possibleItems.filter(id => id.startsWith('w') || id.startsWith('a'));
                    if (equipPool.length > 0) {
                        const droppedId = equipPool[Math.floor(Math.random() * equipPool.length)];
                        const itemType = droppedId.startsWith('w') ? 'weapons' : 'armors';
                        
                        inventory[itemType].push(droppedId); // かばん配列へ確実に追加
                        dropMsg += `<br><span style="color:#ffffff;">★${itemData[itemType][droppedId].name}を拾った！</span>`;
                    }
                }
            }

            // レベルアップ演出
            if (lvUpTriggered && playerSprite) {
                playerSprite.classList.add('player-lvup-flash');
                const lvDisplay = document.createElement('div');
                lvDisplay.className = 'lvup-float';
                lvDisplay.innerText = "LEVEL UP!";
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) gameContainer.appendChild(lvDisplay);
                setTimeout(() => lvDisplay.remove(), 1200);
            }

            // 撃破数をカウント
            defeatCount++; 

            // セーブデータの読み込みと基本情報の同期
            let savedDataObj = JSON.parse(localStorage.getItem('hacksla_data') || '{}');
            savedDataObj.level = level;
            savedDataObj.exp = exp;
            savedDataObj.attackPower = attackPower;
            savedDataObj.defensePower = defensePower; 
            savedDataObj.potionCount = potionCount;
            savedDataObj.inventory = inventory;
            savedDataObj.isExtraUnlocked = true;

            // 🎬【最重要：ステージ8真クリア判定・1体完結仕様】
            // ステージ8であれば、撃破数に関係なく、この1体を倒した時点で即座に世界クリア！
            if (Number(currentStageId) === 8) {
                savedDataObj.isTrueCleared = true; 
                localStorage.setItem('hacksla_data', JSON.stringify(savedDataObj));
                
                messageText.innerHTML = `<span style="color:gold; font-weight:bold;">真ボス撃破！！！<br>世界に真の夜明けが訪れる……！</span>`;
                
                // 2.5秒後にキャッシュクリアURL付きの真エンディング画面へ移動
                setTimeout(() => { 
                    window.location.href = 'ending.html?v=3'; 
                }, 2500);
                return; // ここで完全に終了させ、下の「次のザコ敵の出現」を確実にストップ
            }

            // --- 以下、ステージ6・7のボス撃破・雑魚ループ処理 ---
            const isJustDefeatedBoss = (defeatCount % BOSS_INTERVAL === 0);

            if (isJustDefeatedBoss) {
                // ステージ6, 7のボスを倒した場合：次のエリアを解放して拠点へ帰還
                let unlocked = Number(savedDataObj.unlockedStage) || 1;
                if (Number(currentStageId) >= unlocked) {
                    savedDataObj.unlockedStage = Number(currentStageId) + 1;
                }
                savedDataObj.currentStageId = Number(currentStageId) + 1; 
                localStorage.setItem('hacksla_data', JSON.stringify(savedDataObj));
                
                messageText.innerHTML = `${currentMonster.name}撃破！<br>新エリア解放！帰還します...`;
                setTimeout(() => { window.location.href = 'home.html'; }, 3000);
            } else {
                // ステージ6, 7の通常雑魚撃破時：2秒後に次のモンスターへ
                localStorage.setItem('hacksla_data', JSON.stringify(savedDataObj));
                const rem = BOSS_INTERVAL - (defeatCount % BOSS_INTERVAL);
                messageText.innerHTML = `Bossまであと ${rem} 体${dropMsg}`;
                if (homeReturnButton) homeReturnButton.style.display = "block";
                
                // 敵の画像を右へ動かさず、不透明度（opacity）を0にして「その場でフワッと消滅」させます
                if (monsterSprite) {
                    monsterSprite.style.transition = "opacity 0.5s ease-out"; // 0.5秒かけて消える滑らかさ
                    monsterSprite.style.opacity = "0"; 
                }

                setTimeout(() => {
                    isProcessingDefeat = false;
                    if (playerSprite) playerSprite.classList.remove('player-lvup-flash');

                    // 💡 次の敵が出る前に、消した透明度（opacity）と滑らかさを元通り（1）に戻しておく
                    if (monsterSprite) {
                        monsterSprite.style.transition = "none"; 
                        monsterSprite.style.opacity = "1";
                    }

                    spawnMonster(); // 次の敵が出現
                }, 2000);
            }
        }, 1000);
    }
};

// --- 6. 最後に実行命令を出して点火 ---
updateExpUI();
spawnMonster();
