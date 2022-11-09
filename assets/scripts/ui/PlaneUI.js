
cc.Class({
    extends: cc.Component,

    properties: {
        planeNode: cc.Node,
        mapNode: cc.Node,
        _chooseType: 0, //0是左对角,1是右对角
        _speedUp: false,
    },

    onLoad() {

    },
    init(_speedUp) {
        this._speedUp = _speedUp
        var angleArr = [-135, 135, 45, -45]
        var posIndex = Tools.randomNum(0, 3)
        this._chooseType = posIndex % 2
        this.planeNode.setPosition(this.node.children[0].convertToNodeSpaceAR(this.mapNode.children[posIndex].convertToWorldSpaceAR(cc.v2(0, 0))))
        this.planeNode.angle = angleArr[posIndex]
        switch (posIndex) {
            case 0: this.planeNode.runAction(cc.moveTo(5, this.mapNode.children[2].position)); break;
            case 1: this.planeNode.runAction(cc.moveTo(5, this.mapNode.children[3].position)); break;
            case 2: this.planeNode.runAction(cc.moveTo(5, this.mapNode.children[0].position)); break;
            case 3: this.planeNode.runAction(cc.moveTo(5, this.mapNode.children[1].position)); break;
        }
        GameApp.audioManager.playEffect('plane', 1, 2)
    },
    // update (dt) {},
    jumpBtnClick() {
        GameApp.audioManager.playEffect('click')
        this.planeNode.stopAllActions()
        GameApp.uiManager.showUI('GameUI', (node) => {
            var allL = 0
            var curL = 0
            // var tempChooseType = this._chooseType % 2
            if (this._chooseType == 0) {
                allL = cc.v2(this.mapNode.children[0].position).sub(this.mapNode.children[2].position).mag()
                curL = cc.v2(this.planeNode.position).sub(this.mapNode.children[0].position).mag()
            } else {
                allL = cc.v2(this.mapNode.children[1].position).sub(this.mapNode.children[3].position).mag()
                curL = cc.v2(this.planeNode.position).sub(this.mapNode.children[3].position).mag()
            }
            var bili = curL / allL
            node.getComponent("GameUI").init(this._chooseType, bili, this._speedUp)
        })
    },

});
