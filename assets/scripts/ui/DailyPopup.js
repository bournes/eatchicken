const Utils = require("Utils")

cc.Class({
    extends: cc.Component,

    properties: {
        dailyGroup: cc.Node,
        dailyGotNum: {
            default: 0,
            type: cc.number,
            visible: false
        },
        closeBtn: cc.Node,

        onceClick: true
    },

    onLoad() {
        this.dailyGotNum = cc.sys.localStorage.getItem("EatChicken_dailyGotNum")
        if (this.dailyGotNum == null || this.dailyGotNum == undefined || this.dailyGotNum == "") {
            this.dailyGotNum = 0
            cc.sys.localStorage.setItem("EatChicken_dailyGotNum", 0)
        } else {
            this.dailyGotNum = parseInt(this.dailyGotNum)
        }
        this.initShow()

        var show = cc.sequence(cc.delayTime(3), cc.scaleTo(0.3, 1))
        this.closeBtn.runAction(show)
        if (GameApp.dataManager.globalData.curDailyGot) {
            this.dailyGroup.children[this.dailyGotNum - 1].getComponent(cc.Button).interactable = false
            this.dailyGroup.children[this.dailyGotNum - 1].children[0].active = true
        } else {
            this.dailyGroup.children[this.dailyGotNum].children[0].active = true
        }

    },
    initShow() {
        if (this.dailyGotNum > 0) {
            for (var i = 0; i < this.dailyGotNum; i++) {
                this.dailyGroup.children[i].children[1].runAction(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()))
            }
        }
    },
    // sureBtnClick() {
    //     if (!this.onceClick) return
    //     this.onceClick = false
    //     GameApp.audioManager.playEffect('btn_press')

    //     var self = this
    //     if (window.tt) {
    //         Utils.addVideo("addVideo", function () { //看完了
    //             self.onceClick = true
    //             self.getBtn.interactable = false
    //             self.skipBtn.interactable = false
    //             self.getBtn.node.stopAllActions()
    //             GameApp.dataManager.globalData.curDailyGot = true
    //             cc.sys.localStorage.setItem("EatChicken_dailyGotState", true);
    //             self.dailyGroup.children[self.dailyGotNum].children[2].runAction(cc.sequence(cc.scaleTo(0.5, 0.5).easing(cc.easeBackOut()), cc.callFunc(function () {
    //                 var arr1 = [1, 2, 1, 2, 1, 2, 2] //物品表
    //                 var arr2 = [1, 1, 2, 2, 3, 3, 4] //数量表
    //                 if (arr1[self.dailyGotNum] == 1) {
    //                     GameApp.uiManager.showToast("获取 <color=#0fffff>体力x" + arr2[self.dailyGotNum] * 2 + " </color>")
    //                     GameApp.dataManager.addHealthNum(arr2[self.dailyGotNum] * 2)
    //                 } else if (arr1[self.dailyGotNum] == 2) {
    //                     GameApp.uiManager.showToast("获取 <color=#0fffff>提示卡x" + arr2[self.dailyGotNum] * 2 + " </color>")
    //                     GameApp.dataManager.addTipNum(arr2[self.dailyGotNum] * 2)
    //                 }
    //                 self.dailyGotNum++
    //                 if (self.dailyGotNum > 7) {
    //                     self.dailyGotNum = 0
    //                 }
    //                 cc.sys.localStorage.setItem("EatChicken_dailyGotNum", self.dailyGotNum)

    //             }.bind(self), self)))

    //         }, function (_info) { //没看完
    //             self.onceClick = true
    //             _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频")
    //         })
    //     } else {
    //         self.onceClick = true
    //         this.getBtn.interactable = false
    //         this.skipBtn.interactable = false
    //         this.getBtn.node.stopAllActions()
    //         GameApp.dataManager.globalData.curDailyGot = true
    //         cc.sys.localStorage.setItem("EatChicken_dailyGotState", true);
    //         this.dailyGroup.children[this.dailyGotNum].children[2].runAction(cc.sequence(cc.scaleTo(0.5, 0.5).easing(cc.easeBackOut()), cc.callFunc(function () {
    //             var arr1 = [1, 2, 1, 2, 1, 2, 2] //物品表
    //             var arr2 = [1, 1, 2, 2, 3, 3, 4] //数量表
    //             if (arr1[this.dailyGotNum] == 1) {
    //                 GameApp.uiManager.showToast("获取 <color=#0fffff>体力x" + arr2[this.dailyGotNum] * 2 + " </color>")
    //                 GameApp.dataManager.addHealthNum(arr2[this.dailyGotNum] * 2)
    //             } else if (arr1[this.dailyGotNum] == 2) {
    //                 GameApp.uiManager.showToast("获取 <color=#0fffff>提示卡x" + arr2[this.dailyGotNum] * 2 + " </color>")
    //                 GameApp.dataManager.addTipNum(arr2[this.dailyGotNum] * 2)
    //             }

    //             this.dailyGotNum++
    //             if (this.dailyGotNum == 7) {
    //                 this.dailyGotNum = 0
    //             }
    //             cc.sys.localStorage.setItem("EatChicken_dailyGotNum", this.dailyGotNum)

    //         }.bind(this), this)))

    //     }
    // },
    getBtnClick(eventTouch, customEventData) {
        var selectId = parseInt(customEventData)
        if (GameApp.dataManager.globalData.curDailyGot) return
        if (this.dailyGotNum != (selectId - 1)) return
        GameApp.audioManager.playEffect('click')
        var self = this
        self.onceClick = true
        this.dailyGroup.children[this.dailyGotNum].getComponent(cc.Button).interactable = false
        GameApp.dataManager.globalData.curDailyGot = true
        cc.sys.localStorage.setItem("EatChicken_dailyGotState", true);
        this.dailyGroup.children[this.dailyGotNum].children[1].runAction(cc.sequence(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()), cc.callFunc(function () {
            var arr1 = [1, 2, 1, 2, 1, 2, 1] //物品表
            var arr2 = [50, 5, 50, 5, 100, 5, 500] //数量表
            if (arr1[this.dailyGotNum] == 1) {
                GameApp.uiManager.showToast("获得金币*" + arr2[this.dailyGotNum])
                GameApp.dataManager.addCoin(arr2[this.dailyGotNum])
            } else if (arr1[this.dailyGotNum] == 2) {
                GameApp.uiManager.showToast("获得<color=#faf80d>" + GameApp.dataManager.getSkinDataById(27).name + "</color> 碎片*" + arr2[this.dailyGotNum]);
                GameApp.dataManager.addPieceNum(27, arr2[this.dailyGotNum])
            }

            this.dailyGotNum++
            if (this.dailyGotNum == 7) {
                this.dailyGotNum = 0
            }
            cc.sys.localStorage.setItem("EatChicken_dailyGotNum", this.dailyGotNum)

        }.bind(this), this)))
    },
    closeBtnClick() {
        GameApp.audioManager.playEffect('click')
        this.node.destroy()
    },


    // var delay = cc.delayTime(0.01)
    //     var act = cc.callFunc(function () {
    //     this.winSprite.fillRange += 0.01
    //     if (this.winSprite.fillRange >= 1) {
    //         this.winSprite.node.stopAllActions()
    //         GameApp.uiManager.showPopup('ResultPopup', function (node) {
    //             var popup = node.getComponent('ResultPopup')
    //             popup.init(true)
    //         }.bind(this))
    //     }
    // }.bind(this), this)
    //     this.winSprite.node.runAction(cc.sequence(delay, act).repeatForever())
});
