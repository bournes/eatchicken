
cc.Class({
    extends: cc.Component,

    properties: {

    },


    onLoad() {
        this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(() => {
            GameApp.uiManager.showUI("LoginUI")
        })))
    },


});
