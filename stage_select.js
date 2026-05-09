// 1. 各ステージのデータ（座標と魔法陣の色）
const stages = [
    { id: 1, name: "はじまりの地", x: 50, y: 75, color: "#4ade80" },
    { id: 2, name: "雷の草原",     x: 30, y: 60, color: "#facc15" },
    { id: 3, name: "火の山麓",     x: 70, y: 45, color: "#f87171" },
    { id: 4, name: "ドクロ火山",   x: 40, y: 30, color: "#b91c1c" },
    { id: 5, name: "最果ての地",   x: 50, y: 15, color: "#a855f7" }
];

// 保存キーの定義（これが無いとエラーになります）
const SAVE_KEY = 'hacksla_data';

// 要素の取得（HTMLのIDと一致させています）
const cursor = document.getElementById('selection-cursor');
const decideBtn = document.getElementById('decide-btn');
const stageTitle = document.getElementById('stage-title');
const stageDesc = document.getElementById('stage-description');

// セーブデータから現在の進捗を読み込み
const savedDataRaw = localStorage.getItem(SAVE_KEY);
const savedData = savedDataRaw ? JSON.parse(savedDataRaw) : { unlockedStage: 1 };
const currentUnlocked = Number(savedData.unlockedStage) || 1;

// 初期選択インデックスの設定
let currentIndex = currentUnlocked - 1;
if (currentIndex < 0) currentIndex = 0;
if (currentIndex >= stages.length) currentIndex = stages.length - 1;

// 選択状態を更新する関数
function updateSelection() {
    const stage = stages[currentIndex];
    
    // 魔法陣（カーソル）の位置移動
    if (cursor) {
        cursor.style.left = stage.x + "%";
        cursor.style.top = stage.y + "%";
        
        // 解放状況の再確認
        const checkData = JSON.parse(localStorage.getItem(SAVE_KEY) || '{"unlockedStage": 1}');
        const unlocked = Number(checkData.unlockedStage) || 1;

        if (stage.id <= unlocked) {
            // 解放済み
            if (stageTitle) stageTitle.innerText = "ステージ " + stage.id;
            if (stageDesc) stageDesc.innerText = stage.name;
            if (decideBtn) decideBtn.disabled = false;
            cursor.style.filter = `drop-shadow(0 0 15px ${stage.color})`;
            cursor.style.opacity = "1";
        } else {
            // 未解放
            if (stageTitle) stageTitle.innerText = "？？？";
            if (stageDesc) stageDesc.innerText = "ボスを倒して解放";
            if (decideBtn) decideBtn.disabled = true;
            cursor.style.filter = "grayscale(100%) brightness(50%)";
            cursor.style.opacity = "0.5";
        }
    }
}

// ボタンのクリックイベント
document.getElementById('next-btn').onclick = () => {
    currentIndex = (currentIndex + 1) % stages.length;
    updateSelection();
};

document.getElementById('prev-btn').onclick = () => {
    currentIndex = (currentIndex - 1 + stages.length) % stages.length;
    updateSelection();
};

decideBtn.onclick = () => {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    data.currentStageId = stages[currentIndex].id;
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    window.location.href = 'battle.html';
};

// 初回表示
updateSelection();
