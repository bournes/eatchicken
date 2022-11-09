const Utils = require("Utils")
cc.Class({
    extends: cc.Component,

    properties: {
        winTitle: cc.Node,
        winSprite: cc.Node,
        loseTitle: cc.Node,
        nameUI: cc.Label,
        rankUI: cc.Label,
        killUI: cc.Label,
        allRewardUI: cc.Label,
        rankRewardUI: cc.Label,
        killRewardUI: cc.Label,
        rewardBtnNode: cc.Button,
        homeBtnNode: cc.Node,
        onceClick: {
            default: true,
            visible: false
        },
        clickedShare: {
            default: false,
            visible: false
        },
    },


    onLoad() {
        // Utils.addInsertAd("addInsertAd")
        this.node.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(() => {
            this.homeBtnNode.active = true
        })))
        Tools.scaleUpAndDowm(this.rewardBtnNode.node)
    },
    init(_isWin, rank) {
        if (_isWin) {
            rank = 1
            this.winTitle.active = true
            this.winSprite.active = true
            GameApp.dataManager.userData.winNum++
            GameApp.dataManager.addActivityNum(2, 1)
        } else {
            this.loseTitle.active = true
            GameApp.dataManager.userData.alDieNum++
        }
        if (rank <= 5) {
            GameApp.dataManager.userData.top5Num++
        }

        this.nameUI.string = GameApp.dataManager.userData.playerName
        this.rankUI.string = rank
        var killNum = GameApp.dataManager.globalData.inGameKillNum[0]._killNum

        GameApp.dataManager.userData.allKillNum += killNum

        this.killUI.string = killNum
        var rankCoin = (30 - rank) * 50
        var killCoin = 100 * killNum
        var allCoin = rankCoin + killCoin
        this.allRewardUI.string = allCoin
        this.rankRewardUI.string = rankCoin
        this.killRewardUI.string = killCoin

        GameApp.dataManager.userData.allPlayNum++
        GameApp.dataManager.userData.winRate = (GameApp.dataManager.userData.winNum / GameApp.dataManager.userData.allPlayNum).toFixed(2)
        GameApp.dataManager.userData.kd = (GameApp.dataManager.userData.allKillNum / (GameApp.dataManager.userData.alDieNum == 0 ? 1 : GameApp.dataManager.userData.alDieNum)).toFixed(2)
        GameApp.dataManager.userData.avgRank = parseInt((GameApp.dataManager.userData.avgRank + rank) / GameApp.dataManager.userData.allPlayNum)
        GameApp.dataManager.userData.mostKill = killNum > GameApp.dataManager.userData.mostKill ? killNum : GameApp.dataManager.userData.mostKill
        GameApp.dataManager.userData.avgLifeTime = parseInt((GameApp.dataManager.userData.avgLifeTime + GameApp.dataManager.globalData.lifeTime) / GameApp.dataManager.userData.allPlayNum)
        GameApp.dataManager.addCoin(allCoin)
    },
    homeBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI("LoginUI")
    },
    rewardBtnClick() {
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
                    var getNum = Tools.randomNum(100, 1000)
                    GameApp.dataManager.addCoin(getNum)
                    node.getComponent('OpenBoxPopup').init(GameApp.uiManager.boxSkinDataGroup[1], 1, getNum)
                    self.onceClick = true
                    self.rewardBtnNode.interactable = false
                }, false)
            }, function (_info) { //没看完
                self.onceClick = true
                _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频！")
            })
        } else {
            self.onceClick = true
            GameApp.dataManager.addPlayedVideoNum()
            GameApp.uiManager.showPopup('OpenBoxPopup', (node) => {
                var getNum = Tools.randomNum(100, 1000)
                GameApp.dataManager.addCoin(getNum)
                node.getComponent('OpenBoxPopup').init(GameApp.uiManager.boxSkinDataGroup[1], 1, getNum)
                self.onceClick = true
                self.rewardBtnNode.interactable = false
            }, false)
        }
    },
    recordBtnClick() {
        if (!this.onceClick) return
        this.onceClick = false
        var self = this
        GameApp.audioManager.playEffect('click')
        if (this.clickedShare) {
            Utils.shareRecord(GameApp.dataManager.globalData.recordPath, function () {
                // GameApp.dataManager.changeRecordState(RecordState.RECORD)
                self.onceClick = true
                console.log("分享完成了")
            }, function () {
                self.onceClick = true
                console.log("分享失败了")
            })
            GameApp.dataManager.changeRecordState(RecordState.READY)
            return;
        }
        if (GameApp.dataManager.globalData.recordTimer < 3) {
            self.onceClick = true
            GameApp.uiManager.showToast("录屏时间小于3秒!")
            // console.log("请过一会儿再分享")
            return;
        } else {
            console.log("结束了")
            var self = this
            Utils.stopRecord(function (res) {
                if (res != null) {
                    GameApp.dataManager.globalData.recordPath = res.videoPath
                }
                self.clickedShare = true
                GameApp.dataManager.changeRecordState(RecordState.READY)
                Utils.shareRecord(GameApp.dataManager.globalData.recordPath, function () {
                    // GameApp.dataManager.changeRecordState(RecordState.RECORD)
                    self.onceClick = true
                    console.log("分享完成了")
                }, function () {
                    self.onceClick = true
                    console.log("分享失败了")
                })

            })

        }
    },
});
