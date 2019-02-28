//index.js
const config = require('../../config.js')
// pages/selectCommunity/selectCommunity.js
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    presentAddress: wx.getStorageSync('presentAddress') || null,
    HistoryAddress: wx.getStorageSync('HistoryAddress') || null,
    SiteHomeData: null,
    allSiteHomeData: null,
    nowPage: 1,
    siteHomeDataLen: null,
    LocalAddress: null,
    city: '北京市',
    bannerListNull: false,
    setAddressCount: 0,
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'O4ZBZ-YJULU-7HOVK-4U4X7-36X67-KCFE2'
    });
    this.getUserLocation();
  },
  onShow: function() {
    // this.getSiteHomePage();
    // this.updateGroupHistoryAddress();
    var that = this;
    var presentAddressObj = wx.getStorageSync('presentAddress');
    var historyAddressData = wx.getStorageSync('HistoryAddress') || null;
    that.setData({
      presentAddress: presentAddressObj,
      HistoryAddress: historyAddressData
    })
  },
  // 设置地址
  setAddress: function (e) {
    this.setData({
      setAddressCount: this.data.setAddressCount + 1
    })
    if (this.data.setAddressCount === 20) {
      this.setData({
        setAddressCount: 0
      })
      wx.navigateTo({
        url: '../setAddress/setAddress'
      })
    }
  },

  // 判断是否授权
  ifGetUserinfo: function (e) {
    // 判断是否授权登录
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      var userInfo = app.globalData.userInfo;
      wx.login({
        success: function (res) {
          const that = this;
          if (res.code) {
            wx.getUserInfo({
              success: function (res1) {
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
  getUserInfo: function (e) {
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
        success: function (res) {
          const that = this;
          if (res.code) {
            wx.getUserInfo({
              success: function (res1) {
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
  // 上拉加载更多
  onReachBottom() {
    let sitelen = this.data.siteHomeDataLen;
    let SiteHomeData = this.data.SiteHomeData;
    let allSiteHomeData = this.data.allSiteHomeData;
    let nowPage = this.data.nowPage + 1;
    this.setData({
      nowPage: nowPage
    })
    if (nowPage > sitelen) {
      return;
    } else if (nowPage == sitelen){
      for (let i = 5 * (nowPage - 1); i < allSiteHomeData.length; i++) {
        SiteHomeData.push(allSiteHomeData[i]);
      }
    } else {
      let len = (nowPage - 1) * 5;
      SiteHomeData.push(allSiteHomeData[len]);
      SiteHomeData.push(allSiteHomeData[len + 1]);
      SiteHomeData.push(allSiteHomeData[len + 2]);    
      SiteHomeData.push(allSiteHomeData[len + 3]);    
      SiteHomeData.push(allSiteHomeData[len + 4]);    
    }
    this.setData({
      SiteHomeData: SiteHomeData
    })
  },
  // 手动刷新
  onLoadFn: function () {
    wx.setStorageSync("setAddress", null);
    this.getUserLocation();
  },
  // 下拉刷新
  onPullDownRefresh() {
    wx.setStorageSync("setAddress", null);
    this.getUserLocation();
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) { }
    })
  },
  // 微信授权定位
  getUserLocation: function() {
    let that = this;
    wx.getSetting({
      success: (res) => {
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
        // 定位成功后判断是否授权
        that.ifGetUserinfo();
        let city = res.result.ad_info.city
        wx.setStorageSync('city', city)
        that.setData({
          city: city,
          LocalAddress: res.result
        }, () => {
          console.log(res.result);
          that.getSiteHomePage();
        })


      },
      fail: function(res) {
        console.log(res);
      },
      complete: function(res) {
        // console.log(res);
      }
    });
  },
  // 返回到tab首页
  gotoTabindex: function() {
    wx.switchTab({
      url: '../../pages/activeIndex/activeIndex'
    })
  },
  // 获取getSiteHomePage附近社区列表
  getSiteHomePage: function(e) {
    var that = this;
    var sessionKey = wx.getStorageSync('userId');
    let cityName;
    let currentPosition;
    let longitude;
    let latitude;
    if (wx.getStorageSync("setAddress")) {
      cityName = wx.getStorageSync("setAddress").cityName;
      currentPosition = wx.getStorageSync("setAddress").address;
      longitude = wx.getStorageSync("setAddress").lati;
      latitude = wx.getStorageSync("setAddress").long;
    } else {
      cityName = that.data.LocalAddress.ad_info.city;
      currentPosition = that.data.LocalAddress.address;
      longitude = that.data.LocalAddress.location.lat;
      latitude = that.data.LocalAddress.location.lng;
    }
    wx.request({
      url: config.getSiteHomePage, //仅为示例，并非真实的接口地址
      method: "post",
      data: {
        sessionKey: sessionKey,
        currentPosition: currentPosition,
        longitude: longitude,
        latitude: latitude,
        cityName: cityName,
        pageNum: 1,
        pageSize: 10
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.code === 0) {
          // 停止下拉刷新状态
          that.stopPullDownRefresh();
            if (res.data.value === null || res.data.value.length === 0){
              that.setData({
                bannerListNull:true
              })
            }else{
              that.setData({
                bannerListNull: false
              })
              let add = [];
              //附近社区去除曾用社区和当前社区
              if (wx.getStorageSync("presentAddress") || wx.getStorageSync("HistoryAddress")) {
                res.data.value.forEach((item) => {
                  if (item.distance >= 1000) {
                      item.distance = (item.distance / 1000).toFixed(1) + "km";
                  } else {
                    item.distance = item.distance + "m";
                  }
                  if (wx.getStorageSync("presentAddress") && item.siteId == wx.getStorageSync("presentAddress").siteId) {
                    return false;

                  }
                  console.log(wx.getStorageSync("HistoryAddress").siteId);
                  if (wx.getStorageSync("HistoryAddress") && item.siteId == wx.getStorageSync("HistoryAddress").siteId ){
                    return false;
                  }
                  add.push(item);
                })
                let oneArr = [];
                let len = Math.ceil(add.length / 5);
                if (len == 1) {
                  for(let i = 0; i < add.length; i++) {
                    oneArr.push(add[i]);
                  }
                } else {
                  oneArr.push(add[0]);
                  oneArr.push(add[1]);
                  oneArr.push(add[2]);
                  oneArr.push(add[3]);
                  oneArr.push(add[4]);
                }
                console.log(len);
                that.setData({
                  allSiteHomeData: add,
                  SiteHomeData: oneArr,
                  nowPage: 1,
                  siteHomeDataLen: len
                })
              } else {
                res.data.value.forEach((item) => {
                  if (item.distance >= 1000) {
                    item.distance = (item.distance / 1000).toFixed(1) + "km";
                  } else {
                    item.distance = item.distance + "m";
                  }
                })
                that.setData({
                  SiteHomeData: res.data.value
                })
              }
            }
        }else{
          // 停止下拉刷新状态
          that.stopPullDownRefresh();
          that.setData({
            bannerListNull: true
          })
        }
      },
      fail(res) {
        that.setData({
          bannerListNull: true
        })
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // 修改/添加当前社区
  updateGroupHistoryAddress: function(e) {
    var sessionKey = wx.getStorageSync('userId');
    wx.request({
      url: config.updateGroupHistoryAddress, //仅为示例，并非真实的接口地址
      method: "post",
      data: {
        sessionKey: sessionKey,
        pickupStoreId: '2021',
        siteName: '曾经用的小区名称',
        siteUserName: '曾经用的小区团长名称',
        pickupStoreAddress: '北京市海淀区长春桥路17号',
        longitude: 116.29845,
        latitude: 39.95933,
        cityName: '北京',
        districtName: '曾经用的社区'
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {},
      fail(res) {
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  // selectHistoryCommunity切换城曾经使用小区
  selectHistoryCommunity:function (e){
    var that= this;
    //曾经使用的社区
    let HistoryAddressData = that.data.presentAddress;
    // 选中的曾经社区对象为当前社区
    var currentTargetAddressObj = e.currentTarget.dataset.historyaddress;
    that.setData({
      HistoryAddress: HistoryAddressData,
      presentAddress: currentTargetAddressObj
    }, () => {
      // 切完以后返回到首页
      wx.setStorageSync('HistoryAddress', HistoryAddressData);
      wx.setStorageSync('presentAddress', currentTargetAddressObj);
      that.gotoTabindex();
    })
  },
  // 切换附近社区
  selectCommunitylist:function (e){
    var that = this;    
    // 选中的社区对象为当前社区
    var TargetaddressObj = e.currentTarget.dataset.listaddress;
    var historyAddressData = wx.getStorageSync('HistoryAddress') || null;
    var willhistoryData = that.data.presentAddress;
    that.setData({
      presentAddress: TargetaddressObj
    }, () => {
      // 缓存当前社区
      var presentAddress = wx.getStorageSync('presentAddress') || null;
      wx.setStorageSync('presentAddress', TargetaddressObj);
        that.setData({
          HistoryAddress: willhistoryData
        },()=>{
          var historyDataObj = wx.getStorageSync('HistoryAddress') || null;
          wx.setStorageSync('HistoryAddress', willhistoryData);
          // 切完以后返回到首页
          that.gotoTabindex();
        })
      
    })
  }
})