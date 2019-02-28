const config = require('../../config.js')
Page({
  data: {
    station: null,
    stationIndex: -1,
    StationObj: [],
    allStationObj:[],
    stationName: '',
    viewHeight: 0,
    nullstate:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  getWaterStation() {
    wx.showLoading();
    const that = this;
    wx.request({
      url: config.getSelfLiftStation + "?activityId=" + wx.getStorageSync("orderInfo").activityId,
      method: "get",
      success(res) {
        wx.hideLoading();
        if (res.data.code === 0) {
          that.setData({
            StationObj: res.data.value,
            allStationObj: res.data.value
          })
          if (res.data.value.length === 0){
            that.setData({
              nullstate: true
            })
          }
        } else {
          wx.showToast({
            title: '网络连接失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail (err) {
        wx.hideLoading();
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  onShow(options) {
    let that = this;
    this.getWaterStation();
    // 当活动内容小于一屏时，设置轮播图容器的最小高度。
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          viewHeight: res.windowHeight - 65 + "px"
        })
      }
    })
    var staindext = -1;
    // 根据数据判断是否有默认选择
    if (wx.getStorageSync('staIndex') >= 0 || wx.getStorageSync('staIndex') != null || wx.getStorageSync('staIndex') != '') {
      staindext = wx.getStorageSync('staIndex');
    } else {
      staindext = -1;
    }
    this.setData({
      stationIndex: staindext
    })
  },
  // 选中提货点
  tackstationtap: function (e) {
    let stationIndex = e.currentTarget.dataset.stationindex;
    this.setData({
      station: e.currentTarget.dataset.station,
      // stationIndex: e.currentTarget.dataset.stationindex
    })
    var staIndex = e.currentTarget.dataset.stationindex;
    var stationobj = e.currentTarget.dataset.station;
    let stationobjArry = this.data.allStationObj;
    stationobjArry.map((item,index) => {
      if (item.branchId === stationobj.branchId){
        wx.setStorageSync('staIndex', index);
      }
    })
    wx.setStorageSync('station', stationobj);
    wx.setStorageSync('branchId', stationobj.branchId);
    wx.navigateBack({ changed: true });//返回上一页
  },
  //监听表单的输入
  watchInput(e) {
    this.setData({
      [e.currentTarget.dataset.stationName]: e.detail.value
    })
    this.searchFn();
    if (this.data.StationObj.length === 0){
      this.setData({
        nullstate: true
      })
    }
  },
  // 进行模糊搜索
  searchFn () {
    let that = this;
    //正则表达式
    var list = that.data.allStationObj;
    var len = list.length;
    var arr = [];
    var reg = new RegExp(that.data.stationName);
    for (var i = 0; i < len; i++) {
      //如果字符串中不包含目标字符会返回-1
      if (list[i].branchName.match(reg) || list[i].allAddress.match(reg)) {
        arr.push(list[i]);
      }
    }
    if (that.data.stationName === "") {
      that.setData({
        StationObj: that.data.allStationObj,
        stationIndex: wx.getStorageSync('staIndex')
      })
    }else{
      that.setData({
        StationObj: arr,
        stationIndex:-1
      })
    }
  }
})