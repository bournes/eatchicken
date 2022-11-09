cc.Class({
    extends: cc.Component,

    properties: {
        Player: {
            default: null,
            type: sp.Skeleton,
            displayName: '玩家动画'
        }
    },

    start() {
        this.loadSkeletonDataResources();
    },

    loadSkeletonDataResources() {
        // cc.loader.loadResDir("spine", sp.SkeletonData, function (err, assets) {
        //     if (!err) {
        //         cc.SkeletonData = assets;
        //         //console.log('加载动画文件成功:', cc.SkeletonData);
        //         let data = this.getSkeletonDataByName('player');
        //         console.log('玩家动画:', data);
        //         //this.Player.skeletonData = this.PlayerSkeletonData;
        //         this.Player.skeletonData = data;
        //         this.Player.setSkin("cook");
        //         this.Player.setAnimation(0, "await", true);
        //     }
        // }.bind(this));
    },

    getSkeletonDataByName(data) {
        for (let i = 0; i < cc.SkeletonData.length; i++) {
            let skeletonData = cc.SkeletonData[i];
            let name = skeletonData.name;
            if (name === data) {
                return skeletonData;
            }
        }
    }
});
