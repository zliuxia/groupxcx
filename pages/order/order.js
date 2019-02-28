//index.js
const config = require('../../config.js')
const until = require('../../utils/util.js')
//获取应用实例
const app = getApp()

Page({
  data: {
    perPage: 10,
    pageCount: 1,
    bannerList: [],
    imageList:[],
    loadState: false,
    userInfo: {},
    hasUserInfo: wx.getStorageSync('userInfo'),
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgUrl: app.globalData.imgUrl,
    viewHeight:0,
    IsoneClose: wx.getStorageSync('oneClose'),
    setAddressCount : 0,
    tableindex:0,
    onTheWay:0,
    forPickup:0,
    nullOrder:false
  },
  // table切换
  getOrderChange(e){
    let index = parseInt(e.currentTarget.dataset.tableindex);
    this.setData({
      bannerList:[],
      pageCount:1
    });
    this.getactivemaneg(index);
    this.getOrderNum();
  },
  // 跳转到订单详情页
  orderDetails(e) {
    wx.setStorageSync('orderMessage', e.currentTarget.dataset.ordermessage)
    let orderCode = e.currentTarget.dataset.ordercode;
    wx.navigateTo({
      url: '../orderDetails/orderDetails?orderCode=' + orderCode
    })
  },
  // 获取订单num
  getOrderNum:function () {
    let that = this;
    wx.request({
      url: config.getOrderNum, //仅为示例，并非真实的接口地址
      method: "get",
      data: {
        sessionKey: wx.getStorageSync("userId")
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.code == 0) {
          // 防止状态变动
          if (res.data.value[0].serviceStatus === 6){
            that.setData({
              onTheWay: res.data.value[0].orderNums,
              forPickup: res.data.value[1].orderNums
            });
          }else{
            that.setData({
              onTheWay: res.data.value[1].orderNums,
              forPickup: res.data.value[0].orderNums
            });
          }
          
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

  // 获取活动信息
  getactivemaneg: function (index) {
    let that = this;
    let serviceStatus = 6;
    that.setData({
      loadState: true
    });
    if(index === 0){
      serviceStatus = 6
    } else if (index === 1){
      serviceStatus = 2
    } else if (index === 2) {
      serviceStatus = 5
    }else{
      serviceStatus = 0
    }
    
    wx.request({
      url: config.getHistoryOrder, //仅为示例，并非真实的接口地址
      method: "get",
      data: {
        pageNum: that.data.pageCount,
        pageSize: that.data.perPage,
        sessionKey: wx.getStorageSync("userId"),
        serviceStatus: serviceStatus
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        if (res.data.code == 0) {
          that.setData({
            tableindex: index
          });
          that.stopPullDownRefresh();
          let oldbannlist = that.data.bannerList;
          let newbannlist = res.data.value.list;
          var listimg = [];
          let bannlistData = [...oldbannlist, ...newbannlist];
          if (newbannlist.length >= that.data.perPage) {
            that.setData({
              loadState: true
            });
          }else {
            that.setData({
              loadState: false
            });
          }
          bannlistData.map((item) => {
            if (item.payTimeShow){
              if (item.payTimeShow.indexOf(".") != -1) {
                item.payTimeShow = item.payTimeShow.slice(0, item.payTimeShow.indexOf("."))
              }
            }
            if (item.doneTimeShow){
              if (item.doneTimeShow.indexOf(".") != -1) {
                item.doneTimeShow = item.doneTimeShow.slice(0, item.doneTimeShow.indexOf("."))
              }
            } 
            return item;
          })
          if (bannlistData.length === 0){
            that.setData({
              nullOrder: true
            })
          }else{
            that.setData({
              nullOrder: false
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
  onShow() {
    var that =  this;
    // 当活动内容小于一屏时，设置订单列表容器的最小高度。
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          viewHeight: res.windowHeight - 65 + "px"
        })
      }
    })
    app.globalData.listActivityGoods = [];
    // 这段代码的用意是：防止加载重复数据。 当当前页面的页码数为1的时候有两种情形1.刚进入小程序号2.返回到首页；两种解决办法如果此时的banner列表为空就重新获取一次接口数据如果banne列表有数据就不重新获取数据
    if(this.data.pageCount == 1) {
      if (this.data.bannerList.length <= 0) {
        this.getactivemaneg(this.data.tableindex);
      }
    } else {
      if (this.data.bannerList.length <= (this.data.pageCount - 1) * this.data.perPage) {
        this.getactivemaneg(this.data.tableindex);
      }
    }
    // 获取订单数量
    that.getOrderNum();
   
  },
  // 手动刷新
  onLoadFn: function () {
    this.getactivemaneg(this.data.tableindex);
    this.getOrderNum();
  },
  // 首次加载
  onLoad: function() {
    var that = this;
    // 判断是否授权登录
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
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
  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      pageCount: 1,
      bannerList: []
    })
    this.getactivemaneg(this.data.tableindex);
    this.getOrderNum();
  },
  // 停止刷新方法
  stopPullDownRefresh() {
    wx.stopPullDownRefresh({
      complete(res) {
      }
    })
  },
  // 复制兑换码
  copyBtn: function(e) {
    var that = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.redeemcode,
      success: function(res) {
        that.setData({
          twoShowSave: true
        })
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },
  // 上拉加载更多
  onReachBottom() {
    var that = this;
    that.setData({
      pageCount: that.data.pageCount + 1
    });
    that.getactivemaneg(this.data.tableindex);
  },
  // 扫码放大
  previewImage: function (e) {
    var current = e.target.dataset.src;
    let imageArry = [];
    imageArry.push(current);
    this.setData({
      imageList: imageArry
    })

    wx.previewImage({
      current: current,
      urls: this.data.imageList
    })
  },
  // 设置地址
  setAddress: function (e){
    this.setData({
      setAddressCount: this.data.setAddressCount + 1 
    })
    if (this.data.setAddressCount === 20){
      this.setData({
        setAddressCount: 0
      })
      wx.navigateTo({
        url: '../setAddress/setAddress'
      })
    }
  }
})