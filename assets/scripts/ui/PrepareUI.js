
cc.Class({
    extends: cc.Component,

    properties: {
        joystick: {
            default: null,
            type: cc.Node,
            tooltip: '摇杆的脚本'
        },
        soundNode: cc.Node,
        shootBtn: cc.Node,
        reloadBtnNode: cc.Node,
        amoUI: cc.Label,
        allRoleNumUI: cc.Label,
        weaponBtnNode: cc.Node,
        prepareTopNode: cc.Node,
        countDownSpGroup: [cc.SpriteFrame],

        _shootFlag: false,
        _shootTimer: 0,
        _reloadFlag: false,
        _reloadTimer: 0,

        _timeCountDown: 20,
        _onceCountDownAnim: false,
        _onceExecute: true,
    },

    onLoad() {
        GameApp.dataManager.globalData.isInGame = false
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_AMO_SHOW, this.updateAmoShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_SHOW_GUN_UI, this.updateGunUIShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_SHOW_RELOAD_UI, this.updateReloadUIShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_SHOW_ALLROLENUM_UI, this.updateAllRoleNumUIShow.bind(this))
        this.shootBtn.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.shootBtn.on(cc.Node.EventType.TOUCH_END, this.onTouchLeave, this);
        this.shootBtn.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchLeave, this);
        GameApp.uiManager.showGame('PrepareMap')
        this.weaponBtnNode.children[0].runAction(cc.rotateBy(0.2, 90).repeatForever())
        this.prepareTopNode.children[0].runAction(cc.sequence(cc.callFunc(() => {
            this.prepareTopNode.children[0].children[0].active = true
        }), cc.delayTime(0.4), cc.callFunc(() => {
            this.prepareTopNode.children[0].children[1].active = true
        }), cc.delayTime(0.4), cc.callFunc(() => {
            this.prepareTopNode.children[0].children[2].active = true
        }), cc.delayTime(0.4), cc.callFunc(() => {
            this.prepareTopNode.children[0].children[0].active = false
            this.prepareTopNode.children[0].children[1].active = false
            this.prepareTopNode.children[0].children[2].active = false
        }), cc.delayTime(0.4)).repeatForever())
        this._timeCountDown = 20

        GameApp.dataManager.globalData.inGameKillNum.push({
            _killNum: 0,
            _belongName: GameApp.dataManager.userData.playerName
        })
        this.updateSoundBtnShow()
    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_AMO_SHOW)
        GameApp.eventManager.removeListener(EventNames.EVENT_SHOW_GUN_UI)
        GameApp.eventManager.removeListener(EventNames.EVENT_SHOW_RELOAD_UI)
        GameApp.eventManager.removeListener(EventNames.EVENT_SHOW_ALLROLENUM_UI)

    },
    update(dt) {
        this._shootTimer -= dt
        if (this._shootFlag && this._shootTimer < 0 && !this._reloadFlag) {
            this._shootTimer = GameApp.dataManager.globalData.shootInterval
            this.shoot()
        }
        if (this._reloadFlag) {
            this._reloadTimer -= dt
            if (this._reloadFlag && this._reloadTimer < 0) {
                this._reloadFlag = false
                GameApp.dataManager.reloadAmo()
            }
        }

        this._timeCountDown -= dt
        if (this._timeCountDown < 6) {
            this.prepareTopNode.children[0].active = false
            this.prepareTopNode.children[1].active = true
            this.prepareTopNode.children[2].active = true
            this.countDownAnim()
            this.prepareTopNode.children[2].getComponent(cc.Sprite).spriteFrame = this.countDownSpGroup[Math.floor(this._timeCountDown - 1)]
        }
        if (Math.floor(this._timeCountDown) <= 0) {
            if (!this._onceExecute) return
            this._onceExecute = false
            GameApp.uiManager.showPopup('GiftPopup', (node) => {
                node.getComponent("GiftPopup").init("GameUI", 2)
            })

        }
    },
    showPlaneUI(_speedUp) {
        GameApp.uiManager.showUI('PlaneUI', (node) => {
            node.getComponent('PlaneUI').init(_speedUp)
        })
    },
    countDownAnim() {
        if (this._onceCountDownAnim) return
        this._onceCountDownAnim = true
        cc.log("播放了")
        GameApp.audioManager.playEffect('waitSceneCutDown')
        var seq = cc.sequence(cc.scaleTo(0.2, 1.5), cc.scaleTo(0.3, 1), cc.delayTime(0.5), cc.callFunc(() => {
            this._onceCountDownAnim = false
        }))
        this.prepareTopNode.children[2].runAction(seq)
    },
    onTouchBegin(event) {
        this._shootFlag = true

    },
    onTouchLeave(event) {
        this._shootFlag = false
        GameApp.eventManager.emit(EventNames.EVENT_AIM, false)
    },
    shoot() {
        GameApp.eventManager.emit(EventNames.EVENT_AIM, true)
        GameApp.eventManager.emit(EventNames.EVENT_PLAYER_SHOOT)
    },
    updateAmoShow() {
        this.amoUI.string = GameApp.dataManager.globalData.curAmoNum
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_TOPBAR_SHOW)
    },
    updateGunUIShow(event, _gunData) {
        if (_gunData) {
            console.log(_gunData)
            this.weaponBtnNode.getComponent(cc.Sprite).spriteFrame = GameApp.uiManager.commonAtlas.getSpriteFrame("ui_weapon_" + _gunData.weaponid)
            this.weaponBtnNode.children[1].children[0].getComponent(cc.Label).string = _gunData.name
        }
        this.weaponBtnNode.active = event
        if (event) {
            this.weaponBtnNode.scaleX = 0
            this.weaponBtnNode.scaleY = 0
            this.weaponBtnNode.runAction(cc.scaleTo(0.3, 1).easing(cc.easeBackOut()))
        }
    },
    updateReloadUIShow(event) {
        this.reloadBtnNode.active = event
    },
    updateAllRoleNumUIShow() {
        this.allRoleNumUI.string = GameApp.dataManager.globalData.allRoleArr.length
    },
    reloadBtnClick() {
        GameApp.audioManager.playEffect('click')
        if (this._reloadFlag) return;
        this._reloadTimer = GameApp.dataManager.globalData.reloadInterval
        this._reloadFlag = true
        GameApp.eventManager.emit(EventNames.EVENT_PLAYER_RELOAD)
    },
    weaponBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.eventManager.emit(EventNames.EVENT_PICKUP_WEAPON)
    },
    backBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI('LoginUI')
    },
    soundBtnClick() {
        GameApp.audioManager.playEffect('click')
        var onoff = !GameApp.audioManager._effectOn
        GameApp.audioManager.setEffect(onoff)
        // GameApp.audioManager.setEffect(onoff)
        this.updateSoundBtnShow()
    },
    updateSoundBtnShow() {
        this.soundNode.children[0].active = GameApp.audioManager._effectOn
        this.soundNode.children[1].active = !GameApp.audioManager._effectOn
    },
    // update (dt) {},
});
