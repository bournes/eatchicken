
cc.Class({
    extends: cc.Component,

    properties: {
        _borderGroup: []
    },

    init(_bg) {
        this._borderGroup = _bg
    },
    update() {
        let newPos = this.node.position
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
});
