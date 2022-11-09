
cc.Class({
    extends: cc.Component,

    properties: {
        tiledMap: cc.TiledMap,
        objectPrefab: cc.Prefab,
        colliderPrefab: cc.Prefab,
        groundItemPrefab: cc.Prefab,

        allObjectNode: cc.Node,
        allColliderNode: cc.Node,
        allGunNode: cc.Node,
        otherGunPos: cc.Node,
        enemySpawnPosGroupNode: cc.Node,
        paratrooperNode: cc.Node,
        cloudNode: cc.Node,

        mapAtlas: cc.SpriteAtlas,

        _timer0: 0.1,
        _timer: 0.1,
        readyToSort: false,

        gasPanel: cc.Node,
        dropPanel: cc.Node,
        boomPanel: cc.Node,
        safeCircle: 10240,
        safePosition: cc.v2(0, 0),
        _gasState: 0,
        safeCircle: 0,
        _dropTime: 0,
        _mipBoxGroup: [],
    },
    onLoad() {
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_GAS_SHOW, this.updateGasShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_DROP_BOX, this.dropBox.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_NOTYFY_BOX_DISMISS, this.notifyBoxDismiss.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_DROP_BOOM, this.dropBoom.bind(this))

        this.initMapShow()
        // this.showCloud()
        // this.showPlayer()
        // this.showEnemy()
    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_GAS_SHOW)
        GameApp.eventManager.removeListener(EventNames.EVENT_DROP_BOX)
        GameApp.eventManager.removeListener(EventNames.EVENT_NOTYFY_BOX_DISMISS)
        GameApp.eventManager.removeListener(EventNames.EVENT_DROP_BOOM)

    },
    init(_chooseType, _bili, _speedUpJump) {
        this.showCloud(_speedUpJump)
        this.showParatrooperPlayer(_chooseType, _bili)
        this.schedule(() => {
            this.showParatrooperEnemy(_chooseType, Tools.randomNum(0, 100) / 100)
        }, 0.1, 29, 0.5)
        this.initGas()
    },
    update(dt) {
        this.gasCountDown(dt)
        if (!this.readyToSort) return;
        this._timer -= dt
        if (this._timer < 0) {
            this._timer = this._timer0
            this.sortAll()
        }
    },
    initGas() {
        this.gasPanel.children[1].width = this.gasPanel.children[1].height = 10240 * (300 / 204)
        // this.gasPanel.children[0].width = this.gasPanel.children[0].height = this.gasPanel.children[1].width / 0.98
        this.gasPanel.children[1].runAction(cc.sequence(cc.fadeTo(1, 200), cc.fadeTo(0.8, 255)).repeatForever())
    },
    updateGasShow(_state, event) {
        this._gasState = _state
        this.safeCircle = 10240 * (event.safeCircle / 204)
        this.safePosition.x = 10240 * (event.safePosition.x / 204)
        this.safePosition.y = 10240 * (event.safePosition.y / 204)

        GameApp.dataManager.globalData.gasConfig = {
            safePosition: this.gasPanel.children[1].position,
            gasCircle: this.gasPanel.children[1].width
        }
    },
    gasCountDown(dt) {
        if (this.safeCircle < 0) {
            return
        }
        if (this._gasState == 2) {
            // console.log(this.gasPanel.children[1].width)
            if (this.gasPanel.children[1].width <= this.safeCircle) {
                this.gasPanel.children[1].width = this.gasPanel.children[1].height = this.safeCircle
                // this.gasPanel.children[0].width = this.gasPanel.children[0].height = this.safeCircle / 0.98
                if (this.safeCircle <= 0) {
                    this.safeCircle -= 50//为了变成负数
                    return
                }
                return
            }

            let delt = dt * ((10 / 204) * 10240)
            this.gasPanel.children[1].width -= delt
            this.gasPanel.children[1].height -= delt
            // this.gasPanel.children[0].width -= delt
            // this.gasPanel.children[0].height -= delt
            GameApp.dataManager.globalData.gasConfig = {
                safePosition: this.gasPanel.children[1].position,
                gasCircle: this.gasPanel.children[1].width
            }
            if (this.safeCircle == 50) return
            if (!Tools.isIntersect(this.gasPanel.children[1].position, this.gasPanel.children[1].width / 2, this.safePosition, this.safeCircle / 2)) {

            } else {
                if (Math.abs(this.gasPanel.children[1].width - this.safeCircle) > 0.01)  //外圈和内圈圆心重合,半径相同
                {
                    // k = y/x
                    // y = kx
                    // x^2+y^2 = 1
                    // x^2 = 1/(k^2+1)
                    var k = (this.gasPanel.children[1].y - this.safePosition.y) / (this.gasPanel.children[1].x - this.safePosition.x);

                    var x_off = delt * parseFloat(Math.sqrt(1 / (k * k + 1)))

                    // 通过mPoint_outer和mPoint_inner的x坐标来判断此时外圆圆心要移动的是该 + x_off（x轴偏移量）还是 -x_off
                    this.gasPanel.children[1].x += 1 * (this.gasPanel.children[1].x < this.safePosition.x ? 1 : -1) * x_off;
                    // 知道变化后的外圈圆心的x坐标，和直线方程来求对应的y坐标
                    this.gasPanel.children[1].y = k * (this.gasPanel.children[1].x - this.safePosition.x) + this.safePosition.y;
                    // // 通过mPoint_outer和mPoint_inner的x坐标来判断此时外圆圆心要移动的是该 + x_off（x轴偏移量）还是 -x_off
                    // this.gasPanel.children[0].x += 1 * (this.gasPanel.children[1].x < this.safePosition.x ? 1 : -1) * x_off;
                    // // 知道变化后的外圈圆心的x坐标，和直线方程来求对应的y坐标
                    // this.gasPanel.children[0].y = k * (this.gasPanel.children[1].x - this.safePosition.x) + this.safePosition.y;

                    GameApp.dataManager.globalData.gasConfig = {
                        safePosition: this.gasPanel.children[1].position,
                        gasCircle: this.gasPanel.children[1].width
                    }
                }
            }
        }
    },
    dropBox(_thePos, _index) {
        _thePos = (_thePos.div(204)).mul(10240)
        GameApp.uiManager.showGameObject("DropBox", (node) => {
            this._mipBoxGroup.push(node)
            GameApp.dataManager.globalData.allBoxArr.push(node)
            node.setPosition(_thePos)
            node.getComponent("DropBox").init(Tools.getIndex(this._mipBoxGroup, node))
            GameApp.eventManager.emit(EventNames.EVENT_NOTIFY_ENEMY_MAPBOX)
        }, this.dropPanel)
    },
    notifyBoxDismiss(_index) {
        Tools.removeArray(GameApp.dataManager.globalData.allBoxArr, this._mipBoxGroup[parseInt(_index)])
        this._mipBoxGroup[parseInt(_index)].destroy()
    },
    dropBoom(_thePos, _theWidth) {
        _thePos = (_thePos.div(204)).mul(10240)
        _theWidth = 10240 * _theWidth / 204
        let boomArr = []
        for (let i = 0; i < 10; i++) {
            boomArr.push(Tools.pointOfRandom(_thePos, _theWidth / 2, 0))
        }
        this.dropItBoom(boomArr, 0)
    },
    dropItBoom(boomArr, _index) {
        if (_index >= boomArr.length) {
            GameApp.eventManager.emit(EventNames.EVENT_NOTYFY_BOOM_DISMISS)
            return
        }
        var _delay = Tools.randomNum(0, 2, true)
        this.node.runAction(cc.sequence(cc.delayTime(_delay), cc.callFunc(() => {
            GameApp.uiManager.showGameObject("Boom", (node) => {
                // console.log(boomArr[_index])
                node.setPosition(boomArr[_index])
                node.children[0].getComponent(sp.Skeleton).setAnimation(0, "animation", true)
                node.children[0].runAction(cc.sequence(cc.moveBy(1, cc.v2(0, -220)), cc.fadeOut(0)))
                node.children[1].runAction(cc.sequence(cc.delayTime(1), cc.callFunc(() => {
                    GameApp.audioManager.playEffect('boom')
                    var coli = node.getComponent(cc.PhysicsBoxCollider)
                    coli.enabled = true
                    var theAnim = node.children[1].getComponent(sp.Skeleton)
                    theAnim.setAnimation(0, "boom1", false)
                    theAnim.setCompleteListener(() => {
                        coli.enabled = false
                        node.destroy()
                    })
                })))
            }, this.boomPanel)
            this.dropItBoom(boomArr, ++_index)
        })))

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
    },
    showParatrooperPlayer(_chooseType, _bili) {
        GameApp.uiManager.showGameObject('ParatrooperPlayer', (node) => {
            var pC = node.getComponent('ParatrooperPlayer')
            pC.init(this.enemySpawnPosGroupNode.children)
            GameApp.uiManager.getUI("GameUI").getComponent("GameUI").joystick.getComponent("Joystick").player = pC
            var theX = 0
            var theY = 0
            if (_chooseType == 0) {
                theX = (this.enemySpawnPosGroupNode.children[3].x - this.enemySpawnPosGroupNode.children[0].x) * _bili - this.enemySpawnPosGroupNode.children[3].x
                theY = (this.enemySpawnPosGroupNode.children[3].y - this.enemySpawnPosGroupNode.children[0].y) * _bili - this.enemySpawnPosGroupNode.children[3].y
            } else {
                theX = (this.enemySpawnPosGroupNode.children[1].x - this.enemySpawnPosGroupNode.children[2].x) * _bili - this.enemySpawnPosGroupNode.children[1].x
                theY = (this.enemySpawnPosGroupNode.children[1].y - this.enemySpawnPosGroupNode.children[2].y) * _bili - this.enemySpawnPosGroupNode.children[1].y
            }
            node.setPosition(theX, theY)
        }, this.paratrooperNode)
    },
    showParatrooperEnemy(_chooseType, _bili) {
        GameApp.uiManager.showGameObject('ParatrooperEnemy', (node) => {
            node.getComponent('ParatrooperEnemy').init(this.enemySpawnPosGroupNode.children)
            var theX = 0
            var theY = 0
            if (_chooseType == 0) {
                theX = (this.enemySpawnPosGroupNode.children[3].x - this.enemySpawnPosGroupNode.children[0].x) * _bili - this.enemySpawnPosGroupNode.children[3].x
                theY = (this.enemySpawnPosGroupNode.children[0].y - this.enemySpawnPosGroupNode.children[3].y) * _bili - this.enemySpawnPosGroupNode.children[0].y
            } else {
                theX = (this.enemySpawnPosGroupNode.children[1].x - this.enemySpawnPosGroupNode.children[2].x) * _bili - this.enemySpawnPosGroupNode.children[1].x
                theY = (this.enemySpawnPosGroupNode.children[1].y - this.enemySpawnPosGroupNode.children[2].y) * _bili - this.enemySpawnPosGroupNode.children[1].y
            }
            node.setPosition(theX, theY)
            var desDir = cc.v2(0, 10).rotate(cc.misc.radiansToDegrees(Tools.randomNum(0, 360)))
            // var randTime = Tools.randomNum(2, 4)
            node.runAction(cc.repeatForever(cc.moveBy(0.1, desDir)))

        }, this.paratrooperNode)
    },
    showCloud(_speedUpJump) {
        var _jumpTime = 2
        if (_speedUpJump) {
            _jumpTime = 1
        }
        GameApp.uiManager.mapCamera.zoomRatio = 0.3
        var each0_05 = 0.3 / (3.6 + _jumpTime * 3) / 100 * 5
        var act = cc.sequence(cc.callFunc(() => {
            if (GameApp.uiManager.mapCamera.zoomRatio >= 0.8) {
                GameApp.uiManager.mapCamera.zoomRatio = 0.8
                return
            }
            GameApp.uiManager.mapCamera.zoomRatio += each0_05//0.0015625
        }), cc.delayTime(0.05)).repeatForever()
        this.cloudNode.runAction(act)
        _jumpTime = _jumpTime ? _jumpTime : 2
        this.cloudNode.runAction(cc.sequence(cc.callFunc(() => {
            this.cloudNode.children[0].active = true
        }), cc.delayTime(0.3), cc.callFunc(() => {
            GameApp.audioManager.playEffect('skydivingBegin', null, 1)
            this.cloudNode.children[1].active = true
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[2].active = true
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[3].active = true
        }), cc.delayTime(_jumpTime), cc.callFunc(() => {
            GameApp.audioManager.playEffect('skydivingWind', null, 2)
            this.cloudNode.children[0].active = false
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[1].active = true
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[2].active = true
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[3].active = true
        }), cc.delayTime(_jumpTime), cc.callFunc(() => {
            this.cloudNode.children[0].active = false
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[1].active = false
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[2].active = true
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[3].active = true
        }), cc.delayTime(_jumpTime), cc.callFunc(() => {
            this.cloudNode.children[0].active = false
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[1].active = false
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[2].active = false
        }), cc.delayTime(0.3), cc.callFunc(() => {
            this.cloudNode.children[3].active = true
        }), cc.delayTime(_jumpTime), cc.callFunc(() => {
            // console.log(GameApp.uiManager.mapCamera.zoomRatio)
            this.gameBegin(_speedUpJump)
        })))
    },
    gameBegin(_speedUpJump) {
        GameApp.dataManager.globalData.isInGame = true
        this.cloudNode.destroy()
        GameApp.uiManager.mapCamera.zoomRatio = 0.8
        GameApp.audioManager.playEffect('skydivingToGround', null, 1)
        GameApp.eventManager.emit(EventNames.EVENT_GAME_BEGIN)
        var landUpPos = this.paratrooperNode.children[0].position
        this.paratrooperNode.destroyAllChildren()
        this.showGun()
        this.showPlayer(landUpPos)
        if (_speedUpJump) {
            this.node.runAction(cc.sequence(cc.delayTime(5), cc.callFunc(() => {
                this.showEnemy()
            })))
        } else {
            this.showEnemy()
        }

    },
    showGun() {
        let wallLayer = this.tiledMap.getLayer("wall")
        this.tiledMap.getObjectGroup("grass")._objects.forEach(element => {
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
        this.otherGunPos.children.forEach(posNode => {
            let obj = cc.instantiate(this.groundItemPrefab)
            let ddd = this.allGunNode.convertToNodeSpaceAR(posNode.convertToWorldSpaceAR(cc.v2(0, 0)))
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

    showPlayer(landUpPos) {
        GameApp.uiManager.showGameObject('Player', (node) => {
            // GameApp.dataManager.globalData.allRoleArr.push(node)
            node.setPosition(landUpPos)
            var c = node.getComponent("Player")
            GameApp.uiManager.getUI("GameUI").getComponent("GameUI").joystick.getComponent("Joystick").player = c
            c.init()

            GameApp.dataManager.globalData.allRoleArr.push(c)
            // this.readyToSort = true
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
        for (let i = 0; i < 30; i++) {
            tempPosArr.push(cc.v2(Tools.randomNum(standardArr[0].x, standardArr[1].x), Tools.randomNum(standardArr[2].y, standardArr[0].y)))
        }
        // tempPosArr = Tools.getRandomAmountElementUnRepeat(tempPosArr, 30)
        var tagNum = Tags.enemy
        for (var i = 0; i < tempPosArr.length; i++) {
            if (i + 1 == GameApp.dataManager.userData.choosedSkinId) {
                continue;
            }
            GameApp.uiManager.showGameObject('Enemy', (node) => {
                // GameApp.dataManager.globalData.allRoleArr.push(node)
                node.getComponent(cc.PhysicsBoxCollider).tag = tagNum++
                node.setPosition(tempPosArr[i])
                var c = node.getComponent("Enemy")
                c.init(i + 1, GameApp.dataManager.jsonData.RobotName[i])
                GameApp.dataManager.globalData.inGameKillNum.push({
                    _killNum: 0,
                    _belongName: GameApp.dataManager.jsonData.RobotName[i]
                })
                GameApp.dataManager.globalData.allRoleArr.push(c)
                this.readyToSort = true
            }, this.allObjectNode)
        }

        GameApp.eventManager.emit(EventNames.EVENT_SHOW_ALLROLENUM_UI)
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_RANK_SHOW)
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
        tempDict.sort((a, b) => b.y - a.y)
        for (let i in tempDict) {
            cloneObjArr[tempDict[i].index].setSiblingIndex(tempDict[i])
        }
        // console.log(tempDict)
        // console.log(this.allObjectNode.children)
    }
});
