
window.WS_SERVERS = {
    TEST: "ws://192.168.25.242:19999/server", // lf
    INSPECT: "",
    RELEASE: "",
};

const servers = {
    TEST: 'TEST',
    INSPECT: 'INSPECT',
    RELEASE: 'RELEASE',
};

window.SERVER = servers.TEST;
window.VERSION = '1.0.0';
window.NameColor = [
    "#0cf60b",
    "#09b2eb",
    "#fc01fc",
    "#fb7f03",
    "#ec0807",
    "#faf80d"
];

window.Tags = {
    collider: 0,
    player: 1,
    item: 2,
    bullet: 3,
    empty: 4,
    box: 5,
    boom: 6,
    enemy: 10,
    //下面都是enemy

};
//0是武器，1是道具
window.ItemType = {
    weapon: 0,
    item: 1,
};
window.EquipType = {
    damage: 0,
    def: 1,
    speed: 2,
    crit: 3
};
//例子： ItemAttr[a][b].c //a装备种类，b装备等级，c装备属性
window.ItemAttr = [
    [
        {
            attr: 0.1,
            des: "伤害+10%"
        },
        {
            attr: 0.2,
            des: "伤害+20%"
        },
        {
            attr: 0.3,
            des: "伤害+30%"
        }
    ],
    [
        {
            attr: 0.1,
            des: "减伤+10%"
        },
        {
            attr: 0.2,
            des: "减伤+20%"
        },
        {
            attr: 0.3,
            des: "减伤+30%"
        }
    ],
    [
        {
            attr: 0.1,
            des: "移速+10%"
        },
        {
            attr: 0.2,
            des: "移速+20%"
        },
        {
            attr: 0.3,
            des: "移速+30%"
        }
    ],
    [
        {
            attr: 1,
            des: "暴击+10%"
        },
        {
            attr: 2,
            des: "暴击+20%"
        },
        {
            attr: 3,
            des: "暴击+30%"
        }
    ]
];
window.TaskState = {
    Unfinish: 0,
    Canget: 1,
    Got: 2
}
// 客户端自己定义的协议
window.EventNames = {
    EVENT_UPDATE_SHOP_CHOOSED_SHOW: 'EVENT_UPDATE_SHOP_CHOOSED_SHOW',
    EVENT_UPDATE_COIN_SHOW: 'EVENT_UPDATE_COIN_SHOW',
    EVENT_UPDATE_AMO_SHOW: 'EVENT_UPDATE_AMO_SHOW',
    EVENT_PLAYER_SHOOT: 'EVENT_PLAYER_SHOOT',
    EVENT_PLAYER_RELOAD: 'EVENT_PLAYER_RELOAD',
    EVENT_UPDATE_TOPBAR_SHOW: 'EVENT_UPDATE_TOPBAR_SHOW',
    EVENT_SHOW_GUN_UI: 'EVENT_SHOW_GUN_UI',
    EVENT_SHOW_ALLROLENUM_UI: 'EVENT_SHOW_ALLROLENUM_UI',
    EVENT_SHOW_RELOAD_UI: 'EVENT_SHOW_RELOAD_UI',
    EVENT_PICKUP_WEAPON: 'EVENT_PICKUP_WEAPON',
    EVENT_AIM: 'EVENT_AIM',
    EVENT_GAME_BEGIN: 'EVENT_GAME_BEGIN',
    EVENT_UPDATE_MIPMAP_PLAYER: 'EVENT_UPDATE_MIPMAP_PLAYER',
    EVENT_THEGAMESTART: 'EVENT_THEGAMESTART',
    EVENT_UPDATE_RANK_SHOW: 'EVENT_UPDATE_RANK_SHOW',
    EVENT_UPDATE_GAS_SHOW: 'EVENT_UPDATE_GAS_SHOW',
    EVENT_FLASH: 'EVENT_FLASH',
    EVENT_RESUME_HEALTH: 'EVENT_RESUME_HEALTH',
    EVENT_DROP_BOX: 'EVENT_DROP_BOX',
    EVENT_NOTYFY_BOX_DISMISS: 'EVENT_NOTYFY_BOX_DISMISS',
    EVENT_NOTYFY_BOOM_DISMISS: 'EVENT_NOTYFY_BOOM_DISMISS',
    EVENT_SHOW_BOXITEM: 'EVENT_SHOW_BOXITEM',
    EVENT_UPDATE_STAR_SHOW: 'EVENT_UPDATE_STAR_SHOW',
    EVENT_NOTIFY_ENEMY_MAPBOX: 'EVENT_NOTIFY_ENEMY_MAPBOX',
    EVENT_SHOW_ACTIVITYBTN: 'EVENT_SHOW_ACTIVITYBTN'
};








