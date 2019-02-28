var util = require('../../utils/util.js')
var formatLocation = util.formatLocation
// pages/setAddress/setAddress.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: wx.getStorageSync('city'),
    address: '',
    location: null,
    hasLocation: false,
    clearData:false,
    selectIndex: -1,
    selectAddress: {},
    citydata: [{
      cityName: "北京市",
      long: "116.29845",
      lati: "39.95933",
      address: "北京市海淀区长春桥路17号"
    },{
      cityName: "长春市",
      long: "125.32362",
      lati: "43.81666",
      address: "吉林省长春市南关区人民大街10111号"
    },
      {
        cityName: "上海市",
        long: 121.320779229,
        lati: 31.194068255,
        address: "上海市闵行区申贵路1500号"
      },
      {
        cityName: "合肥市",
        long: 117.290361,
        lati: 31.798881,
        address: "安徽省合肥市包河区徽州大道与绕城高速交叉口东北"
      },
      {
        cityName: "深圳市",
        long: 114.029377912,
        lati: 22.609391001,
        address: "广东省深圳市龙华区民治街道致远中路28号"
      }]
  },
  // 修改城市
  switchcityFn: function (e) {
    let addressCity = e.currentTarget.dataset.address;
    wx.navigateTo({
      url: '../switchcity/switchcity?city=' + addressCity
    })
  },
  selectCity (e) {
    this.setData({
      selectIndex: e.target.dataset.index,
      selectAddress: this.data.citydata[e.target.dataset.index],
    })
    console.log(this.data.selectAddress);
  },
  // 修改地址获取经纬度
  chooseLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        let data = {
          longitude: res.longitude,
          latitude: res.latitude,
        }
        wx.setStorageSync('setLocation', data);
        wx.setStorageSync('setAddress', res.address);
        console.log(res);
        that.setData({
          hasLocation: true,
          location: formatLocation(res.longitude, res.latitude),
          address: res.address
        })
      }
    })
  },
  onShow: function () {
    this.setData({
      city: wx.getStorageSync('city'),
      address: wx.getStorageSync('setAddress'),
      location: wx.getStorageSync('setLocation')
    })
  },
  webButtonFn:function(){
    wx.reLaunch({
      url: '/pages/webView/webView',
    })
  },
  gotoIndex : function () {
    if (this.data.selectIndex > -1) {
      wx.setStorageSync('setAddress', this.data.selectAddress);
      // wx.setStorageSync('setLocation', this.data.location);
      if (!wx.getStorageSync("setAddress")) {
        return;
      }
      wx.reLaunch({
        url: '/pages/selectCommunity/selectCommunity?stateIndex=1',
      })
    } else {
      return;
    } 
    
    // if (wx.getStorageSync('city') === "北京市") {
    //   wx.setStorageSync('stateIndex', 0);
    //   wx.reLaunch({
    //     url: '/pages/index/index?stateIndex=0',
    //   })
    // } else {
    //   wx.setStorageSync('stateIndex', 1);
    //   wx.reLaunch({
    //     url: '/pages/index/index?stateIndex=1',
    //   })
    // }
  }
})