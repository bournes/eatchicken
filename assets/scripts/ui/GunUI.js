
cc.Class({
    extends: cc.Component,

    properties: {

    },

    backBtnClick() {
        GameApp.audioManager.playEffect('click')
        GameApp.uiManager.showUI('LoginUI')
    },
});
