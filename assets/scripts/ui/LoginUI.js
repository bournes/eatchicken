const Utils = require("Utils")
cc.Class({
    extends: cc.Component,

    properties: {
        coinUI: cc.Label,
        nameUI: cc.EditBox,
        curPlayerAnim: sp.Skeleton,
        onceClick: {
            default: true,
            visible: false
        },
        moreBtn: cc.Node,
        moreSprites: [cc.SpriteFrame],
        spriteIndex: 0,
        activityBtnNode: cc.Node,
        originActivityBtnPos: null,
    },


    onLoad() {
        GameApp.eventManager.on(EventNames.EVENT_SHOW_ACTIVITYBTN, this.showActivityBtn.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_COIN_SHOW, this.updateCoinShow.bind(this))

        // if (window.tt) {
        //     const systemInfo = tt.getSystemInfoSync();
        //     if (systemInfo.platform !== "ios" && systemInfo.appName != "XiGua") {
        //         this.moreBtn.active = true
        //         Tools.scaleUpAndDowm(this.moreBtn)
        //         this.moreBtn.runAction(cc.sequence(cc.callFunc(() => {
        //             this.moreBtn.children[0].getComponent(cc.Sprite).spriteFrame = this.moreSprites[this.spriteIndex]
        //             this.spriteIndex++
        //             if (this.spriteIndex == this.moreSprites.length) {
        //                 this.spriteIndex = 0
        //             }
        //         }), cc.delayTime(2)).repeatForever())
        //     } else {
        //         this.moreBtn.active = false
        //     }
        // } else {
        //     this.moreBtn.active = true
        //     Tools.scaleUpAndDowm(this.moreBtn)
        //     this.moreBtn.runAction(cc.sequence(cc.callFunc(() => {
        //         this.moreBtn.children[0].getComponent(cc.Sprite).spriteFrame = this.moreSprites[this.spriteIndex]
        //         this.spriteIndex++
        //         if (this.spriteIndex == this.moreSprites.length) {
        //             this.spriteIndex = 0
        //         }
        //     }), cc.delayTime(2)).repeatForever())
        // }

        GameApp.dataManager.initSomeAttr()
        GameApp.dataManager.setChoosedSkinId(GameApp.dataManager.userData.choosedSkinId)
        this.updateCoinShow()
        this.updateNameShow()
        this.initSkinShow()
        this.originActivityBtnPos = this.activityBtnNode.position
        this.showActivityBtn()
        // if (window.tt) {
        //     var phone = tt.getSystemInfoSync();
        //     var w = phone.screenWidth
        //     var h = phone.screenHeight;
        //     Utils.addBanner("addBanner", {
        //         top: h - (200 * 9 / 16),
        //         left: w / 2 - 100,
        //         width: 200
        //     }, null, null)
        // }

        var passDays = cc.sys.localStorage.getItem("EatChicken_passDays")
        if (passDays == null || passDays == undefined || passDays == "") {
            passDays = 0
            cc.sys.localStorage.setItem("EatChicken_passDays", 0)
        } else {
            passDays = parseInt(passDays)
        }

        var days = 0
        let date = new Date();
        date = parseInt(date.getTime() / 1000)
        var dailyDate = cc.sys.localStorage.getItem("EatChicken_dailyDate")
        if (dailyDate == null || dailyDate == undefined || dailyDate == "") {
            cc.sys.localStorage.setItem("EatChicken_dailyDate", date)
            days = 1
        } else {
            dailyDate = parseInt(dailyDate)
            console.log(date)
            console.log(dailyDate)
            if (date >= dailyDate) {
                var newDate = date - dailyDate
                var newtime = Tools.toTimeString2(newDate)
                days = Math.floor(newtime.hour / 24) + 1
            } else {
                console.log("现在时间比之前时间早，调时间了？")
                cc.sys.localStorage.setItem("EatChicken_dailyDate", date)
                days = 1
                cc.sys.localStorage.setItem("EatChicken_passDays", 0)
                passDays = 0
            }
        }

        if (days - passDays > 0) {
            console.log("执行了天数加一")
            passDays += (days - passDays)
            GameApp.dataManager.globalData.curDailyGot = false
            cc.sys.localStorage.setItem("EatChicken_dailyGotState", false);
            GameApp.dataManager.globalData.activeValue = 0
            cc.sys.localStorage.setItem("EatChicken_activeValue", GameApp.dataManager.globalData.activeValue)
            GameApp.dataManager.globalData.progressGifts = [0, 0, 0, 0]
            cc.sys.localStorage.setItem("EatChicken_progressGifts", JSON.stringify(GameApp.dataManager.globalData.progressGifts))
        }
        cc.sys.localStorage.setItem("EatChicken_passDays", passDays)
        var des = passDays
        des = des % 7
        if (des == 0) {
            des = 7
        }
        GameApp.dataManager.globalData.days = des
        console.log(GameApp.dataManager.globalData.curDailyGot)
        if (!GameApp.dataManager.globalData.curDailyGot) {
            GameApp.uiManager.showPopup('DailyPopup')
        }
        // GameApp.uiManager.showPopup('DailyPopup')

        if (GameApp.dataManager.globalData.recordState == RecordState.READY) {
            Utils.startRecord(function () {
                GameApp.dataManager.changeRecordState(RecordState.RECORD)
            }, function (res) {
                GameApp.uiManager.showToast("已到录屏最大时长!")
                if (res.videoPath != null && res.videoPath != '') {
                    GameApp.dataManager.globalData.recordPath = res.videoPath
                    Utils.recorder.stop()
                }
            })
        }
    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_SHOW_ACTIVITYBTN)
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_COIN_SHOW)
    },
    // update (dt) {},

    soloBtnClick() {
        GameApp.audioManager.playEffect('click');
        GameApp.uiManager.showPopup('GiftPopup', (node) => {
            node.getComponent("GiftPopup").init("PrepareUI", 1)
        })
    },
    onNameChanged(event) {
        // GameApp.dataManager.setPlayerName(event.string)
        GameApp.dataManager.setPlayerName(Tools.getRandomElement(GameApp.dataManager.globalData.playerNameArr))
        this.updateNameShow()
    },

    updateCoinShow() {
        this.coinUI.string = GameApp.dataManager.userData.coinNum
    },

    updateNameShow() {
        // this.nameUI.string = GameApp.dataManager.userData.playerName
        this.nameUI.node.children[0].getComponent(cc.Label).string = GameApp.dataManager.userData.playerName
    },

    initSkinShow() {
        if (GameApp.dataManager.userData.choosedSkinId < 21) {
            this.curPlayerAnim.skeletonData = GameApp.uiManager.normalSkinData;
            this.curPlayerAnim.setSkin(GameApp.dataManager.getSkinDataById(GameApp.dataManager.getChoosedSkinId()).skinname)
        } else {
            this.curPlayerAnim.skeletonData = GameApp.uiManager.advanceSkinDataGroup[GameApp.dataManager.userData.choosedSkinId - 21]
        }
        if (GameApp.dataManager.userData.choosedSkinId < 21) {
            this.curPlayerAnim.setAnimation(0, 'await', true)
        } else {
            this.curPlayerAnim.setAnimation(0, 'await_main_1', false)
            this.curPlayerAnim.setCompleteListener(() => {
                this.curPlayerAnim.setAnimation(0, 'await_main_' + Tools.randomNum(1, 3), false)
            })
        }
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
    skinBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI('SkinUI')
    },
    boxBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI('BoxUI')
    },
    rankBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI('RankUI')
    },
    weaponBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI('GunUI')
    },
    shopBtnClick() {
        GameApp.audioManager.playEffect('click')
    },
    shareBtnClick() {
        GameApp.audioManager.playEffect('click')
        Utils.shareFromHomePage(() => {
            GameApp.uiManager.showToast("感谢您的支持，赠送50金币")
            GameApp.dataManager.addCoin(50)
        }, () => {
            GameApp.uiManager.showToast("分享失败!")
        })
    },
    moreGameBtnClick() {
        this.showActivityBtn()
        if (window.tt) {
            const systemInfo = tt.getSystemInfoSync();
            // iOS 不支持，建议先检测再使用
            if (systemInfo.platform !== "ios") {
                // 打开互跳弹窗
                tt.showMoreGamesModal({
                    appLaunchOptions: [
                        {
                            appId: "ttXXXXXX",
                            query: "foo=bar&baz=qux",
                            extraData: {}
                        }
                        // {...}
                    ],
                    success(res) {
                        console.log("success", res.errMsg);
                    },
                    fail(res) {
                        console.log("fail", res.errMsg);
                    }
                });
            }
        }
    },
    showActivityBtn() {
        this.activityBtnNode.getComponent(cc.Button).interactable = true
        this.activityBtnNode.stopAllActions()
        this.activityBtnNode.runAction(cc.sequence(cc.moveTo(0.2, cc.v2(this.originActivityBtnPos).add(cc.v2(90, 0))).easing(cc.easeBackOut()), cc.callFunc(() => {
            this.activityBtnNode.runAction(cc.sequence(cc.moveBy(0.8, cc.v2(20, 0)).easing(cc.easeBounceOut(4)), cc.moveBy(0.2, cc.v2(-20, 0)), cc.moveBy(0.5, cc.v2(20, 0)).easing(cc.easeBounceOut(4)), cc.moveBy(0.2, cc.v2(-20, 0)), cc.delayTime(1)).repeatForever())
        })))
    },
    activityBtnClick() {
        GameApp.audioManager.playEffect('click')
        this.activityBtnNode.getComponent(cc.Button).interactable = false
        this.activityBtnNode.stopAllActions()
        this.activityBtnNode.runAction(cc.moveTo(0.2, this.originActivityBtnPos))
        GameApp.uiManager.showPopup("ActivityPopup")
    },
});
