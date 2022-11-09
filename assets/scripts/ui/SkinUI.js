const Utils = require("Utils")

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        itemPrefab: cc.Prefab,
        coinUI: cc.Label,
        onceClick: {
            default: true,
            visible: false
        }
    },


    onLoad() {
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_COIN_SHOW, this.updateCoinShow.bind(this))
        this.initData()
        this.updateCoinShow()

    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_COIN_SHOW)
    },
    initData() {
        this.scrollView.content.removeAllChildren()
        var i = 0
        GameApp.dataManager.jsonData.SkinsData.forEach(skinData => {
            this.scheduleOnce(() => {
                var item = cc.instantiate(this.itemPrefab)
                this.scrollView.content.addChild(item)
                item.getComponent("SkinItem").init(skinData)
            }, i += 0.05)
        });
    },
    updateCoinShow() {
        this.coinUI.string = GameApp.dataManager.userData.coinNum
    },
    coinBtnClick() {
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
                GameApp.uiManager.showToast("获得500金币")
                GameApp.dataManager.addCoin(500)
                self.updateCoinShow()
            }, function (_info) { //没看完
                self.onceClick = true
                _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频！")
            })
        } else {
            self.onceClick = true
            GameApp.uiManager.showToast("非真机,获得500金币")
            GameApp.dataManager.addCoin(500)
            self.updateCoinShow()
        }

    },
    backBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI('LoginUI')
    },

});
