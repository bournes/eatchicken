
cc.Class({
    extends: cc.Component,

    properties: {
        itemType: {
            default: {}
        },

    },

    onLoad() {
        this.getComponent(cc.PhysicsBoxCollider).tag = Tags.item
        this.doAnim()
    },
    doAnim() {
        this.node.children[0].runAction(cc.sequence(cc.fadeOut(0.6), cc.fadeIn(0.3)).repeatForever())
        this.node.children[1].runAction(cc.sequence(cc.moveBy(0.5, cc.v2(0, 10)), cc.moveBy(0.5, cc.v2(0, -10))).repeatForever())
    },
    init(_param, _spriteFrame) {
        _param && (this.itemType = _param)
        // if (true) {
        if (this.itemType._type == ItemType.weapon) {
            this.node.children[2].active = false
            this.node.children[1].getComponent(cc.Sprite).spriteFrame = GameApp.uiManager.commonAtlas.getSpriteFrame("item_weapon_" + GameApp.dataManager.jsonData.WeaponData[_param._kind].skinname)
        } else {
            this.node.children[2].getComponent(cc.Label).string = GameApp.dataManager.jsonData.WeaponData[this.itemType._kind].name
            this.node.children[2].active = true
            this.node.children[1].getComponent(cc.Sprite).spriteFrame = GameApp.uiManager.commonAtlas.getSpriteFrame("item_equip_1_valid")
        }


    },
    // setItemIcon(id) {
    //     var self = this
    //     cc.loader.loadRes("texture/skin_piece/card_p_" + id, cc.SpriteFrame, function (err, spriteFrame) {
    //         self.methodBtnGroup[2].children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame
    //     });
    // },
});
