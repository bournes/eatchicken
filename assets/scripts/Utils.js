let util = {}

let bannerIdTab = {
	addBanner: "503khkj54l5m1j6i0i"
};

util.m_banner = null
util.moregameBtn = null
util.vedioAd = null
util.recorder = null
util.recordNatureStop = false
let vedioIdTab = {
	addVideo: "i2nd08ki9p723pt2k4"
}
const baseurl = "https://ecwx-1257044218.cos.ap-chengdu.myqcloud.com/"
const shareImgUrl = baseurl + "bingoballshare.jpg"// "http://img5.imgtn.bdimg.com/it/u=2001547842,1349217893&fm=26&gp=0.jpg"
const shareTxts = [
	{ idx: 1, txt: "他拿起喷子一梭子就给我带走了。。。" },
	{ idx: 2, txt: "老板有没有加特林，哒哒哒冒蓝火那种" },
	{ idx: 3, txt: "鸡吃撑了，歇会儿" },
	{ idx: 4, txt: "这里的妹子真Q弹，就是她了！" },
]
util._getShareObject = function (from, _callSuccess, _callFailed) {
	let title = "史上最难的游戏，玩过的人都说春运抢票不算难！"
	let query = null
	let desc = null
	let obj = Tools.getRandomElement(shareTxts)
	if (obj) {
		desc = obj.txt
		query = "from=" + from + "&txt_id=" + title.idx
	}
	return {
		title: title,
		desc: desc,
		query: query,
		imageUrl: shareImgUrl,
		success() {
			console.log('分享成功');
			_callSuccess && _callSuccess()
		},
		fail(e) {
			console.log('分享失败');
			console.log(e)
			_callFailed && _callFailed()
		}
	}
}
util.shareFromHomePage = function (_callSuccess, _callFailed) {
	if (window.wx) {
		wx.shareAppMessage(util._getShareObject("home_page", _callSuccess, _callFailed))
	} else {
		_callSuccess && _callSuccess()
	}
}
util.shareRecord = function (path, _callSuccess, _callFailed) {
	if (window.tt) {
		// tt.shareAppMessage(util._getShareObject("home_page"))
		let title = "史上最难的游戏，玩过的人都说春运抢票不算难！"
		let query = null
		let desc = null
		let obj = Tools.getRandomElement(shareTxts)
		if (obj) {
			desc = obj.txt
			query = "from=share" + "&txt_id=" + title.idx
		}
		tt.shareAppMessage({
			channel: 'video',
			title: title,
			desc: desc,
			imageUrl: shareImgUrl,//放入与游戏相关的百度图片
			templateId: '',
			query: query,
			extra: {
				videoPath: path, // 换成录屏得到的视频地址
				videoTopics: ['全民刺激吃鸡', '小游戏'],
				createChallenge: true
			},
			success() {
				console.log('分享视频成功');
				_callSuccess && _callSuccess()
			},
			fail(e) {
				console.log('分享视频失败');
				console.log(e)
				_callFailed && _callFailed()
			}
		})


	}
}
util.addBanner = function (_id, _sy, _WinHeight, _call) {
	if (window.tt == null) {
		return
	}
	var phone = tt.getSystemInfoSync();
	var w = phone.screenWidth
	var h = phone.screenHeight;
	if (util.m_banner) {
		util.m_banner.destroy()
		console.log("m_banner is has create")
	} else {
		console.log("m_banner is has not create")
	}
	let bannerAd = tt.createBannerAd({
		adUnitId: bannerIdTab[_id],
		style: _sy
	});
	util.m_banner = bannerAd
	bannerAd.onLoad(() => {
		console.log("bannerAd 加载成功")
		util.m_banner.show().then(() => {
			console.log("广告显示成功");
		})
	});
	// 尺寸调整时会触发回调
	// 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！
	bannerAd.onResize(size => {
		// console.log("重置");
		// console.log(size.width, size.height);
		if (size.width == 0) return;
		if (size.height == 0) return;

		// 如果一开始设置的 banner 宽度超过了系统限制，可以在此处加以调整
		if (200 != size.width) {
			bannerAd.style.top = h - (size.height);
			bannerAd.style.left = (w - size.width) / 2;
		}
	});
	// util.m_banner.onError(err => {
	// 	console.log(err)
	// });

	// util.m_banner.show().catch(err => console.log(err)).then(() => {
	// 	console.log("banner show success");
	// 	if (_call) {
	// 		_call();
	// 	}
	// });
	// util.m_banner.onResize(res => {
	// 	console.log("bannerAd onResize bannerAd.style.realHeight:" + util.m_banner.style.realHeight)
	// 	console.log("bannerAd onResize bannerAd.style.top:" + util.m_banner.style.top)
	// 	util.m_banner.style.left = w - util.m_banner.style.realWidth / 2 + 0.1
	// 	util.m_banner.style.top = h - util.m_banner.style.realHeight - 10
	// 	util.m_banner.style.width = util.m_banner.style.realWidth
	// })

}
util.removeBanner = function () {
	if (window.tt == null) {
		return
	}
	if (util.m_banner) {
		util.m_banner.hide()
		console.log("removeBanner")
	}
}
//不用
util.addMoreGameBtn = function (_url) {
	if (window.tt) {
		var phone = tt.getSystemInfoSync();
		var w = phone.screenWidth
		var h = phone.screenHeight;
		util.moregameBtn = tt.createMoreGamesButton({
			type: "image",
			image: _url,
			style: {
				left: 20,
				top: 50,
				width: 50,
				height: 50,
				lineHeight: 50,
				backgroundColor: "",
				textColor: "",
				textAlign: "center",
				fontSize: 16,
				borderRadius: 0,
				borderWidth: 0,
				borderColor: ""
			},
			appLaunchOptions: [
				{
					appId: "ttXXXXXX",
					query: "foo=bar&baz=qux",
					extraData: {}
				}
				// {...}
			],
			onNavigateToMiniGame(res) {
				console.log("跳转其他小游戏", res);
			}
		});
		console.log(util.moregameBtn)
		// Tools.scaleUpAndDowm(util.moregameBtn.node)
		// btn.onTap(() => {
		// 	console.log("点击更多游戏");
		// });
	}
}
util.closeMoreGameBtn = function () {
	util.moregameBtn.destroy()
}
util.addVideo = function (_id, _callSuccess, _callFailed) {
	if (window.tt == null) {
		return
	}

	util.vedioAd = tt.createRewardedVideoAd({
		adUnitId: vedioIdTab[_id]
	});

	try {
		if (util.vedioAd.errorFunc) {
			console.log("关闭了error")
			util.vedioAd.offError(util.vedioAd.errorFunc);
		}
		if (util.vedioAd.closeFunc) {
			console.log("关闭了close")
			util.vedioAd.offClose(util.vedioAd.closeFunc);
		}
	} catch (e) {
		console.warn("--------------videoAd offClose or offError error:");
		console.error(e);
	}

	util.vedioAd.errorFunc = function (err) {
		console.log(err)
		if (err.errCode == 1004) {
			_callSuccess && _callSuccess("无可观看视频");
		} else {
			_callSuccess && _callSuccess("视频服务器错误");
		}
	};
	util.vedioAd.onError(util.vedioAd.errorFunc);
	util.vedioAd.closeFunc = function (res) {
		console.log("执行了closeFunc")
		if (res && res.isEnded || res === undefined) {
			// util.vedioAd.offLoad()
			console.log("播放完了")
			_callSuccess && _callSuccess();
		} else {
			console.log('中途退出')
			_callFailed && _callFailed()
		}
	};
	util.vedioAd.onClose(util.vedioAd.closeFunc);


	util.vedioAd.show().catch(() => {
		// 失败重试
		util.vedioAd.load()
			.then(() => util.vedioAd.show())
			.catch(err => {
				console.log('激励视频or广告显示失败')
			})
	});

}
util.startRecord = function (_call, _onNatureClose) {
	if (window.tt == null) {
		return
	}
	util.recorder = tt.getGameRecorderManager();
	util.recorder.onStart(res => {
		console.log('录屏开始');
		util.recordNatureStop = false
		_call && _call()
	})
	util.recorder.onStop(res => {
		console.log('录屏自然停止');
		util.recordNatureStop = true
		_onNatureClose && _onNatureClose(res)
	})
	util.recorder.onError(res => {
		console.log('录屏错误');
	})
	util.recorder.start({
		duration: 1200,
	})
};
util.pauseRecord = function (_call) {
	util.recorder.onPause(res => {
		console.log('录屏暂停');
		_call && _call()
	})

	util.recorder.pause()
};
util.resumeRecord = function (_call) {
	util.recorder.onResume(res => {
		console.log('录屏恢复');
		_call && _call()
	})

	util.recorder.resume()
};
util.stopRecord = function (_call) {
	if (util.recordNatureStop) {
		_call && _call()
		return;
	}
	util.recorder.onStop(res => {
		console.log('录屏停止');
		// util.recordPath = res.videoPath;
		_call && _call(res)
	})

	util.recorder.stop()
};


module.exports = util