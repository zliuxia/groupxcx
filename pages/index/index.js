//index.js
const config = require('../../config.js')
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;

//获取应用实例
const app = getApp()

Page({
  data: {
    perPage: 10,
    pageCount: 1,
    bannerList:[],
    loadState: false,
    userInfo: {},
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgUrl: app.globalData.imgUrl,
    viewHeight: 0,
    userImg: "../../image/footerLogo.png",
    top: 498,
    left: 320,
    windowWidth: '',
    windowHeight: '',
    city: '',
    bannerListNull:false
  },
  // 小程序分享
  onShareAppMessage: function() {
    return {
      title: '指尖拼团，看得见摸得着的社区团购，5000万小区用户团便宜。',
      path: '/pages/index/index'
    }
  },
  // 跳转我的订单
  OrderList() {
    wx.navigateTo({
      url: '../order/order'
    })
  },
  // 手动刷新
  onLoadFn: function() {
    this.getUserLocation();
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pageCount: 1,
      bannerList:[],
      left: this.data.windowWidth - 100,
      top: this.data.windowHeight - 180
    })
    this.getUserLocation();
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) {}
    })
  },
  // 上拉加载更多
  onReachBottom() {
    var that = this;
    that.setData({
      pageCount: that.data.pageCount + 1
    });
    that.getactivemaneg();
    // 下拉刷新时保留我的订单入口位置
    wx.createSelectorQuery().select('#orderEnter').boundingClientRect(function(rect) {
      that.setData({
        top: rect.top,
        left: rect.left
      });
    }).exec()
  },
  // 首次加载
  onLoad: function (options) {
    var that = this;
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'O4ZBZ-YJULU-7HOVK-4U4X7-36X67-KCFE2'
    });
    let stateindex = wx.getStorageSync('stateIndex') || 0;
    if (stateindex != 1){
      console.log(wx.getStorageSync('stateIndex'));
      console.log(wx.getStorageSync('city'));
      // 定位
      that.getUserLocation();
    }else{
      console.log(wx.getStorageSync('stateIndex'));
      console.log(wx.getStorageSync('city'));
      that.getactivemaneg();
    }
  },
  onShow() {
    wx.setStorageSync('buyedNewActivity', 0);
    var that = this;
    // 获取用户头像
    if (wx.getStorageSync('userInfo')) {
      that.setData({
        userImg: wx.getStorageSync('userInfo').avatarUrl
      })
    }
    // 当活动内容小于一屏时，设置轮播图容器的最小高度。
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          viewHeight: res.windowHeight - 65 + "px",
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          left: res.windowWidth - 100,
          top: res.windowHeight - 180
        })
      }
    })
    // 防止数据重复
    app.globalData.listActivityGoods = [];
  },
  // 微信授权定位
  getUserLocation: function() {
    let that = this;
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {

                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {

                wx.openSetting({
                  success: function(dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })

                      //再次授权，调用wx.getLocation的API
                      that.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          that.getLocation();
        } else {
          //调用wx.getLocation的API
          that.getLocation();
        }
      }
    })
  },
  // 微信获得经纬度
  getLocation: function() {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy;
        that.getLocal(latitude, longitude)
      },
      fail: function(res) {
        wx.showToast({
          title: '亲，记得打开手机定位哟！',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // 获取当前地理位置
  getLocal: function(latitude, longitude) {
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function(res) {
        let city = res.result.ad_info.city
        wx.setStorageSync('city', city)
        that.setData({
          city: city
        })

        // 定位成功后判断是否授权
        that.ifGetUserinfo();
        // 获取地址成功以后根据省市获取数据
        // 这段代码的用意是：防止加载重复数据。 当当前页面的页码数为1的时候有两种情形1.刚进入小程序号2.返回到首页；两种解决办法如果此时的banner列表为空就重新获取一次接口数据如果banne列表有数据就不重新获取数据
        if (that.data.pageCount == 1) {
          if (that.data.bannerList.length <= 0) {
            that.getactivemaneg();
          }
        } else {
          if (that.data.bannerList.length <= (that.data.pageCount - 1) * that.data.perPage) {
            that.getactivemaneg();
          }
        }
      },
      fail: function(res) {
        console.log(res);
      },
      complete: function(res) {
        // console.log(res);
      }
    });
  },
  // 判断是否授权
  ifGetUserinfo: function(e) {
    // 判断是否授权登录
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      var userInfo = app.globalData.userInfo;
      wx.login({
        success: function(res) {
          const that = this;
          if (res.code) {
            wx.getUserInfo({
              success: function(res1) {
                wx.request({
                  url: config.getuserIdUrl, //仅为示例，并非真实的接口地址
                  method: "post",
                  data: {
                    code: res.code,
                    avatarUrl: userInfo.avatarUrl,
                    nickName: userInfo.nickName,
                    encryptedData: res1.encryptedData,
                    iv: res1.iv
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success(res) {
                    var userInfo = wx.getStorageSync('userId') || null
                    wx.setStorageSync('userId', res.data.data)
                  },
                  fail(res) {
                    // app.globalData.fundebug
                    wx.showToast({
                      title: '网络连接失败，请重试',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                })
              },
              fail(err) {
              }
            })
          }
        }
      })
    } else if (this.data.canIUse) {
      this.setData({
        hasUserInfo: false
      })
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      this.setData({
        hasUserInfo: false
      })
      // 在没有 open-type=getUserInfo 版本的兼容处理
      app.userInfoReadyCallback = res => {
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        })
      }
    }
  },
  // 微信授权登录
  getUserInfo: function(e) {
    if (e.detail.userInfo) {
      var userInfo = e.detail.userInfo;
      wx.setStorageSync('userInfo', userInfo)
      app.globalData.userInfo = userInfo
      this.setData({
        hasUserInfo: true,
        userImg: userInfo.avatarUrl
      })
      // 授权登录的时候请求后台
      //请求后台获取用户数据
      wx.login({
        success: function(res) {
          const that = this;
          if (res.code) {
            wx.getUserInfo({
              success: function(res1) {
                wx.request({
                  url: config.getuserIdUrl, //仅为示例，并非真实的接口地址
                  method: "post",
                  data: {
                    code: res.code,
                    avatarUrl: userInfo.avatarUrl,
                    nickName: userInfo.nickName,
                    encryptedData: res1.encryptedData,
                    iv: res1.iv
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success(res) {
                    var userInfo = wx.getStorageSync('userId') || null
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
              },
              fail(err) {
                console.log("网络连接失败，请重试");
              }
            })
          }
        }
      })
    } else {
      this.setData({
        hasUserInfo: false
      })
    }

  },
  // 获取活动信息
  getactivemaneg: function() {
    let that = this;
    that.setData({
      loadState: true
    });
    var cityData = encodeURI(encodeURI(wx.getStorageSync('city')));
    var sessionKey = wx.getStorageSync('userId');
    if (!sessionKey) {
      app.globalData.fundebug.notify("活动首页没有sessionKey", wx.getStorageSync('userId'));
    }
    wx.request({
      url: config.getactivityBannder + "?pageNum=" + that.data.pageCount + "&pageSize=" + that.data.perPage + "&city=" + cityData + "&sessionKey=" + sessionKey, //仅为示例，并非真实的接口地址
      method: "get",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        if (res.data.code == 0) {
          that.stopPullDownRefresh();
          let oldbannlist = that.data.bannerList;
          let newbannlist = res.data.value.list;
          let bannlistData = [...oldbannlist, ...newbannlist];
          if (newbannlist.length >= that.data.perPage) {
            that.setData({
              loadState: true
            });
          } else {
            that.setData({
              loadState: false
            });
          }
          if (bannlistData.length > 0) {
            that.setData({
              bannerListNull: false
            })
          } else {
            that.setData({
              bannerListNull: true
            })
          }
          that.setData({
            bannerList: bannlistData
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // 获取fromId
  formSubmit: function (e) {
    var sessionKey = wx.getStorageSync('userId');
    var getActiveId = e.detail.target.dataset.id;
    wx.request({
      url: config.getfromId, //仅为示例，并非真实的接口地址
      method: "post",
      data: {
        formId: e.detail.formId,
        sessionKey: sessionKey,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.navigateTo({
          url: '../activityDetails/activityDetails?id=' + getActiveId
        })
      },
      fail(res) {
        wx.navigateTo({
          url: '../activityDetails/activityDetails?id=' + getActiveId
        })
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
})