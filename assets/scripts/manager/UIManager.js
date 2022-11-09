const PREFAB_PATH = require('PrefabPath');
const JSON_PATH = require('JsonPath');
window.conMag = window.conMag || require("ConfigManager");

cc.Class({
    extends: cc.Component,

    properties: {
        gameRoot: cc.Node,
        uiRoot: cc.Node,
        popupRoot: cc.Node,
        toastRoot: cc.Node,
        toastPrefab: cc.Prefab,
        loadingMask: cc.Node,
        loadingProgress: cc.ProgressBar,
        splashUI: cc.Node,
        _Prefabs: {
            default: {},
        },
        _Jsons: {
            default: {},
        },

        mapCamera: cc.Camera,
        mipmapCamera: cc.Camera,
        normalSkinData: sp.SkeletonData,
        advanceSkinDataGroup: [sp.SkeletonData],
        boxSkinDataGroup: [sp.SkeletonData],
        commonAtlas: cc.SpriteAtlas,
        gunSkinDataGroup: [sp.SkeletonData]
    },

    onLoad() {
        if (GameApp.uiManager !== null) {
            return this.node.destroy();
        }
        GameApp.uiManager = this;
        cc.game.addPersistRootNode(this.node);

        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDrawBoundingBox = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        var manager = cc.director.getPhysicsManager();
        manager.enabled = true;
        manager.debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_pairBit |
            cc.PhysicsManager.DrawBits.e_centerOfMassBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit;
        let frameSize = cc.view.getFrameSize();
        var canvas = cc.game.canvas;
        canvas.width = frameSize.width * window.devicePixelRatio;
        canvas.height = frameSize.height * window.devicePixelRatio;

        this.setLoadingMaskVisible(false);
        this.loadingProgress.progress = 0;
        //开始加载;
        this.startLoading();

        // window.conMag.loadAllConfig(() => {
        //     let all = window.conMag.getAllConfig()
        //     // console.log("这是读取的数据")
        //     // console.log(all["Config"])
        //     var skinJson = all["Skin"]
        //     console.log(skinJson.json['skins'])
        // })

    },

    startLoading: function () {
        console.log('开始加载');
        this.loadingProgress.node.active = true;
        this.loadAll(function (completedCount, totalCount) {
            let per = completedCount / totalCount;
            if (per && !isNaN(per)) {
                this.loadingProgress.progress = per
            }
        }.bind(this), function () {
            this.loadingProgress.node.active = false;
            this.splashUI.active = false;
            //读取用户信息;
            let userData = cc.sys.localStorage.getItem("EatChicken_UserData");
            if (userData == null || userData == undefined || userData == '') {
            } else {
                GameApp.dataManager.userData = JSON.parse(userData);
                //console.log(GameApp.dataManager.userData);
            }
            this.showUI("LoginUI")
        }.bind(this))
    },

    /**
     *
     * @param cbProgress        加载中的回调
     * @param cbComplete        加载完成的回调
     */
    loadAll(cbProgress, cbComplete) {
        let paths = [];
        var ii = 0;
        //加载预制体配置路径文件;
        for (let name in PREFAB_PATH) {
            paths.push(PREFAB_PATH[name]);
            ii++
        }
        var prefabCount = ii;
        var jj = 0;
        //加载JSON配置文件;
        for (let name2 in JSON_PATH) {
            paths.push(JSON_PATH[name2]);
            jj++
        }
        let jsonCount = jj;
        cc.loader.loadResArray(paths, function (completedCount, totalCount) {
            // console.log(completedCount + '/' + totalCount)
            cbProgress(completedCount, totalCount);
        }, function (err, prefabs) {
            let names = Object.keys(PREFAB_PATH);
            //for (let i in prefabs) {
            for (let i = 0; i < prefabCount; i++) {
                this._Prefabs[names[i]] = prefabs[i];
            }
            let names2 = Object.keys(JSON_PATH);
            //for (let i in prefabs) {
            for (let j = 0; j < jsonCount; j++) {
                this._Jsons[names2[j]] = prefabs[prefabCount + j].json[names2[j]];
                GameApp.dataManager.jsonData[names2[j]] = this._Jsons[names2[j]]
            }
            // console.log(GameApp.dataManager.jsonData)
            cbComplete();
            // let paths2 = ['data/skins.json'];

            // cc.loader.loadResArray(paths2, function (completedCount, totalCount) {
            //     cbProgress(completedCount, totalCount);
            // }, function (err, jsons) {
            //     // console.log(jsons[0].json.skins)
            //     GameApp.dataManager.skinsData = jsons[0].json.skins
            //     console.log(GameApp.dataManager.skinsData)
            //     cbComplete();
            // }.bind(this))

        }.bind(this));
    },

    load(name, cb) {
        cc.loader.loadRes(PREFAB_PATH[name], function (err, prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            this._Prefabs[name] = prefab;
            cb && cb(name);
        }.bind(this));
    },

    showGameObject(name, cb, parentNode) {
        if (!this._Prefabs[name]) {
            this.load(name, function () {
                this.showGameObject(name, cb);
            }.bind(this));
            return;
        }

        let node = cc.instantiate(this._Prefabs[name]);
        parentNode && parentNode.addChild(node);
        cb && cb(node);
    },

    showGame(name, cb) {
        //未加载
        if (this._curGameName == name) {
            console.log("---showGame.repeat----")
            //允许刷新Game
            // return;
        }

        if (!this._Prefabs[name]) {
            this.load(name, function () {
                this.showGame(name, cb);
            }.bind(this));
            return;
        }

        let node = cc.instantiate(this._Prefabs[name]);
        this.gameRoot.addChild(node);
        this._curGameName = name;

        cb && cb(node);
    },

    showUI(name, cb) {
        console.log('showUI');
        //未加载
        if (this._curName == name) {
            console.log("---showUI.repeat----")
            //不允许刷新UI
            return;
        }

        if (!this._Prefabs[name]) {
            this.load(name, function () {
                this.showUI(name, cb);
            }.bind(this));
            return;
        }
        //已加载 
        // this.uiRoot.destroyAllChildren();
        // this.clearPopups()
        this.clearGames()
        //特殊处理的UI
        // for (let i = this.popupRoot.children.length - 1; i >= 0; i--) {
        //     if (this.popupRoot.children[i]._tag !== 10086) {
        //         this.popupRoot.children[i].destroy();
        //     }
        // }
        this.uiRoot.children.forEach(eachUI => {
            eachUI.runAction(cc.sequence(cc.fadeOut(0.1), cc.callFunc(() => {
                eachUI.destroy()
            })))
        });
        this.clearPopups();
        let node = cc.instantiate(this._Prefabs[name]);
        node.opacity = 0;
        this.uiRoot.addChild(node);
        node.runAction(cc.fadeIn(0.3));
        this._curName = name;
        cb && cb(node);
    },

    getUI(name) {
        return this.uiRoot.getChildByName(name);
    },

    popUI() {
        let uis = this.uiRoot.children;
        if (uis.length > 0) {
            uis[uis.length - 1].destroy();
        }
    },

    isInMapSight(_target) {
        var cameraWidth = this.mapCamera.node.width / 0.9
        var cameraHeight = this.mapCamera.node.height / 0.9
        var thePos = this.mapCamera.getWorldToScreenPoint(_target.convertToWorldSpaceAR(cc.v2(0, 0)))
        if (thePos.x < 0 || thePos.x > cameraWidth || thePos.y < 0 || thePos.y > cameraHeight) {
            return false
        }
        return true
    },

    // showTop(cb) {
    //     var name = "TopUI"
    //     //未加载
    //     if (!this._Prefabs[name]) {
    //         this.load(name, function () {
    //             this.showTop(name, cb);
    //         }.bind(this));
    //         return;
    //     }
    //     //已加载
    //     if (this.topRoot.childrenCount == 0) {
    //         let node = cc.instantiate(this._Prefabs[name]);
    //         this.topRoot.addChild(node);
    //     } else {
    //         this.topRoot.children[0].active = true
    //     }

    //     cb && cb(node);
    // },

    // getTop() {
    //     return this.topRoot.children[0];
    // },
    // hideTop() {
    //     (this.topRoot.childrenCount > 0) && (this.topRoot.children[0].active = false);
    // },

    showPopup(name, cb, clean = true) {
        if (this._curPopupName == name) {
            console.log("---showPopup.repeat----")
            //允许刷新popup
            // return;
        }
        //未加载
        if (!this._Prefabs[name]) {
            this.load(name, function () {
                this.showPopup(name, cb);
            }.bind(this));
            return;
        }
        if (clean) {
            this.clearPopups()
        }
        //已加载
        let node = cc.instantiate(this._Prefabs[name]);
        // node.opacity = 0
        node.children[0].scaleX = 0
        node.children[0].scaleY = 0
        this.popupRoot.addChild(node);
        node.children[0].runAction(cc.scaleTo(0.5, 1).easing(cc.easeBounceOut(2)))
        this._curPopupName = name

        cb && cb(node);
    },

    getPopup(name) {
        return this.popupRoot.getChildByName(name);
    },

    popPopup() {
        let popups = this.popupRoot.children;
        if (popups.length > 0) {
            popups[popups.length - 1].destroy();
        }
    },

    closePopup(name) {
        for (let node of this.popupRoot.children) {
            if (node.name === name) {
                node.runAction(cc.sequence(cc.fadeOut(0.1), cc.callFunc(() => {
                    this._curPopupName = ""
                    node.active = false;
                    node.destroy();
                })));
                break;
            }
        }
    },

    clearPopups() {
        console.log('clearPopups')
        for (let node of this.popupRoot.children) {
            node.runAction(cc.sequence(cc.fadeOut(0.1), cc.callFunc(() => {
                node.destroy();
            })))
        }
        this._curPopupName = ""
        // this.popupRoot.destroyAllChildren();
    },

    getGame(name) {
        return this.gameRoot.getChildByName(name);
    },

    clearGames() {
        this.gameRoot.destroyAllChildren();
        this._curGameName = ""
    },

    showToast(s, callback, num) {
        if (!this.toastPrefab) return;
        var toast = cc.instantiate(this.toastPrefab);
        if (this.toastRoot.childrenCount > 0) {
            for (var i = this.toastRoot.childrenCount - 1; i >= 0; i--) {
                var moveUp = cc.moveBy(0.1, cc.v2(0, toast.height))
                this.toastRoot.children[i].runAction(moveUp)
            }
        }
        this.toastRoot.addChild(toast);
        toast.getComponent('ToastUI').show(s, callback, num);
    },

    setLoadingMaskVisible(isShow) {
        if (isShow) {
            this.loadingMask.active = true
        } else {
            this.loadingMask.active = false
        }
    },

    //例外
    update(dt) {
        GameApp.dataManager.globalData.onLineTime += dt;
        switch (GameApp.dataManager.globalData.recordState) {
            case RecordState.READY:
                GameApp.dataManager.globalData.recordTimer = 0;
                break;
            case RecordState.RECORD:
                GameApp.dataManager.globalData.recordTimer += dt;
                break;
            case RecordState.PAUSE:
                break;
        }
    }

});