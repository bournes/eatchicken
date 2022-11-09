const Utils = require("Utils")
cc.Class({
    extends: cc.Component,

    properties: {
        closeBtnNode: cc.Node,
        sureBtnNode: cc.Node,
        nextUIName: "",
        _popupType: 1,

        titleUI: cc.Label,
        coinSp: cc.Node,
        coinInfo: cc.Node,
        speedSp: cc.Node,
        speedInfo: cc.Node,
        onceClick: {
            default: true,
            visible: false
        }
    },


    onLoad() {
        this.node.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(() => {
            this.closeBtnNode.active = true
        })))
        Tools.scaleUpAndDowm(this.sureBtnNode)
    },
    init(_name, _type) {
        this.nextUIName = _name
        this._popupType = _type
        if (_type == 1) {
            this.titleUI.string = "金币大礼包"
            this.coinSp.active = true
            this.coinInfo.active = true
        } else if (_type == 2) {
            this.titleUI.string = "加速大礼包"
            this.speedSp.active = true
            this.speedInfo.active = true
        }

    },

    sureBtnClick() {
        if (!this.onceClick) return;
        this.onceClick = false
        GameApp.audioManager.playEffect('click')
        var self = this

        if (window.tt) {
            Utils.addVideo("addVideo", function () { //看完了
                self.onceClick = true
                if (self._popupType == 1) {
                    GameApp.uiManager.showToast("获得500金币")
                    GameApp.dataManager.addCoin(500)
                    self.closeBtnClick()
                } else if (self._popupType == 2) {
                    GameApp.uiManager.showToast("获得加速")
                    self.closeBtnClick2(true)
                }

            }, function (_info) { //没看完
                self.onceClick = true
                _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频！")
            })
        } else {
            if (self._popupType == 1) {
                if (window.wx) {
                    GameApp.uiManager.showToast("暂未开放！")
                    self.closeBtnClick()
                    return
                }
                GameApp.uiManager.showToast("福利,获得500金币")
                GameApp.dataManager.addCoin(500)
                self.closeBtnClick()
            } else if (self._popupType == 2) {
                if (window.wx) {
                    GameApp.uiManager.showToast("暂未开放！")
                    self.closeBtnClick2(true)
                    return
                }
                GameApp.uiManager.showToast("福利,获得加速")
                self.closeBtnClick2(true)
            }
        }

    },
    closeBtnClick() {
        if (this._popupType == 1) {
            GameApp.audioManager.playEffect('click')
            GameApp.uiManager.closePopup("GiftPopup")
            GameApp.uiManager.showUI(this.nextUIName)
        } else if (this._popupType == 2) {
            this.closeBtnClick2(false)
        }
    },
    closeBtnClick2(_speedUp) {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.closePopup("GiftPopup")
        GameApp.uiManager.getUI("PrepareUI").getComponent("PrepareUI").showPlaneUI(_speedUp)
    }
});
