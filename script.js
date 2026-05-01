// --- 1. ゲームの初期設定（データ） ---
let monsterHP = 100;    // 今のHP
const maxHP = 100;      // 最大のHP（ゲージの計算用）

//レベルの変数を追加
let level = 1;      // 現在のレベル
let exp = 0;        // 現在の経験値
let attackPower = 10; // 攻撃の基本威力

// 【追加】モンスターのリストと、それぞれの経験値
const monsters = [
    { name: "スライム", exp: 30 },
    { name: "ゴブリン", exp: 50 },
    { name: "スケルトン", exp: 70 },
    { name: "ドラゴン", exp: 150 }
];
let currentMonster = monsters[0]; // 今のモンスターを覚えておく

// --- 2. 画面の部品をJavaScriptに連れてくる ---
const hpText = document.getElementById('hp-text');
const hpBarFill = document.getElementById('hp-bar-fill');
const attackButton = document.getElementById('attack-button');
const messageText = document.getElementById('message-text');

// 追加：レベルと経験値の表示場所
const levelText = document.getElementById('level-text');
const expText = document.getElementById('exp-text');

const monsterNameText = document.getElementById('monster-name'); // 追加

// 新しくエフェクト用の部品を取得
const damageEffect = document.getElementById('damage-effect');


// --- 3. ボタンを押した時の動き ---
attackButton.onclick = function() {
        // 【新機能】5〜15のダメージをランダムに作る
    // Math.random() は 0〜1 未満の数字を作ります
    // 攻撃力をレベルに合わせて少し強くする
    let currentPower = attackPower + (level - 1) * 2;
    let damage = Math.floor(Math.random() * 11) + currentPower;

    // 【攻撃】決まった10ではなく、計算したdamage分を引く
    monsterHP = monsterHP - damage;

    // もしHPがマイナスになったら0で止める
    if (monsterHP < 0) {  monsterHP = 0;  }

    // --- ダメージエフェクトの表示 ---
    damageEffect.innerText = "-" + damage;
    damageEffect.classList.remove('damage-animation'); // 一度アニメーションをリセット
    void damageEffect.offsetWidth; // おまじない（再描画）
    damageEffect.classList.add('damage-animation'); // アニメーション開始

    // 画面更新
    hpText.innerText = monsterHP;
    hpBarFill.style.width = (monsterHP / maxHP) * 100 + "%";
    messageText.innerText = damage + " のダメージを与えた！";

    // （以下、倒した時の処理は前回と同じ）
    };
    
    // 【画面の更新：数字】
    hpText.innerText = monsterHP;
    hpBarFill.style.width = (monsterHP / maxHP) * 100 + "%";
    messageText.innerText = damage + " のダメージを与えた！";

    // 【画面の更新：ゲージ】ここが今回のポイント！
    // 残りのHPの割合（％）を計算して、赤いバーの幅を変える
    let hpPercent = (monsterHP / maxHP) * 100;
    hpBarFill.style.width = hpPercent + "%";

    // ダメージをログ（記録）として表示してみる
     messageText.innerText = damage + " のダメージを与えた！";

    // モンスターを倒したか判定
    if (monsterHP === 0)  {
        // 【修正】倒したモンスターに応じた経験値をゲット
        exp = exp + currentMonster.exp;
        messageText.innerText = currentMonster.name + "を倒した！" + currentMonster.exp + "の経験値を獲得！";
        
        // 【レベルアップ判定】経験値が100溜まったらレベルアップ
        if (exp >= 100) {
            level = level + 1;
            exp = 0; // 経験値をリセット
            messageText.innerText = "レベルアップ！ Lv." + level + " になった！";
        }

        // 画面のレベル表示を更新
        levelText.innerText = level;
        expText.innerText = exp;
        attackButton.disabled = true;

        setTimeout(function() {
            // 【新機能】次のモンスターをランダムに選ぶ
            const randomIndex = Math.floor(Math.random() * monsters.length);
            currentMonster = monsters[randomIndex];
            
            // 画面の表示をリセット
            monsterNameText.innerText = currentMonster.name + "があらわれた！";
            monsterHP = 100;
            hpText.innerText = monsterHP;
            hpBarFill.style.width = "100%";
            attackButton.disabled = false;
        }, 1500);
    }