// extra_monsters.js
const extraMonsterData = {
    // 隠しステージ６
    6: { 
        name: "裏・はじまりの地", 
        color: "#000", 
        potionDropRate: 5, 
        equipDropRate: 30, 
        enemies: [
            { name: "呪われた忍者くん", exp: 800, hp: 2000, damage: 200, def: 80, sprite: "extra/sorasaku05.png", speed: 800 },
            { name: "ディンジャー", exp: 800, hp: 2000, damage: 200, def: 80, sprite: "extra/sorasaku06.png", speed: 800 }
        ], 
        boss: { 
            name: "異界の支配者", exp: 10000, hp: 12000, damage: 400, def: 200, sprite: "extra/sorasaku07.png", speed: 1500 
        } 
    },

    // 隠しステージ７
    7: { 
        name: "黒雷の草原", 
        color: "#000", 
        potionDropRate: 5, 
        equipDropRate: 30, 
        enemies: [
            { name: "血ぞめのマミー", exp: 800, hp: 2000, damage: 200, def: 80, sprite: "extra/sorasaku08.png", speed: 800 },
            { name: "血ぞめのシャイムチュイド", exp: 800, hp: 2000, damage: 200, def: 80, sprite: "extra/sorasaku09.png", speed: 800 }
        ], 
        boss: { 
            name: "最恐タッグ", exp: 10000, hp: 15000, damage: 500, def: 200, sprite: "extra/sorasaku11.png", speed: 1500 
        } 
    },

    // ラストステージ
    8: { 
        name: "深淵なる闇", 
        color: "#000", 
        boss: { 
            name: "異界の支配者", exp: 10000, hp: 30000, damage: 500, def: 200, sprite: "extra/sorasaku10.png", speed: 1500 
        } 
    }
    
};
