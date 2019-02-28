//index.js
const config = require('../../config.js')
//获取应用实例
const app = getApp()

Page({
  data: {
    orderDetails: null,
    orderMessage:null,
    orderCode:'',
    doneTimeShow:'',
    imgHttp:'https://img.goola.cn/'
  },
  // 获取活动信息
  getactivemaneg: function () {
    console.log("开始请求数据")
    console.log("获取订单" + this.data.orderCode)
    console.log("用户id" + wx.getStorageSync("userId"))
    let that = this;
    wx.request({
      url: config.getOrderById, //仅为示例，并非真实的接口地址
      method: "get",
      data: {
        orderCode:that.data.orderCode,
        sessionKey: wx.getStorageSync("userId")
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.code == 0) {
          console.log("开始成功")
          console.log(res.data.value+"订单详情")
          var showTime = res.data.value.doneTimeShow
          if (showTime) {
            if (showTime.indexOf(".") != -1) {
              let showtime = showTime.slice(0, showTime.indexOf("."))
              that.setData({
                doneTimeShow: showtime
              })
            }
          }
          that.setData({
            orderDetails: res.data.value,
            orderMessage: wx.getStorageSync('orderMessage')
          })
          console.log(that.data.orderDetails)
        }else{
          console.log("开始请求失败")
        }
      },
      fail(res) {
        console.log("开始请求失败")
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })

  },
  // 监听页面加载
  onLoad: function (options) { 
    this.setData({
      orderCode: options.orderCode
    })
    console.log('传过来的用户订单编号'+options.orderCode)
  },
  // 监听页面显示
  onShow() {
    this.getactivemaneg();
  },
})