// 1. 最初、モンスターのHPは100に設定する
let monsterHP = 100;

// 2. 画面の「HP表示」と「ボタン」をJavaScriptで扱えるようにする
const hpText = document.getElementById('hp-text');
const attackButton = document.getElementById('attack-button');

// 3. ボタンが押された時の「攻撃のルール」を決める
attackButton.onclick = function() {
    // 10ダメージ与える
    monsterHP = monsterHP - 10;
    
    // 画面の数字を新しいHPに書き換える
    hpText.innerText = monsterHP;

    // もしHPが0以下になったら
    if (monsterHP <= 0) {
        alert("モンスターをたおした！");
    }
};
