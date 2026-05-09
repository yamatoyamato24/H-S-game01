// home.js
window.onload = function() {
    const savedData = localStorage.getItem('hacksla_data');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // 各要素が存在するか確認してから代入する（エラー防止）
        const levelElement = document.getElementById('home-level');
        const atkElement = document.getElementById('home-atk');

        if (levelElement && data.level !== undefined) {
            levelElement.innerText = data.level;
        }
        if (atkElement && data.attackPower !== undefined) {
            // 攻撃力の計算
            const currentAtk = Number(data.attackPower) + (Number(data.level) - 1) * 2;
            atkElement.innerText = currentAtk;
        }
    }
    // ★重要：ここに「localStorage.setItem」を絶対に書かないでください！
    // 拠点画面は「見るだけ」に徹することで、上書きミスを防ぎます。

    // 歯車メニューの処理（ここは変更なしでOK）
    const gearBtn = document.getElementById('gear-button');
    const menuList = document.getElementById('home-menu-list');
    if (gearBtn && menuList) {
        gearBtn.onclick = function() {
            menuList.style.display = (menuList.style.display === "none" || menuList.style.display === "") ? "block" : "none";
        };
    }
};
