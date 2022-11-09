
cc.Class({
    extends: cc.Component,

    properties: {
        tiledMap: cc.TiledMap,
        objectPrefab: cc.Prefab,
        colliderPrefab: cc.Prefab,
        groundItemPrefab: cc.Prefab,

        waitLabel: cc.Node,
        allObjectNode: cc.Node,
        allColliderNode: cc.Node,
        allGunNode: cc.Node,
        enemySpawnPosGroupNode: cc.Node,

        mapAtlas: cc.SpriteAtlas,

        _timer0: 0.1,
        _timer: 0.1,
        readyToSort: false
    },


    onLoad() {
        this.initMapShow()
        this.showPlayer()
        this.showEnemy()
    },
    update(dt) {
        if (!this.readyToSort) return;
        this._timer -= dt
        if (this._timer < 0) {
            this._timer = this._timer0
            this.sortAll()
        }

    },
    initMapShow() {
        GameApp.dataManager.globalData.allRoleArr = []
        GameApp.dataManager.globalData.allGunArr = []
        // this.node.children[2].active = true
        let wallLayer = this.tiledMap.getLayer("wall")
        this.tiledMap.getObjectGroup("dynamic")._objects.forEach(element => {
            let obj = cc.instantiate(this.objectPrefab)
            obj.getComponent(cc.Sprite).spriteFrame = this.mapAtlas.getSpriteFrame(element.name.split('.')[0])
            obj.parent = this.allColliderNode
            let desPos = wallLayer.getPositionAt(this.getTilePos(cc.v2(element.x, element.y)))
            obj.setPosition(desPos)
            let ddd = this.allObjectNode.convertToNodeSpaceAR(obj.convertToWorldSpaceAR(cc.v2(0, 0)))
            obj.parent = this.allObjectNode
            obj.setPosition(ddd)
        });
        this.tiledMap.getObjectGroup("collision")._objects.forEach(element => {
            let obj = cc.instantiate(this.colliderPrefab)
            let coli = obj.getComponent(cc.PhysicsBoxCollider)
            coli.size = cc.size(element.width, element.height)
            coli.offset = cc.v2(element.width / 2, -element.height / 2)
            coli.apply()
            this.allColliderNode.addChild(obj)
            obj.setPosition(cc.v2(element.x, element.y))
            coli.tag = Tags.collider
        });
        this.tiledMap.getObjectGroup("gun")._objects.forEach(element => {
            // var element = this.tiledMap.getObjectGroup("gun")._objects[0]
            let obj = cc.instantiate(this.groundItemPrefab)
            obj.parent = this.allColliderNode
            let desPos = wallLayer.getPositionAt(this.getTilePos(cc.v2(element.x, element.y)))
            obj.setPosition(desPos)
            let ddd = this.allGunNode.convertToNodeSpaceAR(obj.convertToWorldSpaceAR(cc.v2(0, 0)))
            obj.parent = this.allGunNode
            obj.setPosition(ddd)
            let _param = {
                _type: ItemType.weapon,
                _kind: Tools.randomNum(0, 5)
            }
            obj.getComponent('GroundItem').init(_param)
            GameApp.dataManager.globalData.allGunArr.push(obj)
        });

    },
    //将像素坐标转化为瓦片坐标，posInPixel：目标节点的position
    getTilePos(posInPixel) {
        var mapSize = this.tiledMap.node.getContentSize();
        var tileSize = this.tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        return cc.v2(x, y);
    },
    showPlayer() {
        GameApp.uiManager.showGameObject('Player', (node) => {
            // GameApp.dataManager.globalData.allRoleArr.push(node)
            // node.setPosition(0, 0)
            var c = node.getComponent("Player")
            GameApp.uiManager.getUI("PrepareUI").getComponent("PrepareUI").joystick.getComponent("Joystick").player = c
            c.init()
            GameApp.dataManager.globalData.allRoleArr.push(c)
            this.readyToSort = true
        }, this.allObjectNode)
    },
    showEnemy() {
        var tempPosArr = []
        var standardArr = this.enemySpawnPosGroupNode.children
        // var xRangeArr = []
        // var eachSpaceX = (standardArr[1].x - standardArr[0].x) / 6
        // for (let i = 0; i < 7; i++) {
        //     xRangeArr.push(standardArr[0].x + eachSpaceX * i)
        // }
        // var yRangeArr = []
        // var eachSpaceY = (standardArr[2].y - standardArr[0].y) / 5
        // for (let i = 0; i < 6; i++) {
        //     yRangeArr.push(standardArr[0].y + eachSpaceY * i)
        // }
        // for (let i = 0; i < xRangeArr.length; i++) {
        //     for (let j = 0; j < yRangeArr.length; j++) {
        //         tempPosArr.push(cc.v2(xRangeArr[i], yRangeArr[j]))
        //     }
        // }

        // tempPosArr = Tools.getRandomAmountElementUnRepeat(tempPosArr, 30)
        var tagNum = Tags.enemy
        for (var i = 0; i < 5; i++) {
            if (i + 1 == GameApp.dataManager.userData.choosedSkinId) {
                continue;
            }
            GameApp.uiManager.showGameObject('Enemy', (node) => {
                // GameApp.dataManager.globalData.allRoleArr.push(node)
                node.getComponent(cc.PhysicsBoxCollider).tag = tagNum++
                node.setPosition(cc.v2(Tools.randomNum(standardArr[0].x, standardArr[1].x), Tools.randomNum(standardArr[2].y, standardArr[0].y)))
                var c = node.getComponent("Enemy")
                c.init(i + 1, GameApp.dataManager.jsonData.RobotName[i])
                GameApp.dataManager.globalData.allRoleArr.push(c)
            }, this.allObjectNode)
        }
        // var index = 0
        var func = function () {
            if (i == 30) return
            if (i + 1 == GameApp.dataManager.userData.choosedSkinId) {

            } else {
                GameApp.uiManager.showGameObject('Enemy', (node) => {
                    // GameApp.dataManager.globalData.allRoleArr.push(node)
                    node.getComponent(cc.PhysicsBoxCollider).tag = tagNum++
                    node.setPosition(cc.v2(Tools.randomNum(standardArr[0].x, standardArr[1].x), Tools.randomNum(standardArr[2].y, standardArr[0].y)))
                    var c = node.getComponent("Enemy")
                    c.init(i + 1, GameApp.dataManager.jsonData.RobotName[i])
                    GameApp.dataManager.globalData.allRoleArr.push(c)
                    GameApp.eventManager.emit(EventNames.EVENT_SHOW_ALLROLENUM_UI)
                }, this.allObjectNode)
            }
            i++
        }.bind(this)
        this.schedule(func, 0.5, 25, 0) // 0.5
    },
    sortAll() {
        var cloneObjArr = this.allObjectNode.children.concat()
        var tempDict = []
        var tempIndex = []
        for (let i in cloneObjArr) {
            if (GameApp.uiManager.isInMapSight(cloneObjArr[i])) {
                tempDict.push({
                    y: cloneObjArr[i].y,
                    index: i
                })
                tempIndex.push(i)
            }
        }
        // console.log(tempDict)
        tempDict.sort((a, b) => b.y - a.y)
        for (let i in tempDict) {
            cloneObjArr[tempDict[i].index].setSiblingIndex(tempIndex[i])
        }
        // console.log(tempDict)
        // console.log(this.allObjectNode.children)
    }
});


