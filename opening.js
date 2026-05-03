// opening.js
window.onload = function() {
    const gearBtn = document.getElementById('gear-button');
    const menuList = document.getElementById('home-menu-list');
    const resetBtn = document.getElementById('reset-button');
    
    // モーダル（ポップアップ）関連の要素
    const modal = document.getElementById('reset-modal');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');

    // 1. 歯車メニューの開閉
    if (gearBtn && menuList) {
        gearBtn.onclick = () => {
            menuList.style.display = (menuList.style.display === "none") ? "block" : "none";
        };
    }

    // 2. 「データリセット」ボタンを押したらポップアップを出す
    if (resetBtn && modal) {
        resetBtn.onclick = () => {
            modal.style.display = "flex";
            menuList.style.display = "none"; // メニューは閉じる
        };
    }

    // 3. 「やめる」を押したら閉じる
    if (cancelBtn && modal) {
        cancelBtn.onclick = () => {
            modal.style.display = "none";
        };
    }

    // 4. 「リセットする」を押したら実行
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.removeItem('hacksla_data');
            location.reload();
        };
    }
};
