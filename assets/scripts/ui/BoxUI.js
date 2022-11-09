const Utils = require("Utils")

cc.Class({
    extends: cc.Component,

    properties: {
        coinUI: cc.Label,
        needCoinUI: cc.Label,
        box1CoinRewardUI: cc.Label,
        box2CoinRewardUI: cc.Label,

        onceClick: {
            default: true,
            visible: false
        }
    },
    onLoad() {
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_COIN_SHOW, this.updateUIShow.bind(this))
        this.updateUIShow()
    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_COIN_SHOW)
    },
    updateUIShow() {
        this.coinUI.string = GameApp.dataManager.userData.coinNum
        this.needCoinUI.string = GameApp.dataManager.userData.box1NeedCoinNum
        this.box1CoinRewardUI.string = GameApp.dataManager.userData.box1RewardCoinNum[0] + '~' + GameApp.dataManager.userData.box1RewardCoinNum[1]
        this.box2CoinRewardUI.string = GameApp.dataManager.userData.box2RewardCoinNum[0] + '~' + GameApp.dataManager.userData.box2RewardCoinNum[1]
    },
    oneBtnClick() {
        if (!this.onceClick) return;
        this.onceClick = false
        GameApp.audioManager.playEffect('click')
        if (GameApp.dataManager.reduceCoin(GameApp.dataManager.userData.box1NeedCoinNum)) {
            GameApp.uiManager.showPopup('OpenBoxPopup', (node) => {
                var getNum = Tools.randomNum(GameApp.dataManager.userData.box1RewardCoinNum[0], GameApp.dataManager.userData.box1RewardCoinNum[1])
                GameApp.dataManager.addCoin(getNum)
                node.getComponent('OpenBoxPopup').init(GameApp.uiManager.boxSkinDataGroup[0], 1, getNum)
                if (GameApp.dataManager.userData.box1NeedCoinNum < 6400) {
                    GameApp.dataManager.userData.box1NeedCoinNum *= 2
                    GameApp.dataManager.userData.box1RewardCoinNum[0] = GameApp.dataManager.userData.box1NeedCoinNum / 2
                    GameApp.dataManager.userData.box1RewardCoinNum[1] = GameApp.dataManager.userData.box1NeedCoinNum * 1.5
                }
                this.updateUIShow()
                this.onceClick = true
            })
        } else {
            this.onceClick = true
            GameApp.uiManager.showToast("金币不足!")
        }
    },
    twoBtnClick() {
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
                GameApp.uiManager.showPopup('OpenBoxPopup', (node) => {
                    var getNum = Tools.randomNum(GameApp.dataManager.userData.box2RewardCoinNum[0], GameApp.dataManager.userData.box2RewardCoinNum[1])
                    GameApp.dataManager.addCoin(getNum)
                    node.getComponent('OpenBoxPopup').init(GameApp.uiManager.boxSkinDataGroup[1], 1, getNum)
                    if (GameApp.dataManager.userData.box2RewardCoinNum[0] < 1400) {
                        GameApp.dataManager.userData.box2RewardCoinNum[0] = Math.floor(GameApp.dataManager.userData.box2RewardCoinNum[0] * 1.5)
                        GameApp.dataManager.userData.box2RewardCoinNum[1] = Math.floor(GameApp.dataManager.userData.box2RewardCoinNum[1] * 1.5)
                    }
                    self.updateUIShow()
                    self.onceClick = true
                })
            }, function (_info) { //没看完
                self.onceClick = true
                _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频！")
            })
        } else {
            self.onceClick = true
            GameApp.dataManager.addPlayedVideoNum()
            GameApp.uiManager.showPopup('OpenBoxPopup', (node) => {
                var getNum = Tools.randomNum(GameApp.dataManager.userData.box2RewardCoinNum[0], GameApp.dataManager.userData.box2RewardCoinNum[1])
                GameApp.dataManager.addCoin(getNum)
                node.getComponent('OpenBoxPopup').init(GameApp.uiManager.boxSkinDataGroup[1], 1, getNum)
                if (GameApp.dataManager.userData.box2RewardCoinNum[0] < 1400) {
                    GameApp.dataManager.userData.box2RewardCoinNum[0] = Math.floor(GameApp.dataManager.userData.box2RewardCoinNum[0] * 1.5)
                    GameApp.dataManager.userData.box2RewardCoinNum[1] = Math.floor(GameApp.dataManager.userData.box2RewardCoinNum[1] * 1.5)
                }
                self.updateUIShow()
                self.onceClick = true
            })
        }
    },
    threeBtnClick() {
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
                var getIndex = Tools.randomNum(26, 30)
                var getNum = 5
                GameApp.dataManager.addPieceNum(getIndex, getNum)
                GameApp.uiManager.showPopup('OpenBoxPopup', (node) => {
                    node.getComponent('OpenBoxPopup').init(GameApp.uiManager.boxSkinDataGroup[2], 2, getNum, getIndex)
                    self.onceClick = true
                })
            }, function (_info) { //没看完
                self.onceClick = true
                _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频！")
            })
        } else {
            self.onceClick = true
            GameApp.dataManager.addPlayedVideoNum()
            var getIndex = Tools.randomNum(26, 30)
            var getNum = 5
            GameApp.dataManager.addPieceNum(getIndex, getNum)
            GameApp.uiManager.showPopup('OpenBoxPopup', (node) => {
                node.getComponent('OpenBoxPopup').init(GameApp.uiManager.boxSkinDataGroup[2], 2, getNum, getIndex)
                self.onceClick = true
            })
        }

    },

    coinBtnClick() {
        if (!this.onceClick) return;
        this.onceClick = false
        GameApp.audioManager.playEffect('click')
        var self = this

        if (window.tt) {
            Utils.addVideo("addVideo", function () { //看完了
                self.onceClick = true
                GameApp.uiManager.showToast("获得500金币")
                GameApp.dataManager.addCoin(500)
                self.updateUIShow()
            }, function (_info) { //没看完
                self.onceClick = true
                _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频！")
            })
        } else {
            self.onceClick = true
            GameApp.uiManager.showToast("非真机,获得500金币")
            GameApp.dataManager.addCoin(500)
            self.updateUIShow()
        }

    },
    backBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI('LoginUI')
    },
});
