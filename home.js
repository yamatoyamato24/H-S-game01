// home.js

// 1. インベントリを開く
function openInventory(type) {
    const modal = document.getElementById('inventory-modal');
    const title = document.getElementById('inventory-title');
    if (modal) modal.style.display = 'flex';
    if (title) title.innerText = (type === 'weapons' ? '武器リスト' : '防具リスト');
    
    showTab(type); 
}

// 2. インベントリを閉じる
function closeInventory() {
    const modal = document.getElementById('inventory-modal');
    if (modal) modal.style.display = 'none';
}

// 3. ステータス表示の更新（装備・レベル・装備名すべてを更新）
function refreshStatusDisplay(data) {
    if (!data) return;

    // 基本値の取得
    const level = Number(data.level) || 1;
    const baseAtk = Number(data.attackPower) || 8;
    const baseDef = Number(data.defensePower) || 2;
    
    let equipAtk = 0;
    let equipDef = 0;
    let weaponName = "なし";
    let armorName = "なし";

    // 装備データの取得
    if (data.equipment) {
        if (data.equipment.weapon && itemData.weapons[data.equipment.weapon]) {
            const wItem = itemData.weapons[data.equipment.weapon];
            equipAtk = wItem.atk;
            weaponName = wItem.name;
        }
        if (data.equipment.armor && itemData.armors[data.equipment.armor]) {
            const aItem = itemData.armors[data.equipment.armor];
            equipDef = aItem.def;
            armorName = aItem.name;
        }
    }

    // 計算（バトル画面の計算式に統一）
    const totalAtk = baseAtk + (level - 1) * 3 + equipAtk;
    const totalDef = baseDef + (level - 1) * 1 + equipDef;

    // HTML要素を取得して反映
    const levelElement = document.getElementById('home-level');
    const atkElement = document.getElementById('home-atk');
    const defElement = document.getElementById('home-def');
    const weaponDisplay = document.getElementById('current-weapon-name');
    const armorDisplay = document.getElementById('current-armor-name');

    if (levelElement) levelElement.innerText = level;
    if (atkElement) {
        atkElement.innerText = equipAtk > 0 ? `${totalAtk} (+${equipAtk})` : totalAtk;
    }
    if (defElement) {
        defElement.innerText = equipDef > 0 ? `${totalDef} (+${equipDef})` : totalDef;
    }
    if (weaponDisplay) weaponDisplay.innerText = weaponName;
    if (armorDisplay) armorDisplay.innerText = armorName;
}

// 4. インベントリ内のアイテムリスト生成
function showTab(type) {
    const listArea = document.getElementById('item-list-area');
    const miniSlot = document.getElementById('equipped-mini-slot');
    if (!listArea || !miniSlot) return;

    listArea.innerHTML = "";
    miniSlot.innerHTML = "";

    const savedData = JSON.parse(localStorage.getItem('hacksla_data') || '{}');
    const inventory = savedData.inventory || { weapons: [], armors: [] };
    const equipped = savedData.equipment || { weapon: null, armor: null };

    const currentId = (type === 'weapons') ? equipped.weapon : equipped.armor;
    const itemIds = inventory[type] || [];

    // --- ① ヘッダー右側の「装備中」表示 ---
    if (currentId) {
        const item = itemData[type][currentId];
        miniSlot.innerHTML = `
            <div class="item-card equipped-style">
                <div style="text-align:left;">
                    <div style="font-weight:bold;">${item.name}</div>
                    <div style="font-size:10px; color:#ffcc00;">${type==='weapons'?'ATK':'DEF'}+${type==='weapons'?item.atk:item.def}</div>
                </div>
                <div style="font-size:10px; color:#aaa; writing-mode: vertical-rl;">装備中</div>
            </div>
        `;
    } else {
        miniSlot.innerHTML = `<div class="item-card equipped-style" style="color:#666; justify-content:center; align-items:center; display:flex;">なし</div>`;
    }

    // --- ② 同じアイテムをカウントする ---
    const counts = {};
    itemIds.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
    });

    // ユニークなIDのリスト（装備中のものは除く）
    const uniqueIds = Object.keys(counts).filter(id => id !== currentId);

    if (uniqueIds.length === 0) {
        listArea.innerHTML = `<p style="grid-column:1/3; color:#666; text-align:center; font-size:12px; margin-top:20px;">なし</p>`;
        return;
    }

    // カウントした結果を元にカードを作成
    uniqueIds.forEach((id) => {
        const item = itemData[type][id];
        const count = counts[id]; // 個数
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <div style="font-weight:bold; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;">${item.name}</div>
                <div style="font-size:10px; color:#ffcc00;">×${count}</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:10px; color:#aaa;">${type==='weapons'?'ATK':'DEF'}+${type==='weapons'?item.atk:item.def}</span>
                <button onclick="equipItem('${type}', '${id}')" style="padding:2px 5px; font-size:10px; cursor:pointer;">装備</button>
            </div>
        `;
        listArea.appendChild(card);
    });
}

// --- 歯車メニューの開閉ロジック ---
document.addEventListener('DOMContentLoaded', () => {
    const gearBtn = document.getElementById('gear-button');
    const menuList = document.getElementById('home-menu-list');

    if (gearBtn && menuList) {
        gearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = menuList.style.display === 'none';
            menuList.style.display = isHidden ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            menuList.style.display = 'none';
        });
    }
});

// 5. 装備の変更
function equipItem(type, id) {
    const savedData = JSON.parse(localStorage.getItem('hacksla_data') || '{}');
    if (!savedData.equipment) savedData.equipment = { weapon: null, armor: null };

    if (type === 'weapons') savedData.equipment.weapon = id;
    if (type === 'armors') savedData.equipment.armor = id;

    localStorage.setItem('hacksla_data', JSON.stringify(savedData));
    
    refreshStatusDisplay(savedData); // 拠点の表示を更新
    showTab(type); // インベントリの表示を更新
}

// 🔥【新規実装】「冒険に出る」ボタン押下時の進行度に応じた自動分岐分岐処理
function startAdventure() {
    const savedDataStr = localStorage.getItem('hacksla_data');
    if (savedDataStr) {
        const data = JSON.parse(savedDataStr);
        // 裏ステージ解放フラグが true であれば裏の選択画面へ直接遷移
        if (data.isExtraUnlocked === true) {
            location.href = 'extra_stage_select.html';
            return;
        }
    }
    // データがない、または通常進行中であれば通常の選択画面へ
    location.href = 'stage_select.html';
}

// --- 初期化 ---
window.onload = function() {
    const savedDataStr = localStorage.getItem('hacksla_data');
    if (savedDataStr) {
        const data = JSON.parse(savedDataStr);
        refreshStatusDisplay(data); // 起動時に必ず実行
    }

    // 🔥【新規実装】HTML側の「冒険に出る」ボタンとイベントを安全に紐付け
    // HTMLのボタンIDが異なる場合は、実際のID（例: 'adventure-btn' 等）に書き換えてください
    const adventureBtn = document.getElementById('adventure-button');
    if (adventureBtn) {
        adventureBtn.onclick = startAdventure; // セーブデータを見て通常/裏を自動分岐
    }
};
