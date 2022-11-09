const Utils = require("Utils")

cc.Class({
    extends: cc.Component,

    properties: {
        actorAnim: sp.Skeleton,
        nameUI: cc.Label,
        descUI: cc.Label,
        skinData: {
            default: {}
        },
        methodUIGroup: [cc.Node],
        methodBtnGroup: [cc.Node],
        onceClick: {
            default: true,
            visible: false
        }
    },

    onLoad() {
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_SHOP_CHOOSED_SHOW, this.updateUnLockShow)
    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_SHOP_CHOOSED_SHOW, this.updateUnLockShow)
    },

    // update (dt) {},

    init(_skinData) {
        this.skinData = _skinData
        this.initNameShow()
        this.initSkinShow()
        this.updateMethodShow()
    },
    initNameShow() {
        this.nameUI.string = this.skinData.name
        var colorIndex = Math.floor((this.skinData.skinid - 1) / 5)
        this.nameUI.node.color = new cc.Color().fromHEX(NameColor[colorIndex]);

        this.descUI.string = this.skinData.des
    },
    initSkinShow() {
        if (this.skinData.skinid < 21) {
            this.actorAnim.skeletonData = GameApp.uiManager.normalSkinData
            this.actorAnim.setSkin(this.skinData.skinname)
        } else {
            this.actorAnim.skeletonData = GameApp.uiManager.advanceSkinDataGroup[this.skinData.skinid - 21]
        }
        if (this.skinData.skinid < 21) {
            this.actorAnim.setAnimation(0, 'await', true)
        } else {
            this.actorAnim.setAnimation(0, 'await_main_1', false)
            this.actorAnim.setCompleteListener(() => {
                this.actorAnim.setAnimation(0, 'await_main_' + Tools.randomNum(1, 3), false)
            })
        }
    },
    updateMethodShow() {

        if (this.skinData.skinid > 25) {
            this.methodUIGroup[2].children[0].getComponent(cc.Label).string = GameApp.dataManager.userData.havePieceNum[this.skinData.skinid] + '/' + this.skinData.needpiece
            this.setpieceIcon(this.skinData.skinid)
        }

        this.updateUnLockShow(this)
    },
    updateUnLockShow(self) {
        self.methodUIGroup[0].active = self.methodBtnGroup[0].active = self.skinData.needcoin
        self.methodUIGroup[1].active = self.methodBtnGroup[1].active = self.skinData.needgem
        self.methodUIGroup[2].active = self.methodBtnGroup[2].active = self.skinData.needpiece
        self.methodBtnGroup[3].active = false
        self.methodUIGroup[0].children[0].getComponent(cc.Label).string = self.skinData.needcoin
        self.methodUIGroup[1].children[0].getComponent(cc.Label).string = GameApp.dataManager.userData.playedVideoNum + '/' + self.skinData.needgem

        var unlockarr = GameApp.dataManager.userData.unLockedSkinIdArr.concat()
        unlockarr.sort((a, b) => a - b);
        unlockarr.forEach(element => {
            if (element == self.skinData.skinid) {
                self.methodBtnGroup[0].active = false;
                self.methodBtnGroup[1].active = false;
                self.methodBtnGroup[2].active = false;
                self.methodBtnGroup[3].active = true;
                return;
            }
        });
        self.updateChoosedShow2(self)
    },
    updateChoosedShow2: function (self) {
        if (GameApp.dataManager.getChoosedSkinId() == self.skinData.skinid) {
            self.methodBtnGroup[3].children[0].active = false
            self.methodBtnGroup[3].children[1].active = true
        } else {
            self.methodBtnGroup[3].children[0].active = true
            self.methodBtnGroup[3].children[1].active = false
        }
    },
    setpieceIcon(id) {
        var self = this
        cc.loader.loadRes("texture/skin_piece/card_p_" + id, cc.SpriteFrame, function (err, spriteFrame) {
            self.methodUIGroup[2].getComponent(cc.Sprite).spriteFrame = spriteFrame
        });
    },
    selelctBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.dataManager.setChoosedSkinId(this.skinData.skinid)
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_SHOP_CHOOSED_SHOW, this)
    },
    coinBtnClick() {
        GameApp.audioManager.playEffect('click')
        if (GameApp.dataManager.reduceCoin(this.skinData.needcoin)) {
            GameApp.uiManager.showToast("解锁成功")
            GameApp.dataManager.unLockSkin(this.skinData.skinid)
            GameApp.eventManager.emit(EventNames.EVENT_UPDATE_SHOP_CHOOSED_SHOW, this)
        } else {
            GameApp.uiManager.showToast("金币不足！")
        }
    },
    videoBtnClick() {
        if (window.wx) {
            GameApp.uiManager.showToast("暂未开放！")
            return
        }
        if (!this.onceClick) return;
        this.onceClick = false
        GameApp.audioManager.playEffect('click')
        var self = this

        if (window.tt) {
            Utils.addVideo("addVideo", function () { //看完了
                self.onceClick = true
                GameApp.dataManager.addPlayedVideoNum()
                GameApp.eventManager.emit(EventNames.EVENT_UPDATE_SHOP_CHOOSED_SHOW, self)
            }, function (_info) { //没看完
                self.onceClick = true
                _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频！")
            })
        } else {
            self.onceClick = true
            GameApp.dataManager.addPlayedVideoNum()
            GameApp.eventManager.emit(EventNames.EVENT_UPDATE_SHOP_CHOOSED_SHOW, self)
        }


    },
    pieceBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showToast("碎片不足,请从" + "<color=#faf80d>黄金宝箱</color>" + "获取！")
    },

    onCloseBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.closePopup("SkinInfoPopup")
    },

});
