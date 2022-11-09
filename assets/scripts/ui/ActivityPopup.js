
cc.Class({
    extends: cc.Component,

    properties: {
        page1: cc.Node,
        page2: cc.Node,
        btn1: cc.Node,
        btn2: cc.Node,
        activeProgress: cc.ProgressBar,
        progressBtnGroup: cc.Node,
        activeUI: cc.Label,
        curPageIndex: 0,
        onLineTaskNum: [],
        activityTaskNum: [],
        activityCoinNum: [],
    },

    onLoad() {
        let a = GameApp.dataManager.globalData.onLineGiftCurNum
        this.onLineTaskNum = [a - 10, a - 5, a]
        this.activityTaskNum = GameApp.dataManager.globalData.activityCurNum.concat()
        this.activityCoinNum = GameApp.dataManager.globalData.activityCurCoin.concat()
        this.btn1Click()
    },
    btn1Click(eventTouch) {
        if (this.curPageIndex == 1 && eventTouch) return
        this.curPageIndex = 1
        eventTouch && GameApp.audioManager.playEffect('click')
        this.btn1.children[0].active = false
        this.btn1.children[1].active = true
        this.btn2.children[0].active = true
        this.btn2.children[1].active = false
        this.page2.active = false
        this.showPage1()
    },
    btn2Click(eventTouch) {
        if (this.curPageIndex == 2 && eventTouch) return
        this.curPageIndex = 2
        eventTouch && GameApp.audioManager.playEffect('click')
        this.btn1.children[0].active = true
        this.btn1.children[1].active = false
        this.btn2.children[0].active = false
        this.btn2.children[1].active = true
        this.page1.active = false
        this.showPage2()
    },
    updateOnlineTask() {
        var finishAll = true
        for (var i in this.page1.children) {
            if (GameApp.dataManager.getOnLineGiftsState(i) != 2) {
                finishAll = false
                break;
            }
        }
        if (finishAll) {
            GameApp.dataManager.globalData.onLineGiftCurNum += 15
            cc.sys.localStorage.setItem("EatChicken_onLineGiftCurNum", GameApp.dataManager.globalData.onLineGiftCurNum);
            let a = GameApp.dataManager.globalData.onLineGiftCurNum
            this.onLineTaskNum = [a - 10, a - 5, a]
            GameApp.dataManager.setOnLineGiftsState(0, TaskState.Unfinish)
            GameApp.dataManager.setOnLineGiftsState(1, TaskState.Unfinish)
            GameApp.dataManager.setOnLineGiftsState(2, TaskState.Unfinish)
        }
        this.updateOnLineTaskShow()
    },
    updateOnLineTaskShow() {
        for (var i in this.page1.children) {
            this.page1.children[i].children[0].children[0].getComponent(cc.Label).string = "累计游戏在线" + this.onLineTaskNum[i] + "分钟"
            this.page1.children[i].children[0].children[1].children[0].getComponent(cc.Label).string = this.onLineTaskNum[i]
        }
        this.updateOnlineTaskBtnShow()
    },
    updateOnlineTaskBtnShow() {
        var _minuteTime = GameApp.dataManager.getOnlineTimeMinute()
        for (var i in this.page1.children) {
            switch (GameApp.dataManager.getOnLineGiftsState(i)) {
                case 0:
                    if (_minuteTime >= this.onLineTaskNum[i]) {
                        GameApp.dataManager.setOnLineGiftsState(i, TaskState.Canget)
                        this.page1.children[i].children[1].children[0].active = false
                        this.page1.children[i].children[1].children[1].active = true
                        this.page1.children[i].children[1].children[2].active = false
                    } else {
                        this.page1.children[i].children[1].children[0].active = true
                        this.page1.children[i].children[1].children[1].active = false
                        this.page1.children[i].children[1].children[2].active = false
                    }
                    break
                case 1:
                    this.page1.children[i].children[1].children[0].active = false
                    this.page1.children[i].children[1].children[1].active = true
                    this.page1.children[i].children[1].children[2].active = false
                    break
                case 2:
                    this.page1.children[i].children[1].children[0].active = false
                    this.page1.children[i].children[1].children[1].active = false
                    this.page1.children[i].children[1].children[2].active = true
                    break
            }
        }
    },
    updateActivityTask() {
        for (var i in this.activityTaskNum) {
            if (GameApp.dataManager.getActivityGiftsState(i) == 2) {
                GameApp.dataManager.globalData.activityCurNum[i] += GameApp.dataManager.globalData.activityAddNum[i]
                cc.sys.localStorage.setItem("EatChicken_activityCurNum", JSON.stringify(GameApp.dataManager.globalData.activityCurNum));
                GameApp.dataManager.globalData.activityCurCoin[i] += GameApp.dataManager.globalData.activityAddCoin[i]
                cc.sys.localStorage.setItem("EatChicken_activityCurCoin", JSON.stringify(GameApp.dataManager.globalData.activityCurCoin));
                GameApp.dataManager.setActivityGiftsState(i, TaskState.Unfinish)
            }
        }

        this.activityTaskNum = GameApp.dataManager.globalData.activityCurNum.concat()
        this.activityCoinNum = GameApp.dataManager.globalData.activityCurCoin.concat()
        this.updateActivityTaskShow()
    },
    updateActivityTaskShow() {
        var arr1 = ["累计使用手枪击杀" + this.activityTaskNum[0] + "人",
        "累计击杀" + this.activityTaskNum[1] + "人",
        "累计吃鸡" + this.activityTaskNum[2] + "局"]
        for (var i in this.activityTaskNum) {
            this.page2.children[i].children[0].children[0].getComponent(cc.Label).string = arr1[i]
            this.page2.children[i].children[0].children[1].children[0].getComponent(cc.Label).string = this.activityCoinNum[i]
        }

        this.updateActivityTaskBtnShow()
    },
    updateActivityTaskBtnShow() {
        for (var i in this.activityTaskNum) {
            switch (GameApp.dataManager.getActivityGiftsState(i)) {
                case 0:
                    if (GameApp.dataManager.globalData.activityNum[i] >= this.activityTaskNum[i]) {
                        GameApp.dataManager.setActivityGiftsState(i, TaskState.Canget)
                        this.page2.children[i].children[1].children[0].active = false
                        this.page2.children[i].children[1].children[1].active = true
                        this.page2.children[i].children[1].children[2].active = false
                    } else {
                        this.page2.children[i].children[1].children[0].active = true
                        this.page2.children[i].children[1].children[1].active = false
                        this.page2.children[i].children[1].children[2].active = false
                    }
                    break
                case 1:
                    this.page2.children[i].children[1].children[0].active = false
                    this.page2.children[i].children[1].children[1].active = true
                    this.page2.children[i].children[1].children[2].active = false
                    break
                case 2:
                    this.page2.children[i].children[1].children[0].active = false
                    this.page2.children[i].children[1].children[1].active = false
                    this.page2.children[i].children[1].children[2].active = true
                    break
            }
        }
    },
    showPage1() {
        this.updateOnlineTask()

        this.page1.active = true
    },
    showPage2() {
        this.updateActivityTask()
        this.updateProgressShow()
        this.updateProgressBtnShow()
        this.page2.active = true
    },
    onLineTaskBtnClick(eventTouch, customEventData) {
        var selectId = parseInt(customEventData)
        if (GameApp.dataManager.getOnLineGiftsState(selectId - 1) == 1) {
            GameApp.dataManager.setOnLineGiftsState(selectId - 1, TaskState.Got)
            GameApp.dataManager.addCoin(this.onLineTaskNum[selectId - 1])
            GameApp.uiManager.showToast("获得金币*" + this.onLineTaskNum[selectId - 1])
            this.updateOnlineTaskBtnShow()
        }
    },
    activityTaskBtnClick(eventTouch, customEventData) {
        var selectId = parseInt(customEventData)
        if (GameApp.dataManager.getActivityGiftsState(selectId - 1) == 1) {
            GameApp.dataManager.setActivityGiftsState(selectId - 1, TaskState.Got)
            GameApp.dataManager.addCoin(this.activityCoinNum[selectId - 1])
            GameApp.dataManager.addActiveValue(20)
            this.updateProgressShow()
            GameApp.uiManager.showToast("获得金币*" + this.activityCoinNum[selectId - 1])
            this.updateActivityTaskBtnShow()
        }
    },
    updateProgressShow() {
        this.activeProgress.progress = GameApp.dataManager.globalData.activeValue / 120
        this.activeUI.string = GameApp.dataManager.globalData.activeValue
    },

    progressBtnClick(eventTouch, customEventData) {
        var selectId = parseInt(customEventData)
        if (GameApp.dataManager.globalData.progressGifts[selectId - 1] == 1) {
            GameApp.audioManager.playEffect('click')
            var arr = [30, 60, 90, 120]
            var arr2 = [100, 200, 300, 400]
            // if (GameApp.dataManager.activeValue >= arr[selectId - 1]) {
            GameApp.dataManager.addCoin(arr2[selectId - 1])
            GameApp.uiManager.showToast("获得金币*" + arr2[selectId - 1])
            GameApp.dataManager.setProgressGifts(selectId - 1, 2)
            this.updateProgressBtnShow()
            // }
        }

    },
    updateProgressBtnShow() {
        var arr = [30, 60, 90, 120]
        for (var i in arr) {
            if (GameApp.dataManager.globalData.progressGifts[i] == 0) {
                if (GameApp.dataManager.globalData.activeValue >= arr[i]) {
                    GameApp.dataManager.setProgressGifts(i, 1)
                }
            }
        }


        for (var i in this.progressBtnGroup.children) {
            if (GameApp.dataManager.globalData.progressGifts[i] == 2) {
                this.progressBtnGroup.children[i].children[0].active = false
                this.progressBtnGroup.children[i].children[1].active = true
            } else {
                this.progressBtnGroup.children[i].children[0].active = true
                this.progressBtnGroup.children[i].children[1].active = false
            }
        }
    },

    closeBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.eventManager.emit(EventNames.EVENT_SHOW_ACTIVITYBTN)
        this.node.destroy()
    },
});
