

window.Tools = {
    addClickEvent: function (node, target, component, handler, customEventData) {
        // console.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        if (customEventData) {
            eventHandler.customEventData = customEventData
        }

        node.getComponent(cc.Button).clickEvents = [];
        node.getComponent(cc.Button).clickEvents.push(eventHandler);
    },

    //生成从minNum到maxNum的随机数(包含上限)
    randomNum: function (minNum, maxNum, _float) {
        if (_float) {
            return Math.random() * (maxNum - minNum + 1) + minNum
        }
        return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
    },
    //从数组arr内获取随机1个元素(可重复)
    getRandomElement: function (arr) {
        let num = arr.length
        if (num > 0) {
            let i = Math.floor(Math.random() * num)
            if (i == num) i = num - 1
            return arr[i]
        }
        else
            return null
    },
    //获取数组arr内随机amount个元素且不会重复(返回对象新增了所有随机元素的下标数组)
    getRandomAmountElementUnRepeat: function (arr, amount) {
        let arrLength = arr.length
        if (amount >= arrLength) {
            var desArr = {
                nodeArr: arr,
                indexArr: []
            };
            for (var i = 0; i < arr.length; i++) {
                desArr.indexArr.push(i)
            }
            return desArr
        } else if (amount <= 0) {
            return null;
        } else {
            //这里对于此项目做了特化处理
            var desArr = {
                nodeArr: [],
                indexArr: []
            };
            var tempArr = [];
            var temp = null;
            for (var i = 0; i < amount; i++) {
                do {
                    temp = Math.floor(Math.random() * arrLength)
                } while (tempArr.indexOf(temp) > -1)
                tempArr.push(temp)
                desArr.nodeArr.push(arr[temp])
                desArr.indexArr.push(temp)
            }
            return desArr
        }
    },
    isCrit(_num) {
        var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        var result = this.getRandomAmountElementUnRepeat(arr, _num)
        if (result == null) {
            return false
        } else {
            if (result.nodeArr.indexOf(7) != -1) {
                return true
            } else {
                return false
            }
        }
    },
    getIndex: function (_arr, _obj) {
        var len = _arr.length;
        for (var i = 0; i < len; i++) {
            if (_arr[i] == _obj) {
                return parseInt(i);
            }
        }
        return -1;
    },
    removeArray: function (_arr, _obj) {
        var length = _arr.length;
        for (var i = 0; i < length; i++) {
            if (_arr[i] == _obj) {
                if (i == 0) {
                    _arr.shift(); //删除并返回数组的第一个元素
                    return _arr;
                }
                else if (i == length - 1) {
                    _arr.pop();  //删除并返回数组的最后一个元素
                    return _arr;
                }
                else {
                    _arr.splice(i, 1); //删除下标为i的元素
                    return _arr;
                }
            }
        }
    },

    /// <summary>
    /// 在圆心为point，半径为radius的圆内，产生一个半径为radius_inner的圆的圆心
    /// </summary>
    /// <param name="point">外圆圆心</param>
    /// <param name="radius_outer">外圆半径</param>
    /// <param name="radius_inner">内圆半径</param>
    /// <returns>内圆圆心</returns>
    pointOfRandom(point, radius_outer, radius_inner) {
        var x = Tools.randomNum(Math.floor(point.x - (radius_outer - radius_inner)), Math.floor(point.x + (radius_outer - radius_inner)));
        var y = Tools.randomNum(Math.floor(point.y - (radius_outer - radius_inner)), Math.floor(point.y + (radius_outer - radius_inner)));

        while (!this.isInRegion(x - point.x, y - point.y, radius_outer - radius_inner)) {
            x = Tools.randomNum(Math.floor(point.x - (radius_outer - radius_inner)), Math.floor(point.x + (radius_outer - radius_inner)));
            y = Tools.randomNum(Math.floor(point.y - (radius_outer - radius_inner)), Math.floor(point.y + (radius_outer - radius_inner)));
        }

        var p = cc.v2(x, y);
        return p;
    },
    /// <param name="x_off">与大圆圆心的x方向偏移量</param>
    /// <param name="y_off">与大圆圆心的y方向偏移量</param>
    /// <param name="distance">大圆与小圆半径的差</param>
    /// <returns>判断点是否在范围内</returns>
    isInRegion(x_off, y_off, distance) {
        if (x_off * x_off + y_off * y_off <= distance * distance) {
            return true;
        }
        return false;
    },
    /// <summary>
    /// 判断两个圆是否重合，或者是相内切
    /// </summary>
    /// <param name="p_outer">外圆圆心</param>
    /// <param name="r_outer">外圆半径</param>
    /// <param name="p_inner">内圆圆心</param>
    /// <param name="r_inner">内圆半径</param>
    /// <returns>是否相内切</returns>
    isIntersect(p_outer, r_outer, p_inner, r_inner) {
        //判定条件：两圆心的距离 + r_inner = r_outer
        var distance = parseFloat(Math.sqrt((p_outer.x - p_inner.x) * (p_outer.x - p_inner.x) + (p_outer.y - p_inner.y) * (p_outer.y - p_inner.y)))
        if (distance + r_inner >= r_outer) {
            return true;
        }
        return false;
    },

    scaleUpAndDowm: function (target, isShining, light) {
        target.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.3, 1.1).easing(cc.easeIn(2)),
            cc.scaleTo(0.6, 0.9).easing(cc.easeIn(2)),
            cc.scaleTo(0.6, 1.1).easing(cc.easeIn(2)),
            cc.scaleTo(0.6, 0.9).easing(cc.easeIn(2)),
        )));
        if (isShining) {
            light.runAction(cc.repeatForever(cc.sequence(
                cc.fadeIn(0.3).easing(cc.easeIn(2)),
                cc.fadeOut(0.6).easing(cc.easeIn(2)),
                cc.fadeIn(0.6).easing(cc.easeIn(2)),
                cc.fadeOut(0.6).easing(cc.easeIn(2)),
            )))
        }
    },
    shake: function (target) {
        target.runAction(cc.repeatForever(cc.sequence(
            cc.rotateTo(0.1, 5).easing(cc.easeIn(2)),
            cc.rotateTo(0.2, -5).easing(cc.easeIn(2)),
            cc.rotateTo(0.2, 5).easing(cc.easeIn(2)),
            cc.rotateTo(0.1, 0).easing(cc.easeIn(2)),
            cc.delayTime(0.5)
        )));
    },


    // 0   , 0.2 , 0.2 , 0.6
    //     0.2, 0.2 , 0.2 , 0.4
    //     0.4, 0.2 , 0.2 , 0.2
    //     0.6, 0.2 , 0.2 , 0


    jumpOneByOne: function (target) {

        var nodeNum = target.childrenCount
        for (var i = 0; i < nodeNum; i++) {
            target.children[i].runAction(cc.sequence(cc.delayTime(i * 0.2), cc.scaleTo(0.2, 1.3).easing(cc.easeBackOut()), cc.scaleTo(0.2, 1), cc.delayTime((nodeNum - 1 - i) * 0.2 + 1)).repeatForever())
        }
    },
    // 本地时间戳->2018/8/8
    toDateFormat: function () {
        let date = new Date();
        date = new Date(date.getTime());
        return {
            year: date.getFullYear(),
            month: (date.getMonth() + 1),
            day: date.getDate()
        }
    },
    // 秒->08:08:08
    toTimeString2: function (s) {
        if (s <= 0) {
            return "00:00:00";
        }
        s = Math.floor(s);
        let hour = Math.floor(s / (60 * 60));
        s -= hour * (60 * 60);
        let minute = Math.floor(s / 60);
        s -= minute * 60;
        let ret = '';
        if (hour > 0) {
            ret += hour < 10 ? '0' + hour : hour
        } else {
            ret += '00'
        }
        ret += ':'
        if (minute > 0) {
            ret += minute < 10 ? '0' + minute : minute
        } else {
            ret += '00'
        }
        ret += ':'
        if (s > 0) {
            ret += s < 10 ? '0' + s : s
        } else {
            ret += '00'
        }
        //return ret;
        return {
            hour: hour,
            minute: minute,
            s: s,
        }
    },


    // 秒->08:08:08
    toTimeString: function (s) {
        if (s <= 0) {
            return "00:00";
        }
        s = Math.floor(s);
        let hour = Math.floor(s / (60 * 60));
        s -= hour * (60 * 60);
        let minute = Math.floor(s / 60);
        s -= minute * 60;
        let ret = '';
        // if (hour > 0) {
        //     ret += hour < 10 ? '0' + hour : hour
        // } else {
        //     ret += '00'
        // }
        // ret += ':'
        if (minute > 0) {
            ret += minute < 10 ? '0' + minute : minute
        } else {
            ret += '00'
        }
        ret += ':'
        if (s > 0) {
            ret += s < 10 ? '0' + s : s
        } else {
            ret += '00'
        }
        return ret;
        // return {
        //     hour: hour,
        //     minute: minute,
        //     s: s,
        // }
    },





    addNegativeCaculation: function (isNegative, num, rate, strName) {
        return isNegative ? "-" + this.calculation(num, rate, strName) : this.calculation(num, rate, strName);
    },

    // calculation number
    calculation: function (num, rate, strName) {
        var n1 = Math.floor(num / rate);
        var n2 = Math.floor(num % rate / rate * 10);
        if (n2 === 0) {
            return n1 + strName;
        } else {
            return n1 + "." + n2 + strName;
        }
    },
};