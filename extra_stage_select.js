// extra_stage_select.js

// 1. 裏ステージのデータ（ステージ6〜）
const stages = [
    { id: 6, name: "裏・はじまりの地", x: 50, y: 60, color: "#ef4444" },
    { id: 7, name: "黒雷の草原",     x: 50, y: 30, color: "#b91c1c" },
    { id: 8, name: "深淵なる闇",     x: 50, y: 5,  color: "#b91c1c" }
];

const SAVE_KEY = 'hacksla_data';

// 要素の取得
const cursor = document.getElementById('selection-cursor');
const decideBtn = document.getElementById('decide-btn');
const stageTitle = document.getElementById('stage-title');
const stageDesc = document.getElementById('stage-description');

let currentIndex = 0;
let unlockedStage = 6; // 裏の最大解放ステージID（初期値6）

function updateSelection() {
    const stage = stages[currentIndex];
    
    if (cursor) {
        cursor.style.left = stage.x + "%";
        cursor.style.top = stage.y + "%";
        cursor.style.filter = `drop-shadow(0 0 15px ${stage.color}) sepia(1) hue-rotate(-50deg)`;
        cursor.style.opacity = "1";
    }

    if (stageTitle) stageTitle.innerText = "裏ステージ " + stage.id;
    if (stageDesc) stageDesc.innerText = stage.name;

    // 🔒【通常ステージ完全互換】選択したステージIDが解放状況以下かチェック
    if (stage.id <= unlockedStage) {
        // 解放されている場合：決定ボタンをアクティブにする
        if (decideBtn) {
            decideBtn.disabled = false;
            decideBtn.innerText = "異界へ突入";
            decideBtn.style.background = "#400";
            decideBtn.style.color = "#f44";
            decideBtn.style.opacity = "1";
            decideBtn.style.cursor = "pointer";
        }
    } else {
        // 未解放の場合：選択・覗き見はできるが決定ボタンだけを強力にロック
        if (decideBtn) {
            decideBtn.disabled = true;
            decideBtn.innerText = "🔒 封印されている";
            decideBtn.style.background = "#222";
            decideBtn.style.color = "#666";
            decideBtn.style.opacity = "0.5";
            decideBtn.style.cursor = "not-allowed";
        }
    }
}

function init() {
    // 起動時にセーブデータから最大解放ステージを読み込む
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    let savedUnlocked = Number(data.unlockedStage) || 6;
    
    unlockedStage = savedUnlocked < 6 ? 6 : savedUnlocked;

    // 前回保存されたステージIDがあれば、その位置から開始
    let savedCurrentId = Number(data.currentStageId) || 6;
    let foundIndex = stages.findIndex(s => s.id === savedCurrentId);
    currentIndex = foundIndex !== -1 ? foundIndex : 0;

    updateSelection();
}

// ボタンのクリックイベント（全ステージを自由に選択・周回できるオリジナル仕様へ復元）
const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
    nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % stages.length; // 制限なく全裏エリアをループ選択可能
        updateSelection();
    };
}

const prevBtn = document.getElementById('prev-btn');
if (prevBtn) {
    prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + stages.length) % stages.length; // 制限なく全裏エリアをループ選択可能
        updateSelection();
    };
}

// 決定ボタンを押したら extra_stage.html へ
if (decideBtn) {
    decideBtn.onclick = () => {
        const data = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
        data.currentStageId = stages[currentIndex].id; // 6, 7, 8が保存される
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        window.location.href = 'extra_stage.html';
    };
}

// 「現世に戻る」ボタンを押したときに、通常のステージ選択画面へ飛ばす
const genseiBtn = document.getElementById('gensei-return-button');
if (genseiBtn) {
    genseiBtn.onclick = () => {
        window.location.href = 'stage_select.html';
    };
}

window.onload = init;
