import { SpeedType } from 'JoystickCommon'

cc.Class({
    extends: cc.Component,
    properties: {

        // from joystick
        moveDir: {
            default: cc.v2(0, 0),
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
        normalSpeed: {
            default: 200,
            type: cc.Integer,
            tooltip: '正常速度'
        },
        fastSpeed: {
            default: 200,
            type: cc.Integer,
            tooltip: '最快速度'
        },

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
        _mapNoGun: false,
        _mapNoBox: true,
        thisName: "",
        gunData: {
            default: {}
        },
        skinData: {
            default: {}
        },
        _pbc: cc.PhysicsBoxCollider,
        nameUI: cc.Label,
        bulletPrefab: cc.Prefab,

        _choosedSkinId: 0,

        hpBar: cc.ProgressBar,
        amoBar: cc.ProgressBar,

        starNode: cc.Node,
        _maxHp: 100,
        _curHp: 100,
        _shootInterval: 0,
        _reloadInterval: 0,
        _maxAmoNum: 20,
        _curAmoNum: 20,

        _curDamage: 0,
        _curCrit: 0,
        _curSpeed: 200,
        _curCd: 0,
        _curDef: 0,
        _curRecovery: 0,

        getItemAttrArr: [],//伤害，防御，移速，暴击
        equipItemAttr: [],//(装备带来的属性)伤害，防御，移速，暴击


        _shootFlag: false,
        _shootTimer: 0.3,
        _reloadFlag: false,
        _reloadTimer: 0,
        lastHitBullet: null,

        _desTime: 0,//巡逻的变向频率
        _desTime2: 0,// 追踪或逃跑的变向频率
        _isAim: false,//瞄准状态，此状态下枪不可自主转向，避免鬼畜
        _aimDir: null,
        _aimTimer: 0,
        _aimInterval: 0.1,
        _isDie: false,
        _move: false,
        _isProtect: false,
        _isBlock: false,
        _isGas: false,
        _inGasTimer: 0,
        _inGasInterval: 0.5,
    },
    onLoad() {
        this.getItemAttrArr = [{
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
        this.equipItemAttr = [0, 0, 0, 0]//(装备带来的属性)伤害，防御，移速，暴击

        GameApp.eventManager.on(EventNames.EVENT_THEGAMESTART, this.theGameStart.bind(this))
        GameApp.eventManager.on(EventNames.EVENT_NOTIFY_ENEMY_MAPBOX, this.notifyMapBox.bind(this))
        // this._pbc = this.getComponent(cc.PhysicsBoxCollider)
        // this._pbc.tag = Tags.role
        this._pbc = this.getComponent(cc.PhysicsBoxCollider)
        // this._desTime = Tools.randomNum(1, 3)
    },
    onEnable() {

    },
    onDisable() {
    },
    onDestroy() {
        GameApp.eventManager.removeListener(EventNames.EVENT_THEGAMESTART)
        GameApp.eventManager.removeListener(EventNames.EVENT_NOTIFY_ENEMY_MAPBOX)
    },
    init(_index, _names) {
        // this.schedule(() => {
        //     console.log(GameApp.dataManager.userData.choosedSkinId)
        //     GameApp.dataManager.setSkinId(GameApp.dataManager.userData.choosedSkinId += 1)
        // }, 2);
        if (GameApp.dataManager.globalData.isInGame) {
            this.roleProtect()
        }
        this._choosedSkinId = _index
        this.skinData = GameApp.dataManager.jsonData.SkinsData[_index - 1]
        this.addSkinAttr()
        this.initNameShow(_names)
        this.initSkinShow()
        this.setSpeedType(SpeedType.FAST)
        // console.log(this._pbc.tag)
    },
    addSkinAttr() {
        var curSkinData = this.skinData
        this._maxHp = this._curHp = GameApp.dataManager.userData.baseHp + Math.floor(GameApp.dataManager.userData.baseHp * (curSkinData.att_hpmax / 100))
        this._curDamage = GameApp.dataManager.userData.baseDamage + curSkinData.att_damage / 100
        this._curCrit = GameApp.dataManager.userData.baseCrit + curSkinData.att_crit / 10
        this._curSpeed = GameApp.dataManager.userData.baseSpeed + Math.floor(GameApp.dataManager.userData.baseSpeed * (curSkinData.att_speed / 100))
        this._curCd = GameApp.dataManager.userData.baseCd + curSkinData.att_cd / 100
        this._curDef = GameApp.dataManager.userData.baseDef + curSkinData.att_defense / 100
        this._curRecovery = GameApp.dataManager.userData.baseRecovery + curSkinData.att_recovery / 100
    },
    roleProtect() {
        this._isProtect = true
        this.node.opacity = 0
    },
    theGameStart() {
        this.node.opacity = 255
        this._isProtect = false
    },
    notifyMapBox() {
        this._mapNoBox = false
    },
    enemyEquipBoxItem() {
        var arr = [0, 1, 2, 3]
        var _selectIndex = 0
        while (this.getItemAttrArr[_selectIndex].rank == 3) {
            Tools.removeArray(arr, _selectIndex)
            if (arr.length == 0) {
                return
            }
            _selectIndex = Tools.getRandomElement(arr)
        }

        // console.log("选择了" + _selectIndex)
        var _rank = this.getItemAttrArr[_selectIndex].rank + 1
        this.getItemAttrArr[_selectIndex] = {
            rank: _rank,
            item: ItemAttr[_selectIndex][_rank - 1]
        }
        this.equipItemAttr[_selectIndex] = this.getItemAttrArr[_selectIndex].item.attr
        this.updateStarShow()
    },
    updateStarShow() {
        var _sum = 0
        for (var i = 0; i < 4; i++) {
            _sum += this.getItemAttrArr[i].rank
        }
        if (_sum == 0) {
            this.starNode.active = false
        } else {
            var level = parseInt((_sum - 1) / 3)
            var starNum = _sum - level * 3
            this.starNode.children[0].getComponent(cc.Sprite).spriteFrame = GameApp.uiManager.commonAtlas.getSpriteFrame("level_bg_" + (level + 1))
            this.starNode.children[1].getComponent(cc.Sprite).spriteFrame = GameApp.uiManager.commonAtlas.getSpriteFrame("level_star_" + (level + 1) + "_" + starNum)
            this.starNode.active = true
        }
    },
    initNameShow(_names) {
        this.thisName = _names
        this.nameUI.string = _names
        if (!GameApp.dataManager.globalData.isInGame) {
            this.hpBar.node.active = false
        }
        // var colorIndex = Math.floor((this.skinData.skinid - 1) / 5)
        // this.nameUI.node.color = new cc.Color().fromHEX(NameColor[colorIndex]);
    },
    initSkinShow() {
        if (this._choosedSkinId < 21) {
            this.roleAnim.skeletonData = GameApp.uiManager.normalSkinData
            this.roleAnim.setSkin(this.skinData.skinname)
        } else {
            this.roleAnim.skeletonData = GameApp.uiManager.advanceSkinDataGroup[this._choosedSkinId - 21]
        }
        var arr = this._choosedSkinId < 21 ? ['await'] : ['await_fight_1']
        this.roleAnim.setAnimation(0, arr[0], true)
    },
    // methods
    move(dt) {
        // this.node.rotation = 90 - cc.misc.radiansToDegrees(
        //     Math.atan2(this.moveDir.y, this.moveDir.x)
        // );
        if (!this.moveDir) return
        var theAngle = 90 - cc.misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x))
        if (theAngle > 180 || theAngle < 0) {
            this.roleAnim.node.scaleX = -1
        } else {
            this.roleAnim.node.scaleX = 1
        }
        let newPos = this.node.position.add(this.moveDir.mul(this._moveSpeed * dt));
        this.node.setPosition(newPos);
        // this.roleAnim.node.setPosition(0, 0)
    },
    doParser(dt) {
        this._desTime -= dt
        this._desTime2 -= dt
        if (this._isAim) {
            if (this._desTime2 < 0) {
                this._desTime2 = 1
                if (this._haveGun) {
                    // console.log("追踪")
                    !this._isBlock && this.setDir(this._aimDir)
                } else {
                    // console.log("逃跑")
                    !this._isBlock && this.setDir(this._aimDir.rotate(180))
                }
            }
            return
        }
        if (GameApp.dataManager.globalData.gasConfig != null) {
            let dir = cc.v2(GameApp.dataManager.globalData.gasConfig.safePosition).sub(cc.v2(this.node.position))
            let distance = dir.mag()
            if (GameApp.dataManager.globalData.gasConfig.gasCircle > 0 && distance > GameApp.dataManager.globalData.gasConfig.gasCircle / 2) {
                this._inGasTimer -= dt
                if (this._inGasTimer < 0) {
                    this._inGasTimer = this._inGasInterval
                    this.beDamage(5, -1)
                }
                this._isGas = true
                !this._isBlock && this.setDir(dir.normalize())
                return
            } else {
                this._isGas = false
            }
        } else {
            this._isGas = false
        }

        if (this._desTime < 0) {
            //1 1 不找  1 0 找  0 1 不找  0 0 不找
            if (!this._isGas && !this._mapNoGun && !this._haveGun) {
                this._desTime = 0.3
                // console.log("找枪")
                !this._isBlock && this.searchGun()
            } else {
                if (!this._isGas && GameApp.dataManager.globalData.isInGame && !this._mapNoBox && this._haveGun) {
                    this._desTime = 0.3
                    // console.log("找箱子")
                    this.searchBox()
                } else {
                    // console.log("巡逻")
                    this._desTime = Tools.randomNum(1, 3)
                    var desDir = cc.v2(0, 1).rotate(cc.misc.radiansToDegrees(Tools.randomNum(0, 360)))
                    !this._isBlock && this.setDir(desDir)
                }

            }
        }
    },
    searchGun() {
        var allGunArr = GameApp.dataManager.globalData.allGunArr.concat()
        var minDis = 1000000;
        var index = -1;
        for (let i = 0; i < allGunArr.length; i++) {
            var distance = cc.v2(allGunArr[i].position).sub(cc.v2(this.node.position)).mag()
            if (distance < minDis) {
                if (GameApp.dataManager.globalData.gasConfig != null) {
                    let dirDistance = cc.v2(GameApp.dataManager.globalData.gasConfig.safePosition).sub(cc.v2(allGunArr[i].position)).mag()
                    if (dirDistance > GameApp.dataManager.globalData.gasConfig.gasCircle / 2) {
                        continue
                    }
                }
                minDis = distance
                index = i
            }
        }
        var dir = null
        if (index == -1) {
            this._mapNoGun = true
        } else {
            var aimGun = allGunArr[index]
            dir = cc.v2(aimGun.position).sub(cc.v2(this.node.position)).normalize()
        }
        this.setDir(dir)
    },
    searchBox() {
        var allBoxArr = GameApp.dataManager.globalData.allBoxArr.concat()
        var minDis = 1000000;
        var index = -1;
        for (let i = 0; i < allBoxArr.length; i++) {
            var distance = cc.v2(allBoxArr[i].position).sub(cc.v2(this.node.position)).mag()
            if (distance < 10) {
                this.setDir(cc.v2(0, 0))
                return;
            }
            if (distance < minDis) {
                if (GameApp.dataManager.globalData.gasConfig != null) {
                    let dirDistance = cc.v2(GameApp.dataManager.globalData.gasConfig.safePosition).sub(cc.v2(allBoxArr[i].position)).mag()
                    if (dirDistance > GameApp.dataManager.globalData.gasConfig.gasCircle / 2) {
                        continue
                    }
                }
                minDis = distance
                index = i
            }
        }
        var dir = cc.v2(0, 0)
        if (index == -1) {
            this._mapNoBox = true
        } else {
            var aimBox = allBoxArr[index]
            dir = cc.v2(aimBox.position).sub(cc.v2(this.node.position)).normalize()
        }
        this.setDir(dir)
    },
    setSpeedType(_type) {
        if (this._isDie) return;
        if (this._speedType != _type) {
            this._speedType = _type

            var arr = this._choosedSkinId < 21 ? ['await', 'run2', 'run2'] : ['await_fight_1', 'run', 'run']
            this.roleAnim.setAnimation(0, arr[_type], true)
        }
    },
    setDir(_dir) {
        if (this._isDie) return;
        if (_dir && _dir.mag() == 0) {
            this.setSpeedType(SpeedType.STOP)
        } else {
            this.setSpeedType(SpeedType.FAST)
        }
        this.moveDir = _dir
        if (this._isAim) return
        this.setGunDir(_dir)
    },
    setGunDir(_dir) {
        if (_dir == null) {
            _dir = this.moveDir
        }
        this._gunDir = _dir
        this._aimDir = _dir
        if (!this._haveGun) return
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
    update(dt) {
        if (this._isDie) return;
        this.doParser(dt)
        switch (this._speedType) {
            case SpeedType.STOP:
                this._moveSpeed = this.stopSpeed;
                break;
            case SpeedType.NORMAL:
                this._moveSpeed = this.normalSpeed;
                // this._moveSpeed = this.fastSpeed;
                break;
            case SpeedType.FAST:
                this._moveSpeed = this._curSpeed + Math.floor(this._curSpeed * this.equipItemAttr[EquipType.speed]);
                break;
            default:
                break;
        }
        this.move(dt);

        if (this._isProtect) return;

        this._aimTimer -= dt
        if (this._aimTimer < 0) {
            this._aimTimer = this._aimInterval
            this.aimToNearest()
        }
        if (this._isAim) {
            this._shootTimer -= dt
            if (this._shootTimer < 0 && !this._reloadFlag) {
                this._shootTimer = this._shootInterval
                this.shoot()
            }
        }

        if (this._reloadFlag) {
            this._reloadTimer -= dt
            if (this._reloadFlag && this._reloadTimer < 0) {
                this._reloadFlag = false
                this.reloadAmo()
            }
        }

    },
    lateUpdate(dt) {
        // this.mainC.node.setPosition(this.player.position)
        // this.testC.node.setPosition(this.player.position)
        // GameApp.uiManager.mapCamera.node.setPosition(this.node.position)
        // this.mipmapCamera.node.setPosition(this.node.position)
    },
    aimToNearest() {
        // return
        if (!this._haveGun) {
            this.gunData.range = 400
        }
        var allRoleArr = GameApp.dataManager.globalData.allRoleArr.concat()
        // for (let i = 0; i < allRoleArr.length; i++) {
        //     if (allRoleArr[i].skinData.skinid == this.skinData.skinid) {
        //         allRoleArr.splice(i, 1)
        //         break
        //     }
        // }
        Tools.removeArray(allRoleArr, this.getComponent("Enemy"))
        var minDis = 1000000;
        var index = -1;
        for (let i = 0; i < allRoleArr.length; i++) {
            var distance = cc.v2(allRoleArr[i].node.position).sub(cc.v2(this.node.position)).mag()
            if (distance < minDis && distance < this.gunData.range * 1.4) {
                minDis = distance
                index = i
            }
        }
        var dir = null
        if (index == -1) {
            this._isAim = false
        } else {
            var aimEnemy = allRoleArr[index].node
            dir = cc.v2(aimEnemy.position).sub(cc.v2(this.node.position)).normalize()
            this._isAim = true
        }
        this.setGunDir(dir)
    },

    shoot() {
        if (!this._haveGun) return
        if (this.reduceAmo()) {
            this.gunAnim.setAnimation(0, 'attack_' + this.gunData.skinname, false)
            var power = Math.ceil(this.gunData.power * (this._curDamage + this.equipItemAttr[EquipType.damage]))
            var isCrit = false
            if (Tools.isCrit(this._curCrit + this.equipItemAttr[EquipType.crit])) {
                power *= 2
                isCrit = true
            }

            if (this.gunData.weaponid == 1002) {
                GameApp.uiManager.isInMapSight(this.node) && GameApp.audioManager.playEffect('shot_shoot', 0.3, false)
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
                bulletC1._belongName = this.thisName
                bulletC1._flyDir = cloneGunDir
                bulletC1.init(this.gunData, power, isCrit)
                var bulletC2 = bullet2.getComponent('Bullet')
                bulletC2._belongTag = this._pbc.tag
                bulletC2._belongName = this.thisName
                bulletC2._flyDir = cloneGunDir.rotate(-cc.misc.degreesToRadians(30))
                bulletC2.init(this.gunData, power, isCrit)
                var bulletC3 = bullet3.getComponent('Bullet')
                bulletC3._belongTag = this._pbc.tag
                bulletC3._belongName = this.thisName
                bulletC3._flyDir = cloneGunDir.rotate(-cc.misc.degreesToRadians(-30))
                bulletC3.init(this.gunData, power, isCrit)
            } else {
                if (this.gunData.weaponid == 1003) {
                    GameApp.uiManager.isInMapSight(this.node) && GameApp.audioManager.playEffect('charge_shoot', 0.3, false)
                } else if (this.gunData.weaponid == 1005) {
                    GameApp.uiManager.isInMapSight(this.node) && GameApp.audioManager.playEffect('missile_shoot', 0.3, false)
                }
                var bullet = cc.instantiate(this.bulletPrefab)
                let bulletPos = this.node.parent.parent.convertToNodeSpaceAR(this.gunNode.children[0].convertToWorldSpaceAR(cc.v2(0, 0)))
                bullet.parent = this.node.parent.parent
                bullet.setPosition(bulletPos)
                bullet.rotation = this.gunNode.rotation
                var bulletC = bullet.getComponent('Bullet')
                bulletC._belongTag = this._pbc.tag
                bulletC._belongName = this.thisName
                bulletC._flyDir = this._gunDir
                bulletC.init(this.gunData, power, isCrit)
            }
            this.updateAmoShow()
        } else {
            this.reload()
        }
        if (this._curAmoNum == 0) {
            this.reload()
        }
    },
    reduceAmo() {
        var a = this._curAmoNum - 1
        if (a < 0) {
            this._curAmoNum = 0
            this.updateAmoShow()
            return false
        } else {
            this._curAmoNum = a
            this.updateAmoShow()
            return true
        }
    },
    reload() {
        if (!this._haveGun) return
        if (this._reloadFlag) return;
        GameApp.uiManager.isInMapSight(this.node) && GameApp.audioManager.playEffect('reload', 0.6)
        this.gunAnim.setAnimation(0, 'reload_' + this.gunData.skinname, false)
        this._reloadTimer = this._reloadInterval
        this._reloadFlag = true
    },
    reloadAmo() {
        this._curAmoNum = this._maxAmoNum
        this.updateAmoShow()
    },
    updateAmoShow() {
        this.amoBar.progress = this._curAmoNum / this._maxAmoNum
    },
    updateHpShow() {
        this.hpBar.progress = this._curHp / this._maxHp
    },
    equipWeapon(_kind) {
        GameApp.uiManager.isInMapSight(this.node) && GameApp.audioManager.playEffect('pick_item', 0.6)
        this.gunData = GameApp.dataManager.jsonData.WeaponData[_kind]
        this._shootInterval = this.gunData.shootdelay
        this._reloadInterval = this.gunData.reloaddelay
        this._maxAmoNum = this.gunData.clipnum
        this.reloadAmo()
        this.gunNode.active = true
        if (_kind < 3) {
            this.gunAnim.skeletonData = GameApp.uiManager.gunSkinDataGroup[0]
        } else {
            this.gunAnim.skeletonData = GameApp.uiManager.gunSkinDataGroup[1]
        }
        this.gunAnim.setSkin(this.gunData.skinname)
        this._haveGun = true
        this.setGunDir(this.moveDir)
        // this.gunAnim.setAnimation(0, 'attack_' + this.gunData.skinname, false)
    },
    getItem() {

    },
    onBeginContact(contact, self, other) {
        if (this._isDie) return
        if (self.tag == Tags.empty) return;
        if (other.tag == Tags.item) {
            var groundItem = other.node.getComponent('GroundItem')
            if (groundItem.itemType._type == ItemType.weapon) {
                var _kind = groundItem.itemType._kind
                if (!this._haveGun) {
                    Tools.removeArray(GameApp.dataManager.globalData.allGunArr, other.node)
                    this.equipWeapon(_kind)
                    other.node.destroy()
                } else {
                    // let _param = {
                    //     _type: ItemType.weapon,
                    //     _kind: GameApp.dataManager.jsonData.WeaponData.indexOf(this.gunData)
                    // }
                    // groundItem.init(_param)
                }
                // this.equipWeapon(_kind)
            } else if (groundItem.itemType._type == ItemType.item) {
                this.getItem()
            }
        } else if (other.tag == Tags.bullet) {
            if (!GameApp.dataManager.globalData.isInGame) return;
            var bC = other.node.getComponent('Bullet')
            if (bC._belongTag == self.tag) return
            if (other.node == this.lastHitBullet) return;
            this.lastHitBullet = other.node
            this.beDamage(bC._power, bC._belongTag, bC._belongName, bC._isCrit, bC.gunData.weaponid)
        } else if (other.tag == Tags.collider) {
            this._isBlock = true
            this.moveDir && this.moveDir.rotateSelf(cc.misc.degreesToRadians(Tools.randomNum(90, 180)))
            this.scheduleOnce(() => {
                this._isBlock = false
            }, 0.5)
        } else if (other.tag == Tags.boom) {
            this.beDamage(999, -2)
        }
    },
    reduceHp(_num) {
        var a = this._curHp - _num
        if (a <= 0) {
            this._curHp = 0
            this.updateHpShow()
            return false
        } else {
            this._curHp = a
            this.updateHpShow()
            return true
        }
    },
    beDamage(_power, _belongIndex, _belongName, _isCrit, _weaponid) {
        GameApp.uiManager.isInMapSight(this.node) && GameApp.uiManager.showGameObject("InfoLabel", (node) => {
            var originPos = node.parent.convertToNodeSpaceAR(this.node.convertToWorldSpaceAR(cc.v2(0.5, 0.5)))
            node.setPosition(originPos)
            var _isDef = Math.ceil(_power * this._curDef) + Math.ceil(_power * this.equipItemAttr[EquipType.def])
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
        // console.log(GameApp.dataManager.globalData.allRoleArr)
        if (this.reduceHp(_power)) {

        } else {
            GameApp.uiManager.isInMapSight(this.node) && GameApp.audioManager.playEffect('maleDeath', 0.5)
            this.node.parent = GameApp.uiManager.getGame("GameMap").getChildByName("DeadObjectNode")
            this._pbc.enabled = false
            this._isDie = true
            if (_belongIndex == -1) {
                GameApp.uiManager.showToast(this.thisName + " 被毒出局")
            } else if (_belongIndex == -2) {
                GameApp.uiManager.showToast(this.thisName + " 被轰炸出局")
            } else {
                var killNum = GameApp.dataManager.addKillNum(_belongIndex, _belongName)
                if (_belongName == GameApp.dataManager.userData.playerName) {
                    _belongName = "<color=#0fffff>" + _belongName + "</color>"
                }
                if (killNum > 1) {
                    var soundIndex = killNum > 5 ? 5 : killNum
                    GameApp.audioManager.playEffect('kill' + soundIndex, 0.5)
                    GameApp.uiManager.showToast(_belongName, null, killNum)
                } else {
                    GameApp.uiManager.showToast(_belongName + " 击杀了 " + this.thisName)
                }
                //任务相关
                if (_belongIndex == 1) {
                    cc.log("玩家杀人了")
                    GameApp.dataManager.addActivityNum(1, 1)
                    if (_weaponid == 1102) {
                        GameApp.dataManager.addActivityNum(0, 1)
                    }
                }
            }

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
            this.node.stopActionByTag(1)
            // for (var i in GameApp.dataManager.globalData.allRoleArr) {
            //     if (GameApp.dataManager.globalData.allRoleArr[i].skinData.skinid == this.skinData.skinid) {
            //         GameApp.dataManager.globalData.allRoleArr.splice(i, 1)
            //         break;
            //     }
            // }
            var arr = this._choosedSkinId < 21 ? ['dead'] : ['dead2']
            this.roleAnim.setAnimation(0, arr[0], false)
            this.gunNode.active = false
            Tools.removeArray(GameApp.dataManager.globalData.allRoleArr, this.node.getComponent('Enemy'))
            GameApp.eventManager.emit(EventNames.EVENT_SHOW_ALLROLENUM_UI)
        }
    },

});
