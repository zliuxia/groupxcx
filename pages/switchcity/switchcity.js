var city = require('../../utils/city.js');
var app = getApp()
Page({
  data: {
    searchLetter: [],
    showLetter: "",
    winHeight: 0,
    // tHeight: 0,
    // bHeight: 0,
    cityList: [],
    isShowLetter: false,
    scrollTop: 0,//置顶高度
    scrollTopId: '',//置顶id
    city: "北京市",
    hotcityList: [{ cityCode: 110000, city: '北京市' }, { cityCode: 310000, city: '上海市' }, { cityCode: 440100, city: '广州市' }, { cityCode: 440300, city: '深圳市' }, { cityCode: 330100, city: '杭州市' }, { cityCode: 320100, city: '南京市' }, { cityCode: 420100, city: '武汉市' }, { cityCode: 410100, city: '郑州市' }, { cityCode: 120000, city: '天津市' }, { cityCode: 610100, city: '西安市' }, { cityCode: 510100, city: '成都市' }, { cityCode: 500000, city: '重庆市' }]
  },
  onLoad: function (options) {
    let cityData = options.city;
    // 生命周期函数--监听页面加载
    var searchLetter = city.searchLetter;
    var cityList = city.cityList();
    var sysInfo = wx.getSystemInfoSync();
    var winHeight = sysInfo.windowHeight;
    var itemH = winHeight / searchLetter.length;
    var tempObj = [];
    for (var i = 0; i < searchLetter.length; i++) {
      var temp = {};
      temp.name = searchLetter[i];
      temp.tHeight = i * itemH;
      temp.bHeight = (i + 1) * itemH;
      tempObj.push(temp)
    }
    this.setData({
      winHeight: winHeight,
      itemH: itemH,
      searchLetter: tempObj,
      cityList: cityList,
      city: cityData
    })

  },
  bindScroll: function(){
    console.log('bindScroll');
  },
  clickLetter: function (e) {
    var showLetter = e.currentTarget.dataset.letter;
    this.setData({
      showLetter: showLetter,
      isShowLetter: true,
      scrollTopId: showLetter,
    })
    var that = this;
    setTimeout(function () {
      that.setData({
        isShowLetter: false
      })
    }, 1000)
  },
  //选择城市
  bindCity: function (e) {
    wx.setStorageSync('city', e.currentTarget.dataset.city);
    if (this.data.city != e.currentTarget.dataset.city){
      wx.setStorageSync('setLocation', null);
      wx.setStorageSync('setAddress', '');
    }
    this.setData({ 
      city: e.currentTarget.dataset.city,
      scrollTop: 0
    })
    wx.navigateBack({ changed: true });//返回上一页
  },
  //选择热门城市
  bindHotCity: function (e) { 
    wx.setStorageSync('city', e.currentTarget.dataset.city);
    if (this.data.city != e.currentTarget.dataset.city) {
      wx.setStorageSync('setLocation', null);
      wx.setStorageSync('setAddress', '');
    }
    this.setData({
      city: e.currentTarget.dataset.city,
      scrollTop: 0
    })
    wx.navigateBack({ changed: true });//返回上一页
  },
  //点击热门城市回到顶部
  hotCity: function () {
    this.setData({
      scrollTop: 0,
    })
  }
})