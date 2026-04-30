// --- 1. ゲームの初期設定（データ） ---
let monsterHP = 100;    // 今のHP
const maxHP = 100;      // 最大のHP（ゲージの計算用）

// --- 2. 画面の部品をJavaScriptに連れてくる ---
const hpText = document.getElementById('hp-text');
const hpBarFill = document.getElementById('hp-bar-fill');
const attackButton = document.getElementById('attack-button');

// --- 3. ボタンを押した時の動き ---
attackButton.onclick = function() {
    // 【攻撃】HPを10減らす
    monsterHP = monsterHP - 10;

    // もしHPがマイナスになったら0で止める
    if (monsterHP < 0) {
        monsterHP = 0;
    }

    // 【画面の更新：数字】
    hpText.innerText = monsterHP;

    // 【画面の更新：ゲージ】ここが今回のポイント！
    // 残りのHPの割合（％）を計算して、赤いバーの幅を変える
    let hpPercent = (monsterHP / maxHP) * 100;
    hpBarFill.style.width = hpPercent + "%";

    // モンスターを倒したか判定
    if (monsterHP === 0) {
        alert("モンスターをたおした！");
    }
};
