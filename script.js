// --- 1. ゲームの初期設定（データ） ---
let monsterHP = 100;    // 今のHP
const maxHP = 100;      // 最大のHP（ゲージの計算用）

// --- 2. 画面の部品をJavaScriptに連れてくる ---
const hpText = document.getElementById('hp-text');
const hpBarFill = document.getElementById('hp-bar-fill');
const attackButton = document.getElementById('attack-button');
const messageText = document.getElementById('message-text');

// --- 3. ボタンを押した時の動き ---
attackButton.onclick = function() {
        // 【新機能】5〜15のダメージをランダムに作る
    // Math.random() は 0〜1 未満の数字を作ります
    let damage = Math.floor(Math.random() * 11) + 5;

    // 【攻撃】決まった10ではなく、計算したdamage分を引く
    monsterHP = monsterHP - damage;

    // もしHPがマイナスになったら0で止める
    if (monsterHP < 0) {  monsterHP = 0;  }

    // 【画面の更新：数字】
    hpText.innerText = monsterHP;

    // 【画面の更新：ゲージ】ここが今回のポイント！
    // 残りのHPの割合（％）を計算して、赤いバーの幅を変える
    let hpPercent = (monsterHP / maxHP) * 100;
    hpBarFill.style.width = hpPercent + "%";

    // ダメージをログ（記録）として表示してみる
     messageText.innerText = damage + " のダメージを与えた！";

    // モンスターを倒したか判定
    if (monsterHP === 0) {
        messageText.innerText = "モンスターをたおした！次の敵を待っています...";

         // ボタンを押せなくする（連打でバグらないように）
        attackButton.disabled = true;

        // 2秒後に復活させる（タイマー機能）
        setTimeout(function() {
            // HPを100に戻す
            monsterHP = 100;
            // 画面の数字を戻す
            hpText.innerText = monsterHP;
            // ゲージの幅を100%に戻す
            hpBarFill.style.width = "100%";
            // メッセージを戻す
            messageText.innerText = "新しいモンスターが現れた！";
            // ボタンをまた押せるようにする
            attackButton.disabled = false;
        }, 2000); // 2000ミリ秒 ＝ 2秒
    }
};
