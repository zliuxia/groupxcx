const config = require('../../config.js')
const WxParse = require('../../wxParse/wxParse.js');
const app = getApp()

Page({
  data: {
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    backgroundNum:4,
    indicatorDots: true,
    vertical: true,
    autoplay: true,
    interval: 2000,
    duration: 500,
    activityGoods: {},
    goodsPhotos: [],
    productId: "",
    imgUrl: app.globalData.imgUrl
  },
  changeIndicatorDots: function (e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function (e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function (e) {
    this.setData({
      duration: e.detail.value
    })
  },
  onLoad(options, query) {
    this.setData({
      productId: options.id
    })
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onShow(options) {
   const that = this;
    // 获取活动详情
    wx.request({
      url: config.getDisplayMerchandiseDetails + "?id=" + this.data.productId,
      method: "get",
      success(res) {
        if (res.data.value.activityGoods.storeGoodsProfile) {
          WxParse.wxParse('article', 'html', res.data.value.activityGoods.storeGoodsProfile, that, 5);
        }
        that.setData({
          activityGoods: res.data.value.activityGoods,
          goodsPhotos: res.data.value.activityGoods.goodsPhotos.split(",")
        })
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
})
