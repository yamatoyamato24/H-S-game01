// home.js
window.onload = function() {
    // --- 1. 保存データの読み込みと表示 ---
    const savedData = localStorage.getItem('hacksla_data');

    if (savedData) {
        const data = JSON.parse(savedData);
        
        // ホーム画面の「レベル」と「攻撃力」の数字を書き換える
        const levelElement = document.getElementById('home-level');
        const atkElement = document.getElementById('home-atk');

        if (levelElement) {
            levelElement.innerText = data.level;
        }
        if (atkElement) {
            // バトル画面と同じ計算式で攻撃力を表示
            const currentAtk = data.attackPower + (data.level - 1) * 2;
            atkElement.innerText = currentAtk;
        }
    }

    // --- 2. 歯車メニューの開閉処理 ---
    const gearBtn = document.getElementById('gear-button');
    const menuList = document.getElementById('home-menu-list');

    if (gearBtn && menuList) {
        gearBtn.onclick = function() {
            // 現在の状態を見て表示・非表示を切り替える
            // (初期状態が空欄""の場合もあるので、none以外なら表示するという書き方にしています)
            if (menuList.style.display === "none" || menuList.style.display === "") {
                menuList.style.display = "block";
            } else {
                menuList.style.display = "none";
            }
        };
    }
};
