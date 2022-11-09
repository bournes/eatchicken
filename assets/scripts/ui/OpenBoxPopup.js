const Utils = require("Utils")

cc.Class({
    extends: cc.Component,

    properties: {
        boxAnim: sp.Skeleton,
        delayShowPanel: cc.Node, //children 0是图，1是字
        _itemType: 1,
        _itemNum: 0,
        _pieceIndex: 0,

        onceClick: {
            default: true,
            visible: false
        }
    },

    onLoad() {

    },
    init(_skinData, _type, _num, _pieceIndex) {
        this._itemType = _type
        this._itemNum = _num
        this._pieceIndex = _pieceIndex
        switch (_type) {
            case 1: this.addCoin(_num); break;
            case 2: this.addPiece(_num, _pieceIndex); break;
        }
        this.initSkinShow(_skinData)
    },
    initSkinShow(_skinData) {
        this.boxAnim.skeletonData = _skinData
        var arr = ['appear', 'big--small', 'open', 'open_await']//, 'last_open_await'
        var i = 0
        this.boxAnim.setAnimation(0, arr[i++], false)
        this.boxAnim.setCompleteListener(() => {
            if (i > arr.length - 1) return;
            var loop = (i == arr.length - 1)
            if (i == arr.length - 2) {
                this.node.runAction(cc.sequence(cc.delayTime(0.8), cc.callFunc(() => {
                    this.delayShowPanel.active = true
                    Tools.scaleUpAndDowm(this.delayShowPanel.children[2])
                })))
            }
            this.boxAnim.setAnimation(0, arr[i++], loop)
        })
    },
    sureBtnClick() {
        if (window.wx) {
            GameApp.uiManager.showToast("暂未开放！")
            return
        }
        if (!this.onceClick) return;
        this.onceClick = false
        GameApp.audioManager.playEffect('click')
        var self = this
        if (window.tt) {
            Utils.addVideo("addVideo", function () { //看完了
                self.onceClick = true
                GameApp.dataManager.addPlayedVideoNum()
                switch (self._itemType) {
                    case 1: GameApp.dataManager.addCoin(self._itemNum); GameApp.uiManager.showToast("获得金币*" + self._itemNum * 2); break;
                    case 2: GameApp.dataManager.addPieceNum(self._pieceIndex, self._itemNum); GameApp.uiManager.showToast("获得<color=#faf80d>" + GameApp.dataManager.getSkinDataById(self._pieceIndex).name + "</color> 碎片*" + self._itemNum * 2); break;
                }
                GameApp.uiManager.closePopup("OpenBoxPopup")
            }, function (_info) { //没看完
                self.onceClick = true
                _info ? GameApp.uiManager.showToast(_info) : GameApp.uiManager.showToast("未看完视频！")
            })
        } else {
            self.onceClick = true
            GameApp.dataManager.addPlayedVideoNum()
            switch (self._itemType) {
                case 1: GameApp.dataManager.addCoin(self._itemNum); GameApp.uiManager.showToast("获得金币*" + self._itemNum * 2); break;
                case 2: GameApp.dataManager.addPieceNum(self._pieceIndex, self._itemNum); GameApp.uiManager.showToast("获得<color=#faf80d>" + GameApp.dataManager.getSkinDataById(self._pieceIndex).name + "</color> 碎片*" + self._itemNum * 2); break;
            }
            GameApp.uiManager.closePopup("OpenBoxPopup")
        }
    },
    skipBtnClick() {
        GameApp.audioManager.playEffect('click')
        var self = this
        switch (self._itemType) {
            case 1: GameApp.uiManager.showToast("获得金币*" + self._itemNum); break;
            case 2: GameApp.uiManager.showToast("获得<color=#faf80d>" + GameApp.dataManager.getSkinDataById(self._pieceIndex).name + "</color> 碎片*" + self._itemNum); break;
        }
        GameApp.uiManager.closePopup("OpenBoxPopup")
    },
    addCoin(_num) {
        this.delayShowPanel.children[1].getComponent(cc.RichText).string = "金币*" + _num
    },
    addPiece(_num, _pieceIndex) {
        this.setpieceIcon(_pieceIndex);
        this.delayShowPanel.children[1].getComponent(cc.RichText).string = "<color=#faf80d>" + GameApp.dataManager.getSkinDataById(_pieceIndex).name + "</color> 碎片*" + _num
    },
    setpieceIcon(id) {
        var self = this
        cc.loader.loadRes("texture/skin_piece/card_p_" + id, cc.SpriteFrame, function (err, spriteFrame) {
            self.delayShowPanel.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame
        });
    },
});
