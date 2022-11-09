import { SpeedType } from 'JoystickCommon'

cc.Class({
    extends: cc.Component,
    properties: {

        // from joystick
        moveDir: {
            default: cc.v2(1, 0),
            displayName: 'Move Dir',
            tooltip: '移动方向',
        },
        _speedType: {
            default: SpeedType.STOP,
            displayName: 'Speed Type',
            type: SpeedType,
            tooltip: '速度级别'
        },

        // from self
        _moveSpeed: {
            default: 0,
            displayName: 'Move Speed',
            tooltip: '移动速度'
        },

        stopSpeed: {
            default: 0,
            type: cc.Integer,
            tooltip: '停止时速度'
        },
        // normalSpeed: {//暂时不用
        //     default: 100,
        //     type: cc.Integer,
        //     tooltip: '正常速度'
        // },
        // fastSpeed: {//暂时不用
        //     default: 200,
        //     type: cc.Integer,
        //     tooltip: '最快速度'
        // },

        roleAnim: {
            default: null,
            type: sp.Skeleton,
            tooltip: '角色的Spine动画组件',
        },
        _gunDir: {
            default: cc.v2(1, 0),
        },
        gunAnim: {
            default: null,
            type: sp.Skeleton,
            tooltip: '枪的Spine动画组件',
        },
        gunNode: {
            default: null,
            type: cc.Node,
            tooltip: '枪节点',
        },
        _haveGun: false,
        gunData: {
            default: {}
        },
        skinData: {
            default: {}
        },
        _pbc: cc.PhysicsBoxCollider,
        nameUI: cc.Label,
        bulletPrefab: cc.Prefab,

        tempGroundWeapon: null,

        hpBar: cc.ProgressBar,
        amoBar: cc.ProgressBar,

        starNode: cc.Node,
        lastHitBullet: null, //避免被火箭筒的爆炸范围或导弹头重复计算伤害
        _isAim: false,//瞄准状态，此状态下枪不可自主转向，避免鬼畜
        _aimTimer: 0,
        _aimInterval: 0.05,
        _stepTimer: 0,
        _stepInterval: 0.3,
        _isDie: false,
        arrowNode: cc.Node,
        _mapNoGun: false,
        _isProtect: false,
        _isGas: false,
        _inGasTimer: 0,
        _inGasInterval: 0.5,
    },
    onLoad() {
        GameApp.eventManager.on(EventNames.EVENT_PLAYER_SHOOT, this.shoot.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_PLAYER_RELOAD, this.reload.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_PICKUP_WEAPON, this.pickUpWeapon.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_TOPBAR_SHOW, this.updatePlayerTopBarShow.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_AIM, this.aimState.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_THEGAMESTART, this.theGameStart.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_FLASH, this.doFlash.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_RESUME_HEALTH, this.doResumeHealth.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_UPDATE_STAR_SHOW, this.updateStarShow.bind(this))
        this._pbc = this.getComponent(cc.PhysicsBoxCollider)
        // console.log(this._pbc)
        this._pbc.tag = Tags.player
    },
    onEnable() {

    },
    onDisable() {

    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_PLAYER_SHOOT)
        GameApp.eventManager.removeListener(EventNames.EVENT_PLAYER_RELOAD)
        GameApp.eventManager.removeListener(EventNames.EVENT_PICKUP_WEAPON)
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_TOPBAR_SHOW)
        GameApp.eventManager.removeListener(EventNames.EVENT_AIM)
        GameApp.eventManager.removeListener(EventNames.EVENT_THEGAMESTART)
        GameApp.eventManager.removeListener(EventNames.EVENT_FLASH)
        GameApp.eventManager.removeListener(EventNames.EVENT_RESUME_HEALTH)
        GameApp.eventManager.removeListener(EventNames.EVENT_UPDATE_STAR_SHOW)

    },
    init() {
        // this.schedule(() => {
        //     console.log(GameApp.dataManager.userData.choosedSkinId)
        //     GameApp.dataManager.setSkinId(GameApp.dataManager.userData.choosedSkinId += 1)
        // }, 2);
        if (GameApp.dataManager.globalData.isInGame) {
            this.roleProtect()
        }
        this.skinData = GameApp.dataManager.jsonData.SkinsData[GameApp.dataManager.userData.choosedSkinId - 1]
        this.initNameShow()
        this.initSkinShow()

    },
    roleProtect() {
        GameApp.audioManager.playEffect('noticeFindGun', 0.5)
        if (!this._haveGun) {
            this._isProtect = true
            this.arrowNode.active = true
        }
        this.node.opacity = 100
    },
    theGameStart() {
        this._isProtect = false
        this.node.opacity = 255
    },
    doFlash() {
        if (this._isDie) return;
        this.move(null, true)
    },
    doResumeHealth() {
        if (this._isDie) return;
        this.resumeHealth(GameApp.dataManager.getResumeHealthNum())
    },
    resumeHealth(_num) {
        this.node.runAction(cc.sequence(cc.callFunc(() => {
            GameApp.uiManager.showGameObject("InfoLabel", (node) => {
                node.getComponent(cc.RichText).string = "<b><color=green>+" + _num + "</color></b>"
                let init = cc.callFunc(() => {
                    GameApp.dataManager.addHp(_num)
                    node.setPosition(0, 110)
                })
                let seq = cc.sequence(init, cc.spawn(cc.fadeIn(0.2), cc.scaleTo(0, 1.5), cc.moveTo(0.3, cc.v2(0, 190))), cc.fadeOut(0.3), cc.callFunc(() => {
                    node.destroy()
                }))
                node.runAction(seq)
            }, this.node)
        }), cc.delayTime(0.3)).repeat(4))
    },
    updateStarShow() {
        var _sum = 0
        for (var i = 0; i < 4; i++) {
            _sum += GameApp.dataManager.globalData.getItemAttrArr[i].rank
        }
        if (_sum == 0) {
            // console.log("没有星")
            this.starNode.active = false
        } else {
            var level = parseInt((_sum - 1) / 3)
            var starNum = _sum - level * 3
            // console.log(level)
            // console.log(starNum)
            this.starNode.children[0].getComponent(cc.Sprite).spriteFrame = GameApp.uiManager.commonAtlas.getSpriteFrame("level_bg_" + (level + 1))
            this.starNode.children[1].getComponent(cc.Sprite).spriteFrame = GameApp.uiManager.commonAtlas.getSpriteFrame("level_star_" + (level + 1) + "_" + starNum)
            this.starNode.active = true
            // console.log(this.starNode)
        }
    },
    initNameShow() {
        this.nameUI.string = GameApp.dataManager.userData.playerName
        // var colorIndex = Math.floor((this.skinData.skinid - 1) / 5)
        // this.nameUI.node.color = new cc.Color().fromHEX(NameColor[colorIndex]);
    },
    initSkinShow() {
        if (GameApp.dataManager.userData.choosedSkinId < 21) {
            this.roleAnim.skeletonData = GameApp.uiManager.normalSkinData
            this.roleAnim.setSkin(this.skinData.skinname)
        } else {
            this.roleAnim.skeletonData = GameApp.uiManager.advanceSkinDataGroup[GameApp.dataManager.userData.choosedSkinId - 21]
        }
        var arr = GameApp.dataManager.userData.choosedSkinId < 21 ? ['await'] : ['await_fight_1']
        this.roleAnim.setAnimation(0, arr[0], true)
    },
    updatePlayerTopBarShow() {
        this.hpBar.progress = GameApp.dataManager.globalData.curHp / GameApp.dataManager.globalData.maxHp
        this.amoBar.progress = GameApp.dataManager.globalData.curAmoNum / GameApp.dataManager.globalData.maxAmoNum
    },
    // methods
    move(dt, _flash) {
        if (_flash) {
            var _borderGroup = GameApp.uiManager.getGame("GameMap").getComponent("GameMap").enemySpawnPosGroupNode.children
            // console.log(_borderGroup)
            let newPos1 = this.node.position.add(this.moveDir.mul(1000));
            if (newPos1.x < _borderGroup[0].x) {
                newPos1.x = _borderGroup[0].x
            }
            if (newPos1.x > _borderGroup[1].x) {
                newPos1.x = _borderGroup[1].x
            }
            if (newPos1.y > _borderGroup[0].y) {
                newPos1.y = _borderGroup[0].y
            }
            if (newPos1.y < _borderGroup[2].y) {
                newPos1.y = _borderGroup[2].y
            }
            this.node.setPosition(newPos1);
            GameApp.audioManager.playEffect('flash')
            return;
        }
        if (this._moveSpeed != 0) {
            this._stepTimer -= dt;
            if (this._stepTimer < 0) {
                this._stepTimer = this._stepInterval
                GameApp.audioManager.playEffect('run', 0.3)
            }
        }
        var theAngle = 90 - cc.misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x))
        if (theAngle > 180 || theAngle < 0) {
            this.roleAnim.node.scaleX = -1
        } else {
            this.roleAnim.node.scaleX = 1
        }
        let newPos = this.node.position.add(this.moveDir.mul(this._moveSpeed * dt));
        this.node.setPosition(newPos);
        GameApp.eventManager.emit(EventNames.EVENT_UPDATE_MIPMAP_PLAYER, cc.v2(this.node.x / 50, this.node.y / 50))
        // this.roleAnim.node.setPosition(0, 0)
    },
    setSpeedType(_type) {
        if (this._isDie) return;
        if (this._speedType != _type) {
            this._speedType = _type

            var arr = GameApp.dataManager.userData.choosedSkinId < 21 ? ['await', 'run2', 'run2'] : ['await_fight_1', 'run', 'run']
            this.roleAnim && this.roleAnim.setAnimation(0, arr[_type], true)
        }
    },
    setDir(_dir) {
        if (this._isDie) return;
        this.moveDir = _dir
        if (this._isAim) return;
        this.setGunDir(_dir)
    },
    setGunDir(_dir) {
        if (!this._haveGun) return
        if (!this.gunNode) return
        if (_dir == null) {
            _dir = this.moveDir
        }
        this._gunDir = _dir
        this.gunNode.rotation = -cc.misc.radiansToDegrees(
            Math.atan2(_dir.y, _dir.x)
        );
        let theAngle = 90 - this.gunNode.rotation

        if (theAngle > 180 || theAngle < 0) {
            this.gunNode.scaleY = -1
        } else {
            this.gunNode.scaleY = 1
        }
    },
    setArrowDir(_dir) {
        this.arrowNode.setPosition(cc.v2(this.arrowNode.parent.position).add(_dir.mul(100)))
        this.arrowNode.children[0].children[0].setPosition(cc.v2(this.arrowNode.children[0].position).add(_dir.mul(30)))
        this.arrowNode.children[0].children[0].rotation = -cc.misc.radiansToDegrees(
            Math.atan2(_dir.y, _dir.x)
        );
    },
    update(dt) {
        if (this._isDie) return;
        if (GameApp.dataManager.globalData.isInGame) {
            GameApp.dataManager.globalData.lifeTime += dt
        }
        switch (this._speedType) {
            case SpeedType.STOP:
                this._moveSpeed = this.stopSpeed;
                break;
            case SpeedType.NORMAL:
                this._moveSpeed = GameApp.dataManager.globalData.curSpeed;
                // this._moveSpeed = this.fastSpeed;
                break;
            case SpeedType.FAST:
                this._moveSpeed = GameApp.dataManager.globalData.curSpeed + Math.floor(GameApp.dataManager.globalData.curSpeed * GameApp.dataManager.getEquipItemAttr(EquipType.speed));
                break;
            default:
                break;
        }
        this.move(dt);
        this.checkGas(dt)
        if (!this._haveGun && !this._mapNoGun) {
            this._aimTimer -= dt
            if (this._aimTimer < 0) {
                this._aimTimer = this._aimInterval
                this.arrowToNearestGun()
            }
        }

        if (this._isProtect) return

        if (this._isAim) {
            this._aimTimer -= dt
            if (this._aimTimer < 0) {
                this._aimTimer = this._aimInterval
                this.aimToNearest()
            }
        } else {
            this._aimTimer = 0
        }
    },
    lateUpdate(dt) {
        // this.mainC.node.setPosition(this.player.position)
        // this.testC.node.setPosition(this.player.position)
        GameApp.uiManager.mapCamera.node.setPosition(this.node.position)
        // this.mipmapCamera.node.setPosition(this.node.position)
    },
    checkGas(dt) {
        if (GameApp.dataManager.globalData.gasConfig != null) {
            let distance = cc.v2(GameApp.dataManager.globalData.gasConfig.safePosition).sub(cc.v2(this.node.position)).mag()
            if (distance > GameApp.dataManager.globalData.gasConfig.gasCircle / 2) {
                this._inGasTimer -= dt
                if (this._inGasTimer < 0) {
                    this._inGasTimer = this._inGasInterval
                    this.beDamage(5, -1)
                }
                this._isGas = true
            } else {
                this._isGas = false
            }
        } else {
            this._isGas = false
        }
    },
    aimState(event) {
        if (this._isDie) return;
        if (!this._haveGun) return
        this._isAim = event
        if (this._isAim) {
            this.aimToNearest()
        }
    },
    aimToNearest() {
        var allRoleArr = GameApp.dataManager.globalData.allRoleArr.concat()
        // for (let i = 0; i < allRoleArr.length; i++) {
        //     if (allRoleArr[i].skinData.skinid == this.skinData.skinid) {
        //         allRoleArr.splice(i, 1)
        //         break
        //     }
        // }
        Tools.removeArray(allRoleArr, this.getComponent("Player"))
        var minDis = 1000000;
        var index = -1;
        for (let i = 0; i < allRoleArr.length; i++) {
            // if (GameApp.uiManager.isInMapSight(allRoleArr[i].node)) {
            var distance = cc.v2(allRoleArr[i].node.position).sub(cc.v2(this.node.position)).mag()
            if (distance < minDis && distance < this.gunData.range * 1.4) {
                minDis = distance
                index = i
            }
            // }
        }
        var dir = null
        if (index == -1) {
            this._isAim = false
        } else {
            this._isAim = true
            var aimEnemy = allRoleArr[index].node
            dir = cc.v2(aimEnemy.position).sub(cc.v2(this.node.position)).normalize()
        }
        this.setGunDir(dir)
    },
    arrowToNearestGun() {
        var allGunArr = GameApp.dataManager.globalData.allGunArr.concat()
        var minDis = 1000000;
        var index = -1;
        for (let i = 0; i < allGunArr.length; i++) {
            var distance = cc.v2(allGunArr[i].position).sub(cc.v2(this.node.position)).mag()
            if (distance < minDis) {
                minDis = distance
                index = i
            }
        }
        var dir = null
        if (index == -1) {
            this._mapNoGun = true
            this.arrowNode.active = false
        } else {
            var aimGun = allGunArr[index]
            dir = cc.v2(aimGun.position).sub(cc.v2(this.node.position)).normalize()
            this.setArrowDir(dir)
        }
    },
    shoot() {
        if (this._isDie) return;
        if (!this._haveGun) return
        if (GameApp.dataManager.reduceAmo()) {

            this.gunAnim.setAnimation(0, 'attack_' + this.gunData.skinname, false)
            var power = Math.ceil(this.gunData.power * (GameApp.dataManager.globalData.curDamage + GameApp.dataManager.getEquipItemAttr(EquipType.damage)))
            var isCrit = false
            if (Tools.isCrit(GameApp.dataManager.globalData.curCrit + GameApp.dataManager.getEquipItemAttr(EquipType.crit))) {
                power *= 2
                isCrit = true
            }
            if (this.gunData.weaponid == 1002) {
                GameApp.audioManager.playEffect('shot_shoot', 0.6)
                var bullet1 = cc.instantiate(this.bulletPrefab)
                var bullet2 = cc.instantiate(this.bulletPrefab)
                var bullet3 = cc.instantiate(this.bulletPrefab)
                let bulletPos = this.node.parent.parent.convertToNodeSpaceAR(this.gunNode.children[0].convertToWorldSpaceAR(cc.v2(0, 0)))
                bullet1.parent = bullet2.parent = bullet3.parent = this.node.parent.parent
                bullet1.setPosition(bulletPos)
                bullet2.setPosition(bulletPos)
                bullet3.setPosition(bulletPos)
                bullet1.rotation = this.gunNode.rotation
                bullet2.rotation = this.gunNode.rotation + 30
                bullet3.rotation = this.gunNode.rotation - 30
                var cloneGunDir = cc.v2(this._gunDir)
                var bulletC1 = bullet1.getComponent('Bullet')
                bulletC1._belongTag = this._pbc.tag
                bulletC1._belongName = GameApp.dataManager.userData.playerName
                bulletC1._flyDir = cloneGunDir
                bulletC1.init(this.gunData, power, isCrit)
                var bulletC2 = bullet2.getComponent('Bullet')
                bulletC2._belongTag = this._pbc.tag
                bulletC2._belongName = GameApp.dataManager.userData.playerName
                bulletC2._flyDir = cloneGunDir.rotate(-cc.misc.degreesToRadians(30))
                bulletC2.init(this.gunData, power, isCrit)
                var bulletC3 = bullet3.getComponent('Bullet')
                bulletC3._belongTag = this._pbc.tag
                bulletC3._belongName = GameApp.dataManager.userData.playerName
                bulletC3._flyDir = cloneGunDir.rotate(-cc.misc.degreesToRadians(-30))
                bulletC3.init(this.gunData, power, isCrit)
            } else {
                if (this.gunData.weaponid == 1003 || this.gunData.weaponid == 1103) {
                    GameApp.audioManager.playEffect('charge_shoot', 0.6)
                } else if (this.gunData.weaponid == 1005 || this.gunData.weaponid == 1105) {
                    GameApp.audioManager.playEffect('missile_shoot', 0.6)
                } else if (this.gunData.weaponid == 1102) {
                    GameApp.audioManager.playEffect('shot_shoot', 0.6)
                }
                var bullet = cc.instantiate(this.bulletPrefab)
                let bulletPos = this.node.parent.parent.convertToNodeSpaceAR(this.gunNode.children[0].convertToWorldSpaceAR(cc.v2(0, 0)))
                bullet.parent = this.node.parent.parent
                bullet.setPosition(bulletPos)
                bullet.rotation = this.gunNode.rotation
                var bulletC = bullet.getComponent('Bullet')
                bulletC._belongTag = this._pbc.tag
                bulletC._belongName = GameApp.dataManager.userData.playerName
                bulletC._flyDir = this._gunDir
                bulletC.init(this.gunData, power, isCrit)
            }
            this.updatePlayerTopBarShow()
        } else {
            GameApp.uiManager.getUI(GameApp.uiManager.uiRoot.children[0].name).getComponent(GameApp.uiManager.uiRoot.children[0].name).reloadBtnClick()
        }
        if (GameApp.dataManager.globalData.curAmoNum == 0) {
            GameApp.uiManager.getUI(GameApp.uiManager.uiRoot.children[0].name).getComponent(GameApp.uiManager.uiRoot.children[0].name).reloadBtnClick()
        }
    },
    reload() {
        if (this._isDie) return;
        if (!this._haveGun) return
        GameApp.audioManager.playEffect('reload', 0.6)
        this.gunAnim.setAnimation(0, 'reload_' + this.gunData.skinname, false)
    },
    equipWeapon(_kind) {
        GameApp.audioManager.playEffect('pick_item', 0.6)
        this.gunData = GameApp.dataManager.jsonData.WeaponData[_kind]
        this._haveGun = true
        this.arrowNode.active = false
        GameApp.eventManager.emit(EventNames.EVENT_SHOW_RELOAD_UI, true)
        GameApp.dataManager.globalData.shootInterval = this.gunData.shootdelay
        GameApp.dataManager.globalData.reloadInterval = this.gunData.reloaddelay
        GameApp.dataManager.globalData.maxAmoNum = this.gunData.clipnum
        GameApp.dataManager.reloadAmo()
        this.gunNode.active = true
        if (_kind < 3) {
            this.gunAnim.skeletonData = GameApp.uiManager.gunSkinDataGroup[0]
        } else {
            this.gunAnim.skeletonData = GameApp.uiManager.gunSkinDataGroup[1]
        }
        this.gunAnim.setSkin(this.gunData.skinname)
        this.setGunDir(this.moveDir)

        // this.gunAnim.setAnimation(0, 'attack_' + this.gunData.skinname, false)
    },
    getItem() {

    },
    onBeginContact(contact, self, other) {
        if (self.tag == Tags.empty) return;
        if (other.tag == Tags.item) {
            var groundItem = other.node.getComponent('GroundItem')
            if (groundItem.itemType._type == ItemType.weapon) {
                this.tempGroundWeapon = groundItem
                if (!this._haveGun) {
                    Tools.removeArray(GameApp.dataManager.globalData.allGunArr, other.node)
                    this.pickUpWeapon()
                } else {
                    GameApp.eventManager.emit(EventNames.EVENT_SHOW_GUN_UI, true, GameApp.dataManager.jsonData.WeaponData[groundItem.itemType._kind])
                }
                // var _kind = groundItem.itemType._kind
                // if (!this._haveGun) {
                //     other.node.destroy()
                // } else {
                //     let _param = {
                //         _type: ItemType.weapon,
                //         _kind: GameApp.dataManager.jsonData.WeaponData.indexOf(this.gunData)
                //     }
                //     groundItem.init(_param)
                // }
                // this.equipWeapon(_kind)
            } else if (groundItem.itemType._type == ItemType.item) {
                this.getItem()
            }
        } else if (other.tag == Tags.bullet) {
            if (!GameApp.dataManager.globalData.isInGame) return;
            if (this._isDie) return
            var bC = other.node.getComponent('Bullet')
            if (bC._belongTag == self.tag) return
            if (other.node == this.lastHitBullet) return;
            this.lastHitBullet = other.node
            this.beDamage(bC._power, bC._belongTag, bC._belongName, bC._isCrit)
        } else if (other.tag == Tags.boom) {
            if (this._isDie) return
            this.beDamage(999, -2)
        }
    },
    onEndContact(contact, self, other) {
        if (self.tag == Tags.empty) return;
        if (other.tag == Tags.item) {
            var groundItem = other.node.getComponent('GroundItem')
            if (groundItem.itemType._type == ItemType.weapon) {
                // console.log("初始化")
                this.tempGroundWeapon = null
                GameApp.eventManager.emit(EventNames.EVENT_SHOW_GUN_UI, false)
            } else if (groundItem.itemType._type == ItemType.item) {

            }
        }
    },

    pickUpWeapon() {
        var _kind = this.tempGroundWeapon.itemType._kind
        if (!this._haveGun) {
            this.tempGroundWeapon.node.destroy()
        }
        else {
            let _param = {
                _type: ItemType.weapon,
                _kind: GameApp.dataManager.jsonData.WeaponData.indexOf(this.gunData)
            }
            this.tempGroundWeapon.init(_param)
            GameApp.eventManager.emit(EventNames.EVENT_SHOW_GUN_UI, true, this.gunData)
        }
        this.equipWeapon(_kind)
    },
    beDamage(_power, _belongIndex, _belongName, _isCrit) {
        GameApp.uiManager.showGameObject("InfoLabel", (node) => {
            var originPos = node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0.5, 0.5)))
            node.setPosition(originPos)
            //皮肤减伤+装备减伤
            var _isDef = Math.ceil(_power * GameApp.dataManager.globalData.curDef) + Math.ceil(_power * GameApp.dataManager.getEquipItemAttr(EquipType.def))
            _power -= _isDef
            var str = "<color=red>-" + _power + "</color>"
            if (_isCrit) {
                str = "<color=red>暴击-" + _power + "</color>"
            }
            if (_isDef) {
                str += "<color=#0fffff>减伤" + _isDef + "</color>"
            }
            node.getComponent(cc.RichText).string = "<b>" + str + "</b>"
            let desPos = cc.v2(Tools.randomNum(60, 100), Tools.randomNum(60, 100))
            let bezier = [originPos, cc.v2(originPos.x + desPos.x - 20, originPos.y + desPos.y + 20), originPos.add(desPos)];
            let seq = cc.sequence(cc.spawn(cc.fadeIn(0.2), cc.scaleTo(0.3, 1.5), cc.bezierTo(0.3, bezier)), cc.delayTime(0.5), cc.fadeOut(0.3), cc.callFunc(() => {
                node.destroy()
            }))
            node.runAction(seq)
        }, this.node.parent.parent)
        if (GameApp.dataManager.reduceHp(_power)) {
            // console.log('收到子弹攻击')
        } else {
            // console.log('死掉了!!!!!!')
            GameApp.audioManager.playEffect('maleDeath', 0.5)
            this.node.parent = GameApp.uiManager.getGame("GameMap").getChildByName("DeadObjectNode")
            this._pbc.enabled = false
            this._isDie = true
            if (_belongIndex == -1) {
                GameApp.uiManager.showToast(GameApp.dataManager.userData.playerName + " 被毒出局")
            } else if (_belongIndex == -2) {
                GameApp.uiManager.showToast(GameApp.dataManager.userData.playerName + " 被轰炸出局")
            } else {
                var killNum = GameApp.dataManager.addKillNum(_belongIndex, _belongName)
                if (killNum > 1) {
                    var soundIndex = killNum > 5 ? 5 : killNum
                    GameApp.audioManager.playEffect('kill' + soundIndex, 0.5)
                    GameApp.uiManager.showToast(_belongName, null, killNum)
                } else {
                    GameApp.uiManager.showToast(_belongName + " 击杀了 " + GameApp.dataManager.userData.playerName)
                }
            }

            // for (var i in GameApp.dataManager.globalData.allRoleArr) {
            //     if (GameApp.dataManager.globalData.allRoleArr[i].skinData.skinid == this.skinData.skinid) {
            //         GameApp.dataManager.globalData.allRoleArr.splice(i, 1)
            //         break
            //     }
            // }
            if (this._haveGun) {
                var theParentC = GameApp.uiManager.gameRoot.children[0].getComponent("GameMap")
                GameApp.uiManager.showGameObject("GroundItem", (node) => {
                    let ddd = theParentC.allGunNode.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0, 0)))
                    node.parent = theParentC.allGunNode
                    node.setPosition(ddd)
                    let _param = {
                        _type: ItemType.weapon,
                        _kind: Tools.getIndex(GameApp.dataManager.jsonData.WeaponData, this.gunData)
                    }
                    // console.log(_param._kind)
                    node.getComponent('GroundItem').init(_param)
                    GameApp.dataManager.globalData.allGunArr.push(node)
                })
            }
            var arr = GameApp.dataManager.userData.choosedSkinId < 21 ? ['dead'] : ['dead2']
            this.roleAnim.setAnimation(0, arr[0], false)
            this.gunNode.active = false
            Tools.removeArray(GameApp.dataManager.globalData.allRoleArr, this.node.getComponent('Player'))
            var theRank = GameApp.dataManager.globalData.allRoleArr.length
            GameApp.uiManager.getPopup("OverPopup") == null && GameApp.uiManager.showPopup("OverPopup", (node) => {
                node.getComponent("OverPopup").init(false, theRank + 1)
            })
            GameApp.eventManager.emit(EventNames.EVENT_SHOW_ALLROLENUM_UI)

        }
    }
});
