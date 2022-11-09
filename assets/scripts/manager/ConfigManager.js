const paths = {
    "Skin": 'data/skins.json',
};

var ConfigManager = {
    allConfigs: {},
    loadConfig: function (_name, _call) {

        var path = paths[_name];
        cc.loader.loadRes(path, function (err, res) {
            if (err) {
                console.log("加载出错了")
                console.error(err.message || err);
                return;
            }
            var tempData = res;

            this.allConfigs[_name] = tempData;
            _call && _call()
            // console.log(JSON.parse(JSON.stringify(res)));
        }.bind(this));
    },
    loadAllConfig: function (_call) {
        for (const key in paths) {
            if (paths.hasOwnProperty(key)) {
                // const element = paths[key];
                this.loadConfig(key, _call);
            }
        }
    },
    getAllConfig: function () {
        return this.allConfigs;
    },

};
module.exports = ConfigManager;