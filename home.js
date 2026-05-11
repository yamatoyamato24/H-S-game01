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
    const level = Number(data.level) || 1;
    const baseAtk = Number(data.attackPower) || 10;
    
    let equipAtk = 0;
    let weaponName = "なし";
    let armorName = "なし";

    if (data.equipment) {
        if (data.equipment.weapon) {
            const wItem = itemData.weapons[data.equipment.weapon];
            equipAtk = wItem?.atk || 0;
            weaponName = wItem?.name || "なし";
        }
        if (data.equipment.armor) {
            const aItem = itemData.armors[data.equipment.armor];
            armorName = aItem?.name || "なし";
        }
    }

    // 各表示場所(HTML)への反映
    const levelElement = document.getElementById('home-level');
    const atkElement = document.getElementById('home-atk');
    const weaponDisplay = document.getElementById('current-weapon-name');
    const armorDisplay = document.getElementById('current-armor-name');

    if (levelElement) levelElement.innerText = level;
    if (atkElement) {
        const levelBonus = (level - 1) * 2;
        const totalAtk = baseAtk + levelBonus + equipAtk;
        atkElement.innerText = equipAtk > 0 ? `${totalAtk} (+${equipAtk})` : totalAtk;
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

    // --- ① ヘッダー右側の「装備中」表示（変更なし） ---
    // (省略しますが、先ほどのコードをそのまま使用します)
    // --- 装備中の表示ロジック ---
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

    // --- ② 【ここが重要】同じアイテムをカウントする ---
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

// --- 初期化 ---
window.onload = function() {
    const savedDataStr = localStorage.getItem('hacksla_data');
    if (savedDataStr) {
        const data = JSON.parse(savedDataStr);
        refreshStatusDisplay(data);
    }

    const gearBtn = document.getElementById('gear-button');
    const menuList = document.getElementById('home-menu-list');
    if (gearBtn && menuList) {
        gearBtn.onclick = function() {
            menuList.style.display = (menuList.style.display === "none" || menuList.style.display === "") ? "block" : "none";
        };
    }
};
