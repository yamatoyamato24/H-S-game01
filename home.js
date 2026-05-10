// home.js

// 1. ステータス表示の更新（装備・レベル補正を合算）
function refreshStatusDisplay(data) {
    const level = Number(data.level) || 1;
    const baseAtk = Number(data.attackPower) || 10;
    
    // 装備による加算値を計算
    let equipAtk = 0;
    if (data.equipment && data.equipment.weapon) {
        // items.js のデータから ATK を取得
        equipAtk = itemData.weapons[data.equipment.weapon]?.atk || 0;
    }

    // 各要素への反映
    const levelElement = document.getElementById('home-level');
    const atkElement = document.getElementById('home-atk');

    if (levelElement) levelElement.innerText = level;
    if (atkElement) {
        // 攻撃力の計算: (基礎値) + (レベル補正) + (装備補正)
        const levelBonus = (level - 1) * 2;
        const totalAtk = baseAtk + levelBonus + equipAtk;
        
        // 装備補正がある場合は (+5) のように表示
        atkElement.innerText = equipAtk > 0 ? `${totalAtk} (+${equipAtk})` : totalAtk;
    }
}

// 2. インベントリ画面の表示制御
function openInventory() {
    document.getElementById('inventory-modal').style.display = 'flex';
    showTab('weapons');
}

function closeInventory() {
    document.getElementById('inventory-modal').style.display = 'none';
}

// 3. インベントリ内のアイテムリスト生成
function showTab(type) {
    const listArea = document.getElementById('item-list-area');
    if (!listArea) return;
    listArea.innerHTML = "";

    const savedData = JSON.parse(localStorage.getItem('hacksla_data') || '{}');
    const inventory = savedData.inventory || { weapons: [], armors: [] };
    const equipped = savedData.equipment || { weapon: null, armor: null };

    const itemIds = inventory[type] || [];

    if (itemIds.length === 0) {
        listArea.innerHTML = `<p style="grid-column: 1/3; color: #888; text-align:center;">なし</p>`;
        return;
    }

    itemIds.forEach((id) => {
        const item = itemData[type][id];
        const isEquipped = (type === 'weapons' && equipped.weapon === id) || 
                           (type === 'armors' && equipped.armor === id);
        
        const card = document.createElement('div');
        card.className = `item-card ${isEquipped ? 'equipped' : ''}`;
        card.innerHTML = `
            <div style="font-weight:bold; color:white;">${item.name}</div>
            <div style="font-size:10px; color:#aaa; margin:5px 0;">
                ${type === 'weapons' ? 'ATK +' + item.atk : 'DEF +' + item.def}
            </div>
            <button onclick="equipItem('${type}', '${id}')" 
                    style="cursor:pointer; width:100%;" 
                    ${isEquipped ? 'disabled' : ''}>
                ${isEquipped ? '装備中' : '装備する'}
            </button>
        `;
        listArea.appendChild(card);
    });
}

// 4. 装備の変更（ここだけ localStorage を更新）
function equipItem(type, id) {
    const savedData = JSON.parse(localStorage.getItem('hacksla_data') || '{}');
    if (!savedData.equipment) savedData.equipment = { weapon: null, armor: null };

    if (type === 'weapons') savedData.equipment.weapon = id;
    if (type === 'armors') savedData.equipment.armor = id;

    localStorage.setItem('hacksla_data', JSON.stringify(savedData));
    
    refreshStatusDisplay(savedData); // 即座に画面に反映
    showTab(type); // リストのボタン状態を更新
}

// --- 初期化 ---
window.onload = function() {
    const savedDataStr = localStorage.getItem('hacksla_data');
    if (savedDataStr) {
        const data = JSON.parse(savedDataStr);
        refreshStatusDisplay(data);
    }

    // 歯車メニュー
    const gearBtn = document.getElementById('gear-button');
    const menuList = document.getElementById('home-menu-list');
    if (gearBtn && menuList) {
        gearBtn.onclick = function() {
            menuList.style.display = (menuList.style.display === "none" || menuList.style.display === "") ? "block" : "none";
        };
    }
};
