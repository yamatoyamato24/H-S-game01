// 1. 各ステージの座標とデータ
const stages = [
    { id: 1, name: "はじまりの地", x: 14, y: 82, color: "#4ade80" },
    { id: 2, name: "雷の草原",     x: 59, y: 65, color: "#facc15" },
    { id: 3, name: "火の山麓",     x: 13, y: 43, color: "#f87171" },
    { id: 4, name: "ドクロ火山",   x: 70, y: 24, color: "#b91c1c" },
    { id: 5, name: "最果ての地",   x: 15, y: 5,  color: "#a855f7" }
];

// ★修正ポイント：保存データから現在の解放状況を読み込む
const savedData = JSON.parse(localStorage.getItem('hacksla_data') || '{"unlockedStage": 1}');
const currentUnlocked = Number(savedData.unlockedStage) || 1;

// ★修正ポイント：最初から「一番新しいステージ」を指すようにする
// (例：解放が3なら、配列のインデックスは2番目を指す)
let currentIndex = currentUnlocked - 1;

// 万が一のための安全策（範囲外にならないように）
if (currentIndex < 0) currentIndex = 0;
if (currentIndex >= stages.length) currentIndex = stages.length - 1;

const cursor = document.getElementById('selection-cursor');
const stageInfo = document.getElementById('stage-info');
const decideBtn = document.getElementById('decide-btn');

// 3. 選択状態を更新する関数
function updateSelection() {
    const stage = stages[currentIndex];
    
    cursor.style.left = stage.x + "%";
    cursor.style.top = stage.y + "%";

    // ★再チェック：ここでも最新の解放状況を確認
    const currentSavedData = JSON.parse(localStorage.getItem('hacksla_data') || '{"unlockedStage": 1}');
    const unlocked = Number(currentSavedData.unlockedStage) || 1;

    if (stage.id <= unlocked) {
        stageInfo.innerText = "Stage " + stage.id + ": " + stage.name;
        decideBtn.disabled = false;
        cursor.style.filter = `drop-shadow(0 0 10px ${stage.color})`; 
    } else {
        stageInfo.innerText = "？？？ (ボスを倒して解放)";
        decideBtn.disabled = true;
        cursor.style.filter = "grayscale(100%) brightness(40%)"; 
    }
}

// 4. 矢印ボタンの処理
document.getElementById('next-btn').onclick = () => {
    currentIndex = (currentIndex + 1) % stages.length;
    updateSelection();
};

document.getElementById('prev-btn').onclick = () => {
    currentIndex = (currentIndex - 1 + stages.length) % stages.length;
    updateSelection();
};

// 5. 決定ボタンの処理
decideBtn.onclick = () => {
    const finalData = JSON.parse(localStorage.getItem('hacksla_data') || '{}');
    // 現在選んでいるステージのIDを確実に保存する
    finalData.currentStageId = stages[currentIndex].id;
    localStorage.setItem('hacksla_data', JSON.stringify(finalData));
    window.location.href = 'battle.html';
};

// 初回表示
updateSelection();

function updateStageMarkers() {
    // セーブデータから現在の解放ステージを取得 (例: 3ならステージ1, 2はクリア済み)
    const savedData = JSON.parse(localStorage.getItem("rpg_save_data")) || {};
    const unlockedStage = Number(savedData.unlockedStage) || 1;

    // 全てのステージボタンをループ処理
    const stageButtons = document.querySelectorAll(".stage-card");
    
    stageButtons.forEach((button) => {
        const stageId = Number(button.dataset.stageId); // HTMLのdata属性から取得

        // 現在の解放ステージより小さいIDは「クリア済み」とみなす
        if (stageId < unlockedStage) {
            button.classList.add("is-cleared");
            // バッジの中身を★にする
            const badge = button.querySelector(".clear-badge");
            if (badge) badge.innerText = "★";
        } else {
            button.classList.remove("is-cleared");
        }

        // ついでに最新ステージに魔法陣（カーソル）を合わせる処理もここに
        if (stageId === unlockedStage) {
            moveSelectionCursor(button); 
        }
    });
}
