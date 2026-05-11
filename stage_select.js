// 1. 各ステージのデータ
const stages = [
    { id: 1, name: "はじまりの地", x: 10, y: 75, color: "#4ade80" },
    { id: 2, name: "雷の草原",     x: 60, y: 50, color: "#facc15" },
    { id: 3, name: "火の山麓",     x: 10, y: 35, color: "#f87171" },
    { id: 4, name: "ドクロ火山",   x: 70, y: 20, color: "#b91c1c" },
    { id: 5, name: "最果ての地",   x: 10, y: 5, color: "#a855f7" }
];

const SAVE_KEY = 'hacksla_data';

// 要素の取得
const cursor = document.getElementById('selection-cursor');
const decideBtn = document.getElementById('decide-btn');
const stageTitle = document.getElementById('stage-title');
const stageDesc = document.getElementById('stage-description');

// 現在のインデックス（あとで初期化関数で上書きします）
let currentIndex = 0;
// 選択状態を更新する関数
function updateSelection() {
    const stage = stages[currentIndex];
    
    // 魔法陣の位置移動
    if (cursor) {
        cursor.style.left = stage.x + "%";
        cursor.style.top = stage.y + "%";
    }

    // 最新の解放状況を取得
    const savedData = JSON.parse(localStorage.getItem(SAVE_KEY) || '{"unlockedStage": 1}');
    const unlocked = Number(savedData.unlockedStage) || 1;

    if (stage.id <= unlocked) {
        // --- 【解放済み】 ---
        if (stageTitle) stageTitle.innerText = "ステージ " + stage.id;
        if (stageDesc) stageDesc.innerText = stage.name;
        if (decideBtn) {
            decideBtn.disabled = false;
            
            // ★追加：クリア済み（現在の解放ステージより前のID）なら★を付ける
            if (stage.id < unlocked) {
                decideBtn.innerText = "★ もう一度"; 
            } else {
                decideBtn.innerText = "決定"; 
            }
        }
        
        if (cursor) {
            cursor.style.filter = `drop-shadow(0 0 15px ${stage.color})`;
            cursor.style.opacity = "1";
        }
    } else {
        // --- 【未解放】 ---
        if (stageTitle) stageTitle.innerText = "？？？";
        if (stageDesc) stageDesc.innerText = "ボスを倒して解放";
        if (decideBtn) {
            decideBtn.disabled = true;
            decideBtn.innerText = "決定"; // ロック時は通常の文字
        }
        if (cursor) {
            cursor.style.filter = "grayscale(100%) brightness(40%)";
            cursor.style.opacity = "0.5";
        }
    }
}

// 初期化関数：セーブデータを見て位置を確定させる
function init() {
    const savedData = JSON.parse(localStorage.getItem(SAVE_KEY) || '{"unlockedStage": 1}');
    const unlocked = Number(savedData.unlockedStage) || 1;
    
    // リセット直後(unlocked=1)なら currentIndex=0 (ステージ1) になる
    currentIndex = unlocked - 1;

    // 範囲外防止
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= stages.length) currentIndex = stages.length - 1;

    updateSelection();
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

// 起動時に初期化を実行
window.onload = init;
