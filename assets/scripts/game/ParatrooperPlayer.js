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
        fastSpeed: {
            default: 100,
            type: cc.Integer,
            tooltip: '最快速度'
        },
        _borderGroup: []
    },
    onLoad() {
    },
    onEnable() {

    },
    onDisable() {

    },
    onDestroy() {

    },
    init(_bg) {
        this._borderGroup = _bg
    },
    // methods
    move() {
        let newPos = this.node.position.add(this.moveDir.mul(this._moveSpeed / 60));
        if (newPos.x < this._borderGroup[0].x) {
            newPos.x = this._borderGroup[0].x
        }
        if (newPos.x > this._borderGroup[1].x) {
            newPos.x = this._borderGroup[1].x
        }
        if (newPos.y > this._borderGroup[0].y) {
            newPos.y = this._borderGroup[0].y
        }
        if (newPos.y < this._borderGroup[2].y) {
            newPos.y = this._borderGroup[2].y
        }
        this.node.setPosition(newPos);
    },
    setSpeedType(_type) {
        if (this._isDie) return;
        if (this._speedType != _type) {
            this._speedType = _type
        }
    },
    setDir(_dir) {
        this.moveDir = _dir
    },
    update(dt) {
        switch (this._speedType) {
            case SpeedType.STOP:
                this._moveSpeed = this.stopSpeed;
                break;
            case SpeedType.NORMAL:
                this._moveSpeed = this.fastSpeed
                break;
            case SpeedType.FAST:
                this._moveSpeed = this.fastSpeed
                break;
            default:
                break;
        }
        this.move();

    },
    lateUpdate(dt) {
        // this.mainC.node.setPosition(this.player.position)
        // this.testC.node.setPosition(this.player.position)
        GameApp.uiManager.mapCamera.node.setPosition(this.node.position)
        // this.mipmapCamera.node.setPosition(this.node.position)
    },

});
