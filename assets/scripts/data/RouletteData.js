var RouletteData = {
    ALLROATE: 360,//360度
    num: 8, // 转盘格子数
    deviation: 5, // 偏移量(防止转盘指针正好指向两个格子中间)
    offset: 22.5, // 角度的偏移量
    //转盘角度数据
    zhuanpanData: {
        default: {}
    },

    duration: 3, //转动持续时间
    rotateNum: 3, //转动圈数(n - 1)

    load: function () {
        for (let i = 1; i < 9; i++) {
            this.zhuanpanData[i] = {
                start: (this.num - (9 - i)) * this.ALLROATE / this.num - this.offset + this.deviation, end: (this.num - (8 - i)) * this.ALLROATE / this.num - this.offset - this.deviation
            }
        }
    }
};
RouletteData.load();

module.exports = RouletteData;
