/**录屏状态 */
window.RecordState = cc.Enum({
    READY: 0,
    RECORD: 1,
    PAUSE: 2
});
cc.Class({
    name: "DataManager",

    properties: {
        MD5Code: null,
        userData: {
            default: {},
        },
    },

    ctor() {
        this.userData = {
            isFirstPlay: true,
            playerName: "菠萝吹雪",
            coinNum: 0,
            choosedSkinId: 1, //21~30是独立的spine文件
            unLockedSkinIdArr: [1],

            playedVideoNum: 0,
            havePieceNum: {
                26: 0,
                27: 0,
                28: 0,
                29: 0,
                30: 0,
            },
            box1NeedCoinNum: 100,
            box1RewardCoinNum: [50, 150],
            box2RewardCoinNum: [250, 500],

            //下面是人物基础属性
            baseHp: 100,
            baseDamage: 1,
            baseCrit: 0,
            baseSpeed: 200,
            baseCd: 0,
            baseDef: 0,
            baseRecovery: 1,

            //下面是战绩统计
            alDieNum: 0,
            allKillNum: 0,
            allPlayNum: 0,
            winNum: 0,
            top5Num: 0,
            winRate: 0,
            kd: 0,
            avgRank: 0,
            mostKill: 0,
            avgLifeTime: 0,
        }
        this.globalData = {
            days: 1,
            curDailyGot: false,

            shootInterval: 0,
            reloadInterval: 0,
            maxAmoNum: 20,
            curAmoNum: 20,

            maxHp: 100,
            curHp: 100,
            curDamage: 0,
            curCrit: 0,
            curSpeed: 200,
            curCd: 0,
            curDef: 0,
            curRecovery: 0,

            allRoleArr: [],
            allGunArr: [],
            allBoxArr: [],
            isInGame: false,//用于区分准备场景和游戏场景，准备场景是不会造成伤害的，也不显示一些UI
            inGameKillNum: [],
            gasConfig: null,
            getItemAttrArr: [{
                rank: 0,
                item: null
            }, {
                rank: 0,
                item: null
            }, {
                rank: 0,
                item: null
            }, {
                rank: 0,
                item: null
            }],//伤害，防御，移速，暴击
            equipItemAttr: [0, 0, 0, 0],//(装备带来的属性)伤害，防御，移速，暴击

            lifeTime: 0,


            //在线相关
            onLineTime: 0,//累计在线时长
            onLineGifts: [2, 2, 2],//0未完成，1可领取，2已领取
            onLineGiftCurNum: 0,//当前一批任务最大金币数和所需在线时长(+5)

            //活跃相关
            activeValue: 0,//活跃值
            activityGifts: [2, 2, 2],//0未完成，1可领取，2已领取
            activityNum: [0, 0, 0],//当前三个任务完成数量
            activityCurNum: [0, 0, 0],
            activityCurCoin: [0, 0, 0],

            progressGifts: [0, 0, 0, 0],//0是未达成，1是可领取，2是已领取

            activityAddNum: [1, 3, 1],//每阶段任务增量
            activityAddCoin: [50, 100, 100],//每阶段金币增量
            //////
            playerNameArr: [
                "隋晗蕾",
                "驹夏之",
                "壬紫雪",
                "华清涵",
                "厍岚彩",
                "依雪兰",
                "俟骊婧",
                "声采珊",
                "愈成济",
                "暴雨",
                "党雁丝",
                "柴俊郎",
                "潜春芳",
                "衷亦巧",
                "越世敏",
                "祈桐",
                "菅昆锐",
                "卑绍钧",
                "浑秀英",
                "牛俊悟",
                "汲永康",
                "虎胤文",
                "宿巧春",
                "海合瑞",
                "朋曾",
                "哈蝶",
                "宏睿文",
                "黎泰然"],
            recordPath: null,
            recordTimer: 0,
            recordState: RecordState.READY,
        }
        //皮肤
        this.jsonData = {
            SkinsData: [],
            WeaponData: [],
            RobotName: []
        }
    },
    initSomeAttr() {
        cc.game.on(cc.game.EVENT_HIDE, () => {
            console.log("进入后台前存储了数据");
            cc.sys.localStorage.setItem("EatChicken_onLineTime", parseInt(this.globalData.onLineTime));
        });

        var getState = cc.sys.localStorage.getItem("EatChicken_dailyGotState");
        if (getState == "true" || getState == true) {
            this.globalData.curDailyGot = true
        } else {
            this.globalData.curDailyGot = false
        }
        var tempOnLinetime = cc.sys.localStorage.getItem("EatChicken_onLineTime")
        if (tempOnLinetime == null || tempOnLinetime == undefined || tempOnLinetime == "") {
            tempOnLinetime = 0
            cc.sys.localStorage.setItem("EatChicken_onLineTime", 0)
        } else {
            tempOnLinetime = parseInt(tempOnLinetime)
        }
        this.globalData.onLineTime = tempOnLinetime

        var tempOnLineGifts = cc.sys.localStorage.getItem("EatChicken_onLineGifts")
        if (tempOnLineGifts == null || tempOnLineGifts == undefined || tempOnLineGifts == "") {
            tempOnLineGifts = [2, 2, 2]
            cc.sys.localStorage.setItem("EatChicken_onLineGifts", JSON.stringify(tempOnLineGifts))
        } else {
            tempOnLineGifts = JSON.parse(tempOnLineGifts)
        }
        this.globalData.onLineGifts = tempOnLineGifts


        var tempOnLineGiftCurNum = cc.sys.localStorage.getItem("EatChicken_onLineGiftCurNum")
        if (tempOnLineGiftCurNum == null || tempOnLineGiftCurNum == undefined || tempOnLineGiftCurNum == "") {
            tempOnLineGiftCurNum = 0
            cc.sys.localStorage.setItem("EatChicken_onLineGiftCurNum", 0)
        } else {
            tempOnLineGiftCurNum = parseInt(tempOnLineGiftCurNum)
        }
        this.globalData.onLineGiftCurNum = tempOnLineGiftCurNum



        var tempactiveValue = cc.sys.localStorage.getItem("EatChicken_activeValue")
        if (tempactiveValue == null || tempactiveValue == undefined || tempactiveValue == "") {
            tempactiveValue = 0
            cc.sys.localStorage.setItem("EatChicken_activeValue", 0)
        } else {
            tempactiveValue = parseInt(tempactiveValue)
        }
        this.globalData.activeValue = tempactiveValue

        var tempactivityGifts = cc.sys.localStorage.getItem("EatChicken_activityGifts")
        if (tempactivityGifts == null || tempactivityGifts == undefined || tempactivityGifts == "") {
            tempactivityGifts = [2, 2, 2]
            cc.sys.localStorage.setItem("EatChicken_activityGifts", JSON.stringify(tempactivityGifts))
        } else {
            tempactivityGifts = JSON.parse(tempactivityGifts)
        }
        this.globalData.activityGifts = tempactivityGifts

        var tempactivityNum = cc.sys.localStorage.getItem("EatChicken_activityNum")
        if (tempactivityNum == null || tempactivityNum == undefined || tempactivityNum == "") {
            tempactivityNum = [0, 0, 0]
            cc.sys.localStorage.setItem("EatChicken_activityNum", JSON.stringify(tempactivityNum))
        } else {
            tempactivityNum = JSON.parse(tempactivityNum)
        }
        this.globalData.activityNum = tempactivityNum

        var tempactivityCurNum = cc.sys.localStorage.getItem("EatChicken_activityCurNum")
        if (tempactivityCurNum == null || tempactivityCurNum == undefined || tempactivityCurNum == "") {
            tempactivityCurNum = [0, 0, 0]
            cc.sys.localStorage.setItem("EatChicken_activityCurNum", JSON.stringify(tempactivityCurNum))
        } else {
            tempactivityCurNum = JSON.parse(tempactivityCurNum)
        }
        this.globalData.activityCurNum = tempactivityCurNum

        var tempactivityCurCoin = cc.sys.localStorage.getItem("EatChicken_activityCurCoin")
        if (tempactivityCurCoin == null || tempactivityCurCoin == undefined || tempactivityCurCoin == "") {
            tempactivityCurCoin = [0, 0, 0]
            cc.sys.localStorage.setItem("EatChicken_activityCurCoin", JSON.stringify(tempactivityCurCoin))
        } else {
            tempactivityCurCoin = JSON.parse(tempactivityCurCoin)
        }
        this.globalData.activityCurCoin = tempactivityCurCoin

        var tempprogressGifts = cc.sys.localStorage.getItem("EatChicken_progressGifts")
        if (tempprogressGifts == null || tempprogressGifts == undefined || tempprogressGifts == "") {
            tempprogressGifts = [0, 0, 0, 0]
            cc.sys.localStorage.setItem("EatChicken_progressGifts", JSON.stringify(tempprogressGifts))
        } else {
            tempprogressGifts = JSON.parse(tempprogressGifts)
        }
        this.globalData.progressGifts = tempprogressGifts


        this.globalData.allRoleArr = []
        this.globalData.allGunArr = []
        this.globalData.allBoxArr = []
        this.globalData.inGameKillNum = []
        this.globalData.gasConfig = null
        this.globalData.getItemAttrArr = [{
            rank: 0,
            item: null
        }, {
            rank: 0,
            item: null
        }, {
            rank: 0,
            item: null
        }, {
            rank: 0,
            item: null
        }]//伤害，防御，移速，暴击
        this.globalData.equipItemAttr = [0, 0, 0, 0]
        this.globalData.maxHp = this.globalData.curHp = this.userData.baseHp
        this.globalData.curDamage = this.userData.baseDamage
        this.globalData.curCrit = this.userData.baseCrit
        this.globalData.curSpeed = this.userData.baseSpeed
        this.globalData.curCd = this.userData.baseCd
        this.globalData.curDef = this.userData.baseDef
        this.globalData.curRecovery = this.userData.baseRecovery

        // for (let i = 0; i < 30; i++) {
        //     this.globalData.inGameKillNum.push({
        //         _killNum: 0,
        //         _belongName: ""
        //     })
        // }
    },
    setPlayerName(_name) {
        this.userData.playerName = _name
        this.save()
    },
    addCoin(_num) {
        this.userData.coinNum += _num
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_COIN_SHOW)
        this.save()
    },
    reduceCoin(_num) {
        var a = this.userData.coinNum - _num
        if (a < 0) {
            return false
        } else {
            this.userData.coinNum = a
            GameApp.eventManager.emit(EventNames.EVENT_UPDATE_COIN_SHOW)
            this.save()
            return true
        }
    },

    unLockSkin(_skinId) {
        if (this.userData.unLockedSkinIdArr.indexOf(_skinId) == -1) {
            this.userData.unLockedSkinIdArr.push(_skinId)
        }
    },
    addPieceNum(_pieceIndex, _num) {
        this.userData.havePieceNum[_pieceIndex] += _num
        var arr = [26, 27, 28, 29, 30]
        arr.forEach(index => {
            if (this.userData.havePieceNum[index] >= this.getSkinDataById(index).needpiece) {
                this.unLockSkin(index)
            }
        });
        this.save()
    },
    addPlayedVideoNum() {
        this.userData.playedVideoNum++
        var arr = [21, 22, 23, 24, 25]
        arr.forEach(index => {
            if (this.userData.playedVideoNum >= this.getSkinDataById(index).needgem) {
                this.unLockSkin(index)
            }
        });
        this.save()
    },
    getSkinDataById(_skinId) {
        return this.jsonData.SkinsData[_skinId - 1]
    },

    setChoosedSkinId(_val) {
        (_val > 30) && (_val = 1);
        (_val < 1) && (_val = 30);
        this.userData.choosedSkinId = _val
        this.addSkinAttr()
        this.save()
    },
    addSkinAttr() {
        var curSkinData = this.getSkinDataById(this.userData.choosedSkinId)
        this.globalData.maxHp = this.globalData.curHp = this.userData.baseHp + Math.floor(this.userData.baseHp * (curSkinData.att_hpmax / 100))
        this.globalData.curDamage = this.userData.baseDamage + curSkinData.att_damage / 100
        this.globalData.curCrit = this.userData.baseCrit + curSkinData.att_crit / 10
        this.globalData.curSpeed = this.userData.baseSpeed + Math.floor(this.userData.baseSpeed * (curSkinData.att_speed / 100))
        this.globalData.curCd = this.userData.baseCd + curSkinData.att_cd / 100
        this.globalData.curDef = this.userData.baseDef + curSkinData.att_defense / 100
        this.globalData.curRecovery = this.userData.baseRecovery + curSkinData.att_recovery / 100
    },
    getChoosedSkinId() {
        return this.userData.choosedSkinId
    },
    reduceHp(_num) {
        var a = this.globalData.curHp - _num
        if (a <= 0) {
            this.globalData.curHp = 0
            GameApp.eventManager.emit(EventNames.EVENT_UPDATE_TOPBAR_SHOW)
            return false
        } else {
            this.globalData.curHp = a
            GameApp.eventManager.emit(EventNames.EVENT_UPDATE_TOPBAR_SHOW)
            return true
        }
    },
    getResumeHealthNum() {
        return 10 * this.globalData.curRecovery
    },
    getSkillCD() {
        return 10 * (1 - this.globalData.curCd)
    },
    addHp(_num) {
        var a = this.globalData.curHp + _num
        if (a > this.globalData.maxHp) {
            this.globalData.curHp = this.globalData.maxHp
        } else {
            this.globalData.curHp = a
        }
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_TOPBAR_SHOW)
    },
    reduceAmo() {
        var a = this.globalData.curAmoNum - 1
        if (a < 0) {
            this.globalData.curAmoNum = 0
            GameApp.eventManager.emit(EventNames.EVENT_UPDATE_AMO_SHOW)
            return false
        } else {
            this.globalData.curAmoNum = a
            GameApp.eventManager.emit(EventNames.EVENT_UPDATE_AMO_SHOW)
            return true
        }
    },
    reloadAmo() {
        this.globalData.curAmoNum = this.globalData.maxAmoNum
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_AMO_SHOW)
    },
    addKillNum(_index, _belongName) {
        if (_index == 1) {
            _index = 0
        } else {
            _index -= 9
        }
        this.globalData.inGameKillNum[_index]._killNum++
        this.globalData.inGameKillNum[_index]._belongName = _belongName
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_RANK_SHOW)
        return this.globalData.inGameKillNum[_index]._killNum
    },
    equipBoxItem(_index) {
        var _rank = this.globalData.getItemAttrArr[_index].rank + 1
        this.globalData.getItemAttrArr[_index] = {
            rank: _rank,
            item: ItemAttr[_index][_rank - 1]
        }
        // var _num = 1
        // if (_index == 3) {
        //     _num = 0
        // }
        this.globalData.equipItemAttr[_index] = this.globalData.getItemAttrArr[_index].item.attr
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_STAR_SHOW)
    },
    getEquipItemAttr(_index) {
        return this.globalData.equipItemAttr[_index]
    },
    getEquipShowAttr() {
        var arr = []
        for (var i in this.globalData.getItemAttrArr) {
            var _rank = this.globalData.getItemAttrArr[i].rank
            if (_rank == 0) {
                arr.push(null)
            } else {
                arr.push(this.globalData.getItemAttrArr[i])
            }
        }
        return arr
    },
    getOnLineGiftsState(_index) {
        return this.globalData.onLineGifts[_index]
    },
    getActivityGiftsState(_index) {
        return this.globalData.activityGifts[_index]
    },
    setOnLineGiftsState(_index, _state) {
        this.globalData.onLineGifts[_index] = _state
        cc.sys.localStorage.setItem("EatChicken_onLineGifts", JSON.stringify(this.globalData.onLineGifts))
    },
    setActivityGiftsState(_index, _state) {
        this.globalData.activityGifts[_index] = _state
        cc.sys.localStorage.setItem("EatChicken_activityGifts", JSON.stringify(this.globalData.activityGifts))
    },
    getOnlineTimeMinute() {
        var minuteTime = 0
        var newtime = Tools.toTimeString2(this.globalData.onLineTime)
        minuteTime = Math.floor(newtime.hour * 60 + newtime.minute)
        return minuteTime
    },
    addActiveValue(_num) {
        var a = this.globalData.activeValue + _num
        if (a > 120) {
            a = 120
        }
        this.globalData.activeValue = a
        var arr = [30, 60, 90, 120]
        for (var i in arr) {
            if (this.globalData.progressGifts[i] == 0) {
                if (this.globalData.activeValue >= arr[i]) {
                    this.setProgressGifts(i, 1)
                }
            }
        }
        cc.sys.localStorage.setItem("EatChicken_activeValue", this.globalData.activeValue)
    },
    addActivityNum(_index, _num) { //更新对应任务完成数量
        this.globalData.activityNum[_index] += _num
        cc.sys.localStorage.setItem("EatChicken_activityNum", JSON.stringify(this.globalData.activityNum))
    },
    setProgressGifts(_index, _state) {
        this.globalData.progressGifts[_index] = _state
        cc.sys.localStorage.setItem("EatChicken_progressGifts", JSON.stringify(this.globalData.progressGifts))
    },
    save() {
        cc.sys.localStorage.setItem("EatChicken_UserData", JSON.stringify(this.userData))
    },
    //////////////////////////////////////////////////////////下卖弄是通用的
    changeRecordState(state) {
        this.globalData.recordState = state
    },
    setMD5Code(_data) {
        this.MD5Code = _data
    },

    getMD5Code() {
        return this.MD5Code
    },

});