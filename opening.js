// opening.js
window.onload = function() {
    const gearBtn = document.getElementById('gear-button');
    const menuList = document.getElementById('home-menu-list');
    const resetBtn = document.getElementById('reset-button');

    // メニューの開閉
    gearBtn.onclick = function() {
        if (menuList.style.display === "none") {
            menuList.style.display = "block";
        } else {
            menuList.style.display = "none";
        }
    };

    // リセット処理
    resetBtn.onclick = function() {
        if (confirm("セーブデータを消去して最初から始めますか？")) {
            localStorage.removeItem('hacksla_data');
            alert("データをリセットしました。");
            location.reload(); // 画面をリロード
        }
    };
};
