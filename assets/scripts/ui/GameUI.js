const Utils = require("Utils")
cc.Class({
    extends: cc.Component,

    properties: {
        joystick: {
            default: null,
            type: cc.Node,
            tooltip: '摇杆的脚本'
        },
        btnArr: {
            default: [],
            type: [cc.Node],
        },
        soundNode: cc.Node,
        gameUIPanel: cc.Node,
        shootBtn: cc.Node,
        reloadBtnNode: cc.Node,
        amoUI: cc.Label,
        allRoleNumUI: cc.Label,
        weaponBtnNode: cc.Node,
        mipmapNode: cc.Node,

        prepareTopNode: cc.Node,
        // readActSp: cc.SpriteFrame,
        countDownSpGroup: [cc.SpriteFrame],
        rankGroup: [cc.Node],
        _shootFlag: false,
        _shootTimer: 0,
        _reloadFlag: false,
        _reloadTimer: 0,

        _theGameBegin: false,
        _protectTimeCountDown: 8,
        _onceCountDownAnim: false,
        _onceGasCountDownAnim: false,
        gasNodeUI: cc.Node,
        safeNode: cc.Node,
        gasNode: cc.Node,
        boomNode: cc.Node,
        _gasState: 0,//0是不动圈,不现时。1是画圈,倒计时。2是缩圈,提示字。
        _gasCountDownTimer: 40,
        _gasCountDownInterval: 20,
        safeCircle: 150,
        _boxCountDownTimer: 20,
        _boxCountDownInterval: 50,
        _dropTime: 0,
        _boomCountDownTimer: 30,
        _boomCountDownInterval: 50,
        tipNode: cc.Node,
        flashBtn: cc.Node,
        flashCDUI: cc.Label,
        healthBtn: cc.Node,
        healthCDUI: cc.Label,
        _flashTimer: 0,
        _flashInCD: false,
        _healthTimer: 0,
        _healthInCD: false,

        mipNode: cc.Node,
        _mipBoxGroup: [],
        boxAttrNodeGroup: [cc.Node],
        equipAttrNodeGroup: [cc.Node],
    },

    onLoad() {
        this._gasState = 0
        this._gasCountDownTimer = 40
        this._gasCountDownInterval = 20
        this.safeCircle = 150
        this._boxCountDownTimer = 20
        this._boxCountDownInterval = 50

        this._boomCountDownTimer = 30
        this._boomCountDownInterval = 50

        GameApp.eventManager.on(EventNames.EVENT_UPDATE_AMO_SHOW, this.updateAmoShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_SHOW_GUN_UI, this.updateGunUIShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_SHOW_RELOAD_UI, this.updateReloadUIShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_SHOW_ALLROLENUM_UI, this.updateAllRoleNumUIShow.bind(this))

        GameApp.eventManager.on(EventNames.EVENT_GAME_BEGIN, this.gameBegin.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_MIPMAP_PLAYER, this.updateMipmapPlayer.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_RANK_SHOW, this.updateRankShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_NOTYFY_BOX_DISMISS, this.notifyBoxDismiss.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_NOTYFY_BOOM_DISMISS, this.notifyBoomDismiss.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_SHOW_BOXITEM, this.showBoxItemUI.bind(this))
        this.shootBtn.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.shootBtn.on(cc.Node.EventType.TOUCH_END, this.onTouchLeave, this);
        this.shootBtn.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchLeave, this);
        this.weaponBtnNode.children[0].runAction(cc.rotateBy(0.2, 90).repeatForever())
        if (GameApp.dataManager.userData.isFirstPlay) {
            this.tipNode.active = true
            this.tipNode.children[0].runAction(cc.sequence(cc.moveTo(0.5, cc.v2(0, 10)), cc.moveTo(0.5, cc.v2(0, -10))).repeatForever())
        }
        this.updateSoundBtnShow()
    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_AMO_SHOW)
        GameApp.eventManager.removeListener(EventNames.EVENT_SHOW_GUN_UI)
        GameApp.eventManager.removeListener(EventNames.EVENT_SHOW_RELOAD_UI)
        GameApp.eventManager.removeListener(EventNames.EVENT_SHOW_ALLROLENUM_UI)

        GameApp.eventManager.removeListener(EventNames.EVENT_GAME_BEGIN)
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_MIPMAP_PLAYER)
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_RANK_SHOW)
        GameApp.eventManager.removeListener(EventNames.EVENT_NOTYFY_BOX_DISMISS)
        GameApp.eventManager.removeListener(EventNames.EVENT_NOTYFY_BOOM_DISMISS)
        GameApp.eventManager.removeListener(EventNames.EVENT_SHOW_BOXITEM)

    },
    init(_chooseType, _bili, _speedUpJump) {
        GameApp.uiManager.showGame('GameMap', (node) => {
            node.getComponent("GameMap").init(_chooseType, _bili, _speedUpJump)
        })
        GameApp.uiManager.showToast("落地后请尽快寻找枪械")

    },

    gameBegin() {
        this._theGameBegin = true
        this.gameUIPanel.active = true
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
        this.gasCountDown(dt)
        this.boxCountDown(dt)
        this.boomCountDown(dt)
        this.duleFlash(dt)
        this.duleHealth(dt)

        if (!this._theGameBegin) return
        this.protectCcountDown(dt)
    },
    duleFlash(dt) {
        this._flashTimer -= dt
        if (this._flashTimer < 0) {
            this._flashInCD = false
            this.flashBtn.children[0].active = true
            this.flashBtn.children[1].active = false
        }
        if (this._flashInCD) {
            this.flashCDUI.string = Math.floor(this._flashTimer)
        } else {
            this.flashCDUI.string = ""
        }
    },
    duleHealth(dt) {
        this._healthTimer -= dt
        if (this._healthTimer < 0) {
            this._healthInCD = false
            this.healthBtn.children[0].active = true
            this.healthBtn.children[1].active = false
        }
        if (this._healthInCD) {
            this.healthCDUI.string = Math.floor(this._healthTimer)
        } else {
            this.healthCDUI.string = ""
        }
    },
    protectCcountDown(dt) {
        this._protectTimeCountDown -= dt
        if (this._protectTimeCountDown < 6) {
            this.prepareTopNode.children[1].active = true
            this.protectCcountDownAnim()
            this.prepareTopNode.children[1].getComponent(cc.Sprite).spriteFrame = this.countDownSpGroup[Math.floor(this._protectTimeCountDown - 1)]
        }
        if (Math.floor(this._protectTimeCountDown) <= 0) {
            GameApp.eventManager.emit(EventNames.EVENT_THEGAMESTART)
            this.prepareTopNode.active = false
            this._theGameBegin = false
        }
    },
    protectCcountDownAnim() {
        if (this._onceCountDownAnim) return
        this._onceCountDownAnim = true
        GameApp.audioManager.playEffect('waitSceneCutDown')
        var seq = cc.sequence(cc.scaleTo(0.2, 1.5), cc.scaleTo(0.3, 1), cc.delayTime(0.5), cc.callFunc(() => {
            this._onceCountDownAnim = false
        }))
        this.prepareTopNode.children[1].runAction(seq)
    },
    gasCountDown(dt) {
        this._gasCountDownTimer -= dt
        //0是不动圈,不现时。1是画圈,倒计时。2是缩圈,提示字。
        switch (this._gasState) {
            case 0: this.quietGasState(); break;
            case 1: this.refreshCircleAndCD(dt); break;
            case 2: this.reduceCircleAndTip(dt); break;
        }
    },

    quietGasState() {
        if (this._gasCountDownTimer < 16) {
            this.gasNodeUI.children[0].active = true
            this.gasNodeUI.children[1].active = true
            this.gasNodeUI.children[2].active = false
            this.gasNodeUI.children[3].getComponent(cc.RichText).string = "毒气倒计时"
            this.gasNodeUI.active = true
            this.safeNode.children[0].active = true
            this.safeNode.children[0].width = this.safeNode.children[0].height = this.safeCircle + 5
            var theWidth = this.gasNode.width
            if (theWidth == 300) {
                theWidth = 204
            }
            if (this.safeCircle == 0) {
                this.safeNode.setPosition(this.gasNode.position)
            } else {
                this.safeNode.setPosition(Tools.pointOfRandom(this.safeNode.position, theWidth / 2, this.safeCircle / 2))
            }
            this.safeNode.width = this.safeNode.height = this.safeCircle
            GameApp.audioManager.playEffect('gasAlert')
            GameApp.audioManager.playEffect('noticeGasComing')
            this.safeNode.children[0].runAction(cc.sequence(cc.spawn(cc.scaleTo(0, 1), cc.fadeIn(0)), cc.spawn(cc.scaleTo(1, 1.3), cc.fadeOut(1))).repeat(2))
            this._gasState = 1
            // GameApp.eventManager.emit(EventNames.EVENT_UPDATE_GAS_SHOW, 1, this.safeCircle)
        }
    },
    refreshCircleAndCD(dt) {
        this.gasNodeUI.children[0].getComponent(cc.RichText).string = Math.floor(this._gasCountDownTimer) + "秒"
        if (this._gasCountDownTimer < 0) {

            this.gasNodeUI.children[0].active = false
            this.gasNodeUI.children[1].active = false
            this.gasNodeUI.children[2].active = true
            this.gasNodeUI.children[3].getComponent(cc.RichText).string = "<color=#0fffff>毒气正在扩散</color>"
            GameApp.audioManager.playEffect('noticeGasDiffusion')
            this.gasNodeUI.children[2].runAction(cc.sequence(cc.fadeOut(0.3), cc.fadeIn(0.5)).repeatForever())
            this._gasState = 2

            GameApp.eventManager.emit(EventNames.EVENT_UPDATE_GAS_SHOW, 2, { safeCircle: this.safeCircle, safePosition: this.safeNode.position })

        }
    },
    reduceCircleAndTip(dt) {
        if (this.safeCircle < 0) {
            return
        }
        if (this.gasNode.width <= this.safeCircle) {
            this._gasCountDownTimer = this._gasCountDownInterval
            this.gasNode.width = this.gasNode.height = this.safeCircle
            this.safeCircle -= 50
            this.gasNodeUI.active = false
            if (this.safeCircle < 0) {
                GameApp.audioManager.playEffect('noticeGasNoWay')
                return
            }
            this._gasState = 0
            return
        }
        this.gasNode.width -= dt * 10
        this.gasNode.height -= dt * 10
        if (this.safeCircle == 0) return
        if (!Tools.isIntersect(this.gasNode.position, this.gasNode.width / 2, this.safeNode.position, this.safeCircle / 2)) {

        } else {
            if (Math.abs(this.gasNode.width - this.safeCircle) > 0.05)  //外圈和内圈圆心重合,半径相同
            {
                // k = y/x
                // y = kx
                // x^2+y^2 = 1
                // x^2 = 1/(k^2+1)
                var k = (this.gasNode.y - this.safeNode.y) / (this.gasNode.x - this.safeNode.x);

                var x_off = dt * 10 * parseFloat(Math.sqrt(1 / (k * k + 1)))

                // 通过mPoint_outer和mPoint_inner的x坐标来判断此时外圆圆心要移动的是该 + x_off（x轴偏移量）还是 -x_off
                this.gasNode.x += 1 * (this.gasNode.x < this.safeNode.x ? 1 : -1) * x_off;
                // 知道变化后的外圈圆心的x坐标，和直线方程来求对应的y坐标
                this.gasNode.y = k * (this.gasNode.x - this.safeNode.x) + this.safeNode.y;

            }
        }
    },
    boxCountDown(dt) {
        if (this._dropTime >= 2) return;
        this._boxCountDownTimer -= dt
        if (this._boxCountDownTimer < 0) {
            this._boxCountDownTimer = this._boxCountDownInterval
            this.dropBox()
        }
    },
    boomCountDown(dt) {
        if (this._dropTime >= 2) return;
        this._boomCountDownTimer -= dt
        if (this._boomCountDownTimer < 0) {
            this._boomCountDownTimer = this._boomCountDownInterval
            this.dropBoom()
        }
    },
    dropBox() {
        GameApp.audioManager.playEffect('noticeExpShow')
        var theNumArr = [10, 6, 3, 2]
        for (let i = 0; i < theNumArr[this._dropTime]; i++) {
            GameApp.uiManager.showGameObject("MipBox", (node) => {
                this._mipBoxGroup.push(node)
                var thePos = Tools.pointOfRandom(this.safeNode.position, this.safeCircle / 2, 0)
                node.setPosition(thePos)
                let paramPos = this.mipNode.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0.5, 0.5)))
                GameApp.eventManager.emit(EventNames.EVENT_DROP_BOX, paramPos, this._dropTime + "" + i)
                node.children[0].runAction(cc.sequence(cc.scaleTo(1, 4), cc.scaleTo(0, 1), cc.fadeOut(0)).repeat(2))
                // node.getComponent("DropBox").init()
            }, this.mipNode)
        }
        this._dropTime++
        // GameApp.eventManager.emit(EventNames.EVENT_DROP_BOX, this.safeCircle)
    },
    dropBoom() {
        if (this.safeCircle <= 0) return
        GameApp.audioManager.playEffect('noticeBoomComing')
        this.boomNode.active = true
        this.boomNode.setPosition(Tools.pointOfRandom(this.safeNode.position, this.safeCircle / 2, this.boomNode.width / 2))
        GameApp.eventManager.emit(EventNames.EVENT_DROP_BOOM, this.mipNode.convertToNodeSpaceAR(this.boomNode.convertToWorldSpaceAR(cc.v2(0.5, 0.5))), this.boomNode.width)
    },
    notifyBoxDismiss(_index) {
        this._mipBoxGroup[parseInt(_index)].destroy()
    },
    notifyBoomDismiss(_index) {
        this.boomNode.active = false
    },
    showBoxItemUI() {
        this.boxAttrNodeGroup.forEach(element => {
            element.active = false
        });
        var arr = [0, 1, 2, 3]
        var randNum = Tools.randomNum(3, 4)
        var randArr = Tools.getRandomAmountElementUnRepeat(arr, randNum).nodeArr
        // console.log(randArr)
        randArr.forEach(element => {
            var _rank = GameApp.dataManager.globalData.getItemAttrArr[element].rank
            if (_rank == 3) {
                // console.log(element + "号关闭了")
                this.boxAttrNodeGroup[element].active = false
            } else {
                var param = {
                    rank: _rank + 1,
                    item: ItemAttr[element][_rank],
                }
                this.boxAttrNodeGroup[element].children[0].getComponent(cc.Label).string = param.rank + "级"
                this.boxAttrNodeGroup[element].children[1].getComponent(cc.Label).string = param.item.des
                this.boxAttrNodeGroup[element].children[2].runAction(cc.rotateBy(0.2, 90).repeatForever())
                this.boxAttrNodeGroup[element].active = true
                // console.log(element + "号打开了")
            }
        });
    },
    boxItemUIBtnClick(eventTouch, customEventData) {
        var _selectIndex = parseInt(customEventData) - 1
        // console.log("选择了" + _selectIndex + "号装备")
        GameApp.dataManager.equipBoxItem(_selectIndex)
        this.boxAttrNodeGroup.forEach(element => {
            element.active = false
        });
        this.updateEquipShowUI()
    },
    updateEquipShowUI() {
        var arr = GameApp.dataManager.getEquipShowAttr()
        for (var i in this.equipAttrNodeGroup) {
            if (arr[i] == null) {
                this.equipAttrNodeGroup[i].active = false
            } else {
                this.equipAttrNodeGroup[i].children[0].getComponent(cc.Label).string = arr[i].rank + "级"
                this.equipAttrNodeGroup[i].children[1].getComponent(cc.Label).string = arr[i].item.des
                this.equipAttrNodeGroup[i].active = true
            }
        }
    },
    // gasCountDownAnim() {
    //     if (this._onceGasCountDownAnim) return
    //     this._onceGasCountDownAnim = true

    // },
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
            this.weaponBtnNode.getComponent(cc.Sprite).spriteFrame = GameApp.uiManager.commonAtlas.getSpriteFrame("ui_weapon_" + _gunData.weaponid)
            this.weaponBtnNode.children[1].children[0].getComponent(cc.Label).string = _gunData.name
        }
        this.weaponBtnNode.active = event
    },
    updateReloadUIShow(event) {
        this.reloadBtnNode.active = event
    },
    updateAllRoleNumUIShow() {
        var theRank = GameApp.dataManager.globalData.allRoleArr.length
        if (theRank == 1) {
            var theRole = GameApp.dataManager.globalData.allRoleArr[0]
            if (theRole._pbc.tag == Tags.player) {
                GameApp.uiManager.getPopup("OverPopup") == null && GameApp.uiManager.showPopup("OverPopup", (node) => {
                    node.getComponent("OverPopup").init(true, theRank)
                })
            }
        }
        this.allRoleNumUI.string = theRank + "人存活"
    },
    updateMipmapPlayer(event) {
        this.mipmapNode.children[2].setPosition(event)
    },
    updateMipmapBox(event) {

    },
    updateRankShow() {
        var theArr = GameApp.dataManager.globalData.inGameKillNum.concat()
        theArr.sort((a, b) => b._killNum - a._killNum)
        for (let i = 0; i < 5; i++) {
            var theName = theArr[i]._belongName
            if (theName == GameApp.dataManager.userData.playerName) {
                theName = "<color=#0fffff>" + theArr[i]._belongName + "</color>"
            }
            this.rankGroup[i].children[0].getComponent(cc.RichText).string = theName
            this.rankGroup[i].children[1].getComponent(cc.Label).string = theArr[i]._killNum
        }
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
    flashBtnClick() {
        if (this._flashInCD) {
            GameApp.uiManager.showToast("技能正在冷却中")
        } else {
            this.tipNode.active = false
            GameApp.eventManager.emit(EventNames.EVENT_FLASH)
            this.flashBtn.children[0].active = false
            this.flashBtn.children[1].active = true
            this._flashTimer = GameApp.dataManager.getSkillCD()
            this._flashInCD = true
        }
    },
    healthBtnClick() {
        GameApp.audioManager.playEffect('click')
        if (this._healthInCD) {
            GameApp.uiManager.showToast("技能正在冷却中")
        } else {
            GameApp.eventManager.emit(EventNames.EVENT_RESUME_HEALTH)
            this.healthBtn.children[0].active = false
            this.healthBtn.children[1].active = true
            this._healthTimer = GameApp.dataManager.getSkillCD()
            this._healthInCD = true
        }
    },
    backBtnClick() {
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
    updateRecordBtnShow() {
        this.btnArr[0].active = (GameApp.dataManager.globalData.recordState == RecordState.RECORD)
        this.btnArr[1].active = (GameApp.dataManager.globalData.recordState == RecordState.PAUSE || GameApp.dataManager.globalData.recordState == RecordState.READY)
    },
    recordBtnClick() {
        GameApp.audioManager.playEffect('click')
        let self = this
        switch (GameApp.dataManager.globalData.recordState) {
            case RecordState.RECORD: Utils.pauseRecord(function () {
                GameApp.dataManager.changeRecordState(RecordState.PAUSE)
                self.updateRecordBtnShow()
            }); break;
            case RecordState.PAUSE: Utils.resumeRecord(function () {
                GameApp.dataManager.changeRecordState(RecordState.RECORD)
                self.updateRecordBtnShow()
            }); break;
            //预备bug情况
            case RecordState.READY: console.log("录屏bug了"); break;
        }
    }
    // update (dt) {},
});
