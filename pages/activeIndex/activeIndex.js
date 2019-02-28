//index.js
const config = require('../../config.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    background: ['https://img.goola.cn/mallImages/20190220/e65bbc507f484bbea8147aacc63dd4f1.png', 'https://img.goola.cn/mallImages/20190220/e66e8239a6f64331893abbbbb4e07867.png', 'https://img.goola.cn/mallImages/20190220/336a33a1395f4f0a88972bcc210c3176.jpg',
    'https://img.goola.cn/mallImages/20190220/ebd522c16aa34ef7ad47c77f9b65639b.png'],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 2000,
    duration: 500,
    perPage: 4,
    pageCount: 1,
    siteId: 2261,
    presentAddress: null,
    bannerList: [],
    loadState: false,
    bannerListNull: false,
    imgUrl: app.globalData.imgUrl
  },
  logoclick () {
  },
  // 跳转到选择社区页
  selectCommunity() {
    wx.navigateTo({
      url: '../selectCommunity/selectCommunity'
    })
  },
  // 首次加载
  onLoad: function (options) {
  },
  //显示加载
  onShow: function() {
    this.setData({
      pageCount: 1,
      bannerList: []
    })
    this.getactivemaneg();
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pageCount: 1,
      bannerList: []
    })
    this.getactivemaneg();
  },
  // 上拉加载更多
  onReachBottom() {
    var that = this;
    that.setData({
      pageCount: that.data.pageCount + 1
    },()=>{
      console.log(that.data.pageCount);
      that.getactivemaneg();
    });
    
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) { }
    })
  },
  // 获取活动列表
  getactivemaneg: function() {
    let that = this;
    let HistoryAdd = wx.getStorageSync('presentAddress') || null;
    if (wx.getStorageSync('presentAddress')) {
      var cityData = HistoryAdd.cityName;
      var pickupStoreId = HistoryAdd.siteId;
      if (HistoryAdd.siteName.length > 23) {
        HistoryAdd.siteName = HistoryAdd.siteName.substring(0,23) + "...";
      }
    }
    that.setData({
      presentAddress: HistoryAdd
    });
    var sessionKey = wx.getStorageSync('userId');
    if (!sessionKey) {
      app.globalData.fundebug.notify("活动首页没有sessionKey", wx.getStorageSync('userId'));
    }
    wx.request({
      url: config.getActivityHomePage, //仅为示例，并非真实的接口地址
      method: "post",
      data: {
        pageNum: that.data.pageCount,
        pageSize: that.data.perPage,
        siteId: pickupStoreId,
        city: cityData,
        sessionKey: sessionKey
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.code == 0) {
          that.stopPullDownRefresh();
          let oldbannlist = that.data.bannerList;
          let newbannlist = res.data.value;
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
          bannlistData.map((item) => {
            if (item.endTimeShow) {
              if (item.endTimeShow.indexOf(".") != -1) {
                item.endTimeShow = item.endTimeShow.slice(0, item.endTimeShow.indexOf("."))
              }
            }
          })

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
  // 获取fromId/跳转到活动详情页
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
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage() {
  //   const that = this;
  //   return {
  //     title: this.data.communityGroupon.activityDescription,
  //     path: `pages/activityDetails/activityDetails?id=` + this.data.activityId,
  //     imageUrl: this.data.communityGroupon.activityPics.length > 0 ? app.globalData.imgUrl + this.data.communityGroupon.activityPics[0] : "http://thyrsi.com/t6/390/1539933188x1822611437.jpg",
  //     success: function (res) {
  //       // 转发成功
  //     },
  //     fail: function (res) {
  //       // 转发失败
  //       wx.showToast({
  //         title: '网络连接失败，请重试',
  //         icon: 'none',
  //         duration: 2000
  //       })
  //     }
  //   }
  // },
})