const config = require('/config.js');
//错误日志插件
var fundebug = require('./utils/fundebug.0.9.0.min.js');
fundebug.init({
  apikey: '18a8d9376b42b53fd2c4e11f821bea61aaeea32d7880235fa76fa9c184ec1813',
  appVersion: "1.9.0",
  releaseStage: config.env,
  setSystemInfo: true,
  setUserInfo: true,
  setLocation: true
})
// https://fundebug.com
//app.js
App({
  onLaunch: function(options) {
    this.updateManager();
    this.globalData.sceneValue = options.scene;
    var sceneValue = options.scene;
    wx.setStorageSync('sceneValue', sceneValue)
    // 展示本地存储能力
    wx.removeStorageSync('orderInfo');
    wx.removeStorageSync('isExpress');
    wx.removeStorageSync('customerPick');
    wx.removeStorageSync('station');
    wx.removeStorageSync('staIndex');
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    var userInfo = wx.getStorageSync('userInfo') || null;
    wx.setStorageSync('userInfo', userInfo)

    var userId = wx.getStorageSync('userId') || null;
    wx.setStorageSync('userId', userId)

    var city = wx.getStorageSync('city') || null;
    wx.setStorageSync('city', city)

    if (userInfo == null) {
      // // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo
                var userInfo = wx.getStorageSync('userInfo') || res.userInfo
                wx.setStorageSync('userInfo', userInfo);
                var encryptedData = res.encryptedData;
                var iv = res.iv;
                //请求后台获取用户数据
                wx.login({
                  success: function(res) {
                    const that = this;
                    if (res.code) {
                      wx.request({
                        url: config.getuserIdUrl, //仅为示例，并非真实的接口地址
                        method: "post",
                        data: {
                          code: res.code,
                          avatarUrl: userInfo.avatarUrl,
                          nickName: userInfo.nickName,
                          encryptedData: encryptedData,
                          iv: iv
                        },
                        header: {
                          'content-type': 'application/json' // 默认值
                        },
                        success(res) {
                          var userInfo = wx.getStorageSync('userId') || null;
                          wx.setStorageSync('userId', res.data.data)
                        },
                        fail(res) {
                          wx.showToast({
                            title: '网络连接失败，请重试',
                            icon: 'none',
                            duration: 2000
                          })
                        }
                      })
                    }
                  }
                })
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          } else {
            //请求后台获取用户数据
            wx.login({
              success: function(res) {
                const that = this;
                if (res.code) {
                  wx.request({
                    url: config.getuserIdUrl, //仅为示例，并非真实的接口地址
                    method: "post",
                    data: {
                      code: res.code
                    },
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success(res) {
                      var userInfo = wx.getStorageSync('userId') || null;
                      wx.setStorageSync('userId', res.data.data)
                    },
                    fail(res) {
                      wx.showToast({
                        title: '网络连接失败，请重试',
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  })
                }
              }
            })
          }
        }
      })
    }
  },
  updateManager() {
    console.log("gengxin");
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  isOldUser(sessionKey, cb) {
    wx.request({
      url: config.isOldUser + "?sessionKey=" + sessionKey,
      method: "get",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.code === 0) {
          cb(res.data.value);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail(res) {
        console.log(res);
      }
    })
  },
  // 返回到tab首页
  gotoTabindex: function() {
    wx.switchTab({
      url: '../../pages/activeIndex/activeIndex'
    })
  },
  // 跳转到没有返回按钮的当前页面
  gotoSelectCommunity:function () {
    wx.redirectTo({
      url: '../../pages/selectCommunity/selectCommunity'
    })
  },
  // 获取用户缓存当前社区
  getpresentAddress: function(e) {
    var that = this;
    var presentAddressObj = wx.getStorageSync('presentAddress');
    if (presentAddressObj) {
      return;
    } else {
      // 没有历史选择社区跳转到选择社区页面
      that.gotoSelectCommunity();
    }
  },
  onShow() {
    const that = this;
    wx.getSystemInfo({
      success(res) {
        that.globalData.version = res.version;
        that.globalData.SDKVersion = res.SDKVersion;
      }
    })
    wx.login({
      success: function(res) {
        if (res.code) {
          wx.request({
            url: config.getuserIdUrl, //仅为示例，并非真实的接口地址
            method: "post",
            data: {
              code: res.code
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success(res) {
              var userInfo = wx.getStorageSync('userId') || null;
              wx.setStorageSync('userId', res.data.data);
              // 用户登录以后有了用户id再看用户是否缓存当前社区
              that.getpresentAddress();
            },
            fail(res) {
              console.log(res)
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: wx.getStorageSync('userInfo'),
    userId: wx.getStorageSync('userId'),
    sceneValue: wx.getStorageSync('sceneValue'),
    listActivityGoods: [],
    imgUrl: "https://img.goola.cn/",
    fundebug: fundebug,
    version: "", // 微信版本号
    SDKVersion: "", //客户端基础库版本
    appletVersion: config.appletVersion, // 小程序的版本号
    env: config.env// 小程序发布环境
  }
})