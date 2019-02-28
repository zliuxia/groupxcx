// pages/activityDetails/activityDetails.js
const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
const {
  computed
} = require('../../utils/vuefy.js')
const until = require('../../utils/util.js')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityId: "", //活动的id
    pageNum: 1,
    pageSize: 10,
    shareImg: "", //分享朋友圈生成的海报
    shareImageHeight: "", //分享海报图的高度
    shopImgWidth: "", // 分享朋友圈的商品宽度
    shopImgHeight: "", // 分享朋友圈的商品高度
    showModal: false,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    windowHeight: wx.getSystemInfoSync().windowHeight,
    remainTime: "", //倒计时的时间
    communityGroupon: "",
    listActivityGoods: [],
    buyedList: [],
    imgUrl: app.globalData.imgUrl,
    hasUserInfo: wx.getStorageSync('userInfo'),
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isinFn: false,
    showDom: false,
    showNull:false,
    loadingStatus: false,
    isReturn: false,
    qrcodeImg: "",
    province: '',
    city: '',
    isNewUser: -1
  },
  show() {
    this.setData({
      showModal: true
    })
  },
  hide() {
    this.setData({
      showModal: false
    })
  },
  formSubmit: function (e) {
    console.log(e.detail.formId);
    var sessionKey = wx.getStorageSync('userId');
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
        console.log("获取formid成功");
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
  saveImg() {
    const that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              wx.saveImageToPhotosAlbum({
                filePath: that.data.shareImg,
                success: function(res) {
                  wx.showToast({
                      title: '保存成功',
                      icon: 'success',
                      duration: 2000
                    }),
                    that.hide();
                },
                fail: function(res) {
                  wx.showToast({
                    title: '网络连接失败，请重试',
                    icon: 'none',
                    duration: 2000
                  })
                }
              })
            },
            fail: function(err) {
              if (err.errMsg.indexOf("authorize:fail") >= 0) {
                wx.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                      wx.showToast({
                        title: '授权成功，请重新点击保存二维码',
                        icon: 'none',
                        duration: 2000
                      })
                    } else {
                    }
                  }
                })
              }
            }
          })
        } else {
          wx.saveImageToPhotosAlbum({
            filePath: that.data.shareImg,
            success: function(res) {
              wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
                }),
                that.hide();
            },
            fail: function(res) {
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
  },
  // 微信授权登录
  getUserInfo: function(e) {
    const that = this;
    var userInfo = wx.getStorageSync('userInfo') || e.detail.userInfo || null
    wx.setStorageSync('userInfo', userInfo);
    app.globalData.userInfo = userInfo
    this.setData({
      userInfo: userInfo,
      hasUserInfo: true,
      isinFn: false
    }, () => {
      if (userInfo) {
        that.share();
      } else {
        wx.showToast({
          title: '请先授权',
          icon: 'none',
          duration: 2000
        })
      }
    })

  },

  // 下单前授权判断
  isUserInfo: function(e) {
    if (this.data.loadingStatus) {
      return;
    } else {
      var that = this;
      if (e.detail.userInfo) {
        this.setData({
          loadingStatus: true
        })
        var userInfo = e.detail.userInfo;
        wx.setStorageSync('userInfo', userInfo)
        app.globalData.userInfo = userInfo;
        this.setData({
          userInfo: userInfo
        }, () => {
          //请求后台获取用户数据
          wx.login({
            success: function(res) {
              wx.getUserInfo({
                success (res1) {
                  if (res.code) {
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
                        wx.setStorageSync('userId', res.data.data);
                        // 用户授权登录后下单
                        that.buy();
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
                },
                fail (err) {

                }
              })
             
            }
          })
        })

      } else {
        wx.showToast({
          title: '请先授权',
          icon: 'none',
          duration: 2000
        })
      }
    }

  },
  share() {
    wx.showLoading();
    const that = this;
    this.createQrcode((res) => {
      wx.downloadFile({
        url: app.globalData.userInfo.avatarUrl ? app.globalData.userInfo.avatarUrl :"https://img.goola.cn/mallImages/20181026/259e8cda14d4440c847cec8f7ffe4b52.png",
        success: function (res1) {
          //缓存头像图片
          that.setData({
            portrait_temp: res1.tempFilePath
          })
          //缓存商品图片
          wx.downloadFile({
            url: (that.data.communityGroupon.activityPics && that.data.communityGroupon.activityPics.length > 0) ? app.globalData.imgUrl + that.data.communityGroupon.activityPics[0] : "http://thyrsi.com/t6/394/1540261978x-1404755462.jpg",
            success: function (res2) {
              that.setData({
                activityPics: res2.tempFilePath
              })
              that.drawImage();
              setTimeout(function () {
                that.canvasToImage()
              }, 200)
            }
          })
        }
      })
    })   
  },
  //转发
  shareFriend() {
    wx.showToast({
      title: '网络连接失败，请重试',
      icon: 'none',
      duration: 2000
    })
  },
  drawImage() {
    //绘制canvas图片
    var that = this;
    const ctx = wx.createCanvasContext('myCanvas');
    var portraitPath = that.data.portrait_temp;
    var hostNickname = app.globalData.userInfo.nickName;

    // var qrPath = "../../image/258.jpg";
    var qrPath = this.data.qrcodeImg;
    var windowWidth = that.data.windowWidth;
    var windowHeight = that.data.windowHeight;
    //绘制背景图片
    let scale = windowWidth / 750 * 1.4;

    ctx.setFillStyle('#fff');
    ctx.fillRect(0, 0, windowWidth, windowHeight);
    //绘制头像
    ctx.save();
    ctx.beginPath();
    ctx.arc(70 * scale, 70 * scale, 40 * scale, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(portraitPath, 30 * scale, 30 * scale, 80 * scale, 80 * scale);
    ctx.restore();
    //绘制第一段文本
    ctx.setFillStyle('#333333');
    ctx.setFontSize(28 * windowWidth / 750);
    ctx.setTextAlign('left');
    ctx.fillText(hostNickname, 130 * scale, 57 * scale);
    //绘制第二段文本
    ctx.setFillStyle('#999');
    ctx.setFontSize(24 * windowWidth / 750);
    ctx.setTextAlign('left');
    let time = until.formatTime(new Date())
    ctx.fillText(time + '发布了一个团购', 130 * scale, 99 * scale);
    //绘制第三段文本
    let t = this.data.communityGroupon.activityDescription;
    t = t.replace(/\n/g, ".");
    t = t + "";
    var chr = t.split("");
    var temp = "";
    var row = [];
    let x = 30 * scale;
    let y = 120 * scale;
    let w = 470 * scale

    ctx.setFillStyle('#333');
    ctx.setFontSize(28 * windowWidth / 750);
    ctx.setTextAlign('left');

    for (var a = 0; a < chr.length; a++) {
      if (ctx.measureText(temp).width < w) {

      } else {
        row.push(temp);
        temp = "";
      }
      temp += chr[a];
    }
    row.push(temp);
    let fontHieght = 0;
    if (28 * windowWidth / 750 < 12) {
      fontHieght = 12 + 14 * windowWidth / 750;
    } else {
      fontHieght = 28 * windowWidth / 750 + 14 * windowWidth / 750;
    }

    let chaHeight = Math.floor(216 * scale / fontHieght);
    if (row.length > chaHeight - 2) {
      row[chaHeight - 3] = row[chaHeight - 3].substring(0, row[chaHeight - 3].length - 4) + "...";
      row = row.splice(0, chaHeight - 2);
    }
    let hg = 0;
    for (var b = 0; b < row.length; b++) {
      ctx.fillText(row[b], x, y + (b + 1) * fontHieght);
      hg = y + (b + 2) * fontHieght;
    }
    //绘制商品图片
    let shoph = this.data.shopImgWidth / this.data.shopImgWidth * 480 * scale;
    shoph = 350 * scale;
    ctx.drawImage(this.data.activityPics, 95 * scale, hg, 350 * scale, shoph);
    //绘制二维码
    console.log("二维码");
    ctx.drawImage(qrPath, 30 * scale, (hg + shoph + 20 * scale), 140 * scale, 140 * scale);
    //绘制第四段文本
    ctx.setFillStyle('#999');
    ctx.setFontSize(24 * windowWidth / 750);
    ctx.setTextAlign('left');
    ctx.fillText('一群人正在赶来团购', 190 * scale, (hg + shoph + 74 * scale))
    //绘制第五段文本
    ctx.setFillStyle('#999');
    ctx.setFontSize(24 * windowWidth / 750);
    ctx.setTextAlign('left');
    ctx.fillText('扫码参与', 190 * scale, (hg + shoph + 102 * scale));
    this.setData({
      shareImageHeight: (hg + shoph + 20 * scale) + 140 * scale + 30 * scale
    })
    ctx.draw();
  },
  canvasToImage() {
    var that = this
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.windowWidth,
      height: that.data.shareImageHeight,
      destWidth: that.data.windowWidth * 4,
      destHeight: that.data.shareImageHeight * 4,
      canvasId: 'myCanvas',
      success: function(res) {
        that.setData({
          shareImg: res.tempFilePath,
          showModal: true
        })
        wx.hideLoading();
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showToast({
            title: '网络连接失败，请重试',
            icon: 'none',
            duration: 2000
          })
      }
    })
  },
  // 放大图浏览
  previewImage(e) {
    var listimg = [];
    this.data.communityGroupon.activityPics.map((item) => {
      if (item) {
        item = app.globalData.imgUrl + item;
        listimg.push(item);
      } else {
        listimg.push(item);
      }
    })
    var current = e.target.dataset.images;
    this.setData({
      isReturn: true
    })
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: listimg // 需要预览的图片http链接列表
    })
  },
  // 价格0元时不能支付
  notPay() {
    let buyed = false;
    this.data.listActivityGoods.forEach((item) => {
      if (item.mount && item.mount > 0) {
        buyed = true;
      }
    })
    if (!buyed) {
      wx.showToast({
        title: '未选择商品',
        icon: 'none',
        duration: 2000
      })
    }else{
      wx.showToast({
        title: '该商品为无价商品，不可单独购买',
        icon: 'none',
        duration: 2000
      })
    }
    
  },
  //删除商品
  delGoods(event) {
    if (wx.getStorageSync('buyedNewActivity')) {
      wx.setStorageSync('buyedNewActivity', 0);
    }
    var index = event.currentTarget.dataset['index'];
    this.data.listActivityGoods[index].mount--;
    this.setData({
      listActivityGoods: this.data.listActivityGoods
    })
    
  },

  //提取公共的函数、、、判断是否可购买
  tipBuyedOne (data,event) {
    if (data > 0) {
      wx.showToast({
        title: '仅限新用户购买',
        icon: 'none',
        duration: 2000
      });
    } else {
      if (!wx.getStorageSync('buyedNewActivity')) {
        wx.setStorageSync('buyedNewActivity', 1);
        var index = event.currentTarget.dataset['index'];
        this.data.listActivityGoods[index].mount ? this.data.listActivityGoods[index].mount++ : this.data.listActivityGoods[index].mount = 1;
        this.setData({
          listActivityGoods: this.data.listActivityGoods
        })
      } else {
        //提示仅限购买一个
        wx.showToast({
          title: '该活动为新用户专享，仅限购买一个',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },

  //添加商品
  addGoods(event) {
    const that = this;
    wx.setStorageSync('ifNewUser', this.data.communityGroupon.ifNewUser);
    if (this.data.communityGroupon.ifNewUser == 2) {
      var sessionKey = wx.getStorageSync('userId');
      //判断是否调用过新老用户的判断接口
      if (this.data.isNewUser == -1) {
        app.isOldUser(sessionKey, (data) => {
          that.setData({
            isNewUser: data
          }, () => {
            that.tipBuyedOne(data, event);
          })
        });
      } else {
        that.tipBuyedOne(this.data.isNewUser, event);
      }     
    } else {
      var index = event.currentTarget.dataset['index'];
      this.data.listActivityGoods[index].mount ? this.data.listActivityGoods[index].mount++ : this.data.listActivityGoods[index].mount = 1;
      console.log(index);
      this.setData({
        listActivityGoods: this.data.listActivityGoods
      })
    } 
  },

  //我要团购
  buy() {
    let buyed = false;
    let itemList = [];
    this.data.listActivityGoods.forEach((item) => {
      if (item.mount && item.mount > 0) {
        buyed = true;
        itemList.push({
          goodsId: item.id,
          buyNum: item.mount
        })
      }
    })
    if (buyed) {
      let orderInfo = {
        sessionKey: wx.getStorageSync('userId'),
        activityId: this.data.communityGroupon.id,
        itemList: itemList,
        totalPrice: this.data.totalPrice
      }
      wx.setStorageSync('orderInfo', orderInfo); //用户订单信息
      wx.setStorageSync('isExpress', this.data.communityGroupon.isExpress); //是否快递
      wx.setStorageSync('customerPick', this.data.communityGroupon.customerPick); //是否自提
      app.globalData.listActivityGoods = this.data.listActivityGoods;
      wx.navigateTo({
        url: '../payment/payment?id=' + this.data.activityId
      })
    } else {
      this.setData({
        loadingStatus: false
      })
      wx.showToast({
        title: '还未选择商品哦！',
        icon: 'none',
      })
    }
  },

  // 获取团购购买历史
  getByHistoryDatas(id) {
    const that = this;
    wx.request({
      url: config.getByHistoryDatas + "?activityId=" + id + "&pageNum=" + this.data.pageNum + "&pageSize=" + that.data.pageSize,
      method: "get",
      success(res) {
        if (res.data.code === 0) {
          let data = [];
          if (that.data.pageNum !== 1) {
            data = that.data.buyedList;
          }
          data = data.concat(res.data.value.list)
          data.map((item) => {
            let str = item.nickname.slice(0, 1) + item.nickname.slice(1,6).replace(/./g, "*");
            return item.nickname = str;
          })
          that.setData({
            buyedList: data
          })
        } else {
          wx.showToast({
            title: '网络连接失败，请重试',
            icon: 'none',
            duration: 2000
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
  isLogin() {
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
              hasUserInfo: true,
              isinFn: false
            })
          }
        })
      }
    }
  },
  //点击数增加
  addViewNum(id) {
    wx.request({
      url: config.addViewNum + "?id=" + id,
      method: "get",
      success(res) {
        if (res.data.code === 0) {

        } else {
          wx.showToast({
            title: '网络连接失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail(err) {
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //返回首页
  backHome () {
    wx.switchTab({
      url: '../../pages/activeIndex/activeIndex'
    })
  },
  //分享数增加
  addShareNum() {
    wx.request({
      url: config.addShareNum + "?id=" + this.data.activityId,
      method: "get",
      success(res) {
        if (res.data.code === 0) {
        } else {
          wx.showToast({
            title: '网络连接失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail(err) {
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    let sceneValue = wx.getStorageSync('sceneValue');
    // 获取app获取的场景值，如果是最近使用过小程序的，不在定位
    if (!(sceneValue === 1001 || sceneValue === 1089 || sceneValue === 1027)){
      // 实例化API核心类
      qqmapsdk = new QQMapWX({
        key: 'O4ZBZ-YJULU-7HOVK-4U4X7-36X67-KCFE2'
      });
      // 定位
      that.getUserLocation();
    }
    var scene = decodeURIComponent(options.scene);
    that.setData({
      isinFn: false
    })
    // 首页跳转进来的活动页面
    if (scene === "undefined") {
      this.setData({
        activityId: options.id
      })
    //其他地方分享进来的活动页面 
    } else {
      this.setData({
        activityId: scene
      })
    }
    computed(this, {
      totalPrice() {
        let totalPrice = 0;
        this.data.listActivityGoods.map((item) => {
          if (item.mount) {
            totalPrice = until.accAdd(until.mul(item.grouponPrice, item.mount), totalPrice);;
          }
        })
        return until.toleavepenny(totalPrice);
      }
    })
  },
  createQrcode (cb) {
    const that = this;
    wx.request({
      url: config.getminiqrQr,
      method: "get",
      data: {
        activityId: that.data.activityId,
        page: "pages/activityDetails/activityDetails"
      },
      success (res) {
        console.log("成功");
        wx.downloadFile({
          url: res.data.value,
          success (res1) {
            console.log(res1);
            that.setData({
              qrcodeImg: res1.tempFilePath
            }, () => {
              cb(res1.tempFilePath);
            })
          },
          fail (err) {

          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // // 进去活动前删掉缓存自提站点
    wx.setStorageSync('station', "");
    wx.setStorageSync('staIndex', -1);
    this.setData({
      loadingStatus: false
    })
    if (this.data.isReturn) {
      this.setData({
        isReturn: false,
        showDom: true
      })
      return
    }
    if (!this.data.communityGroupon) {
      wx.showLoading();
    }
    const that = this;
    that.getByHistoryDatas(this.data.activityId);
    // 获取活动详情
    wx.request({
      url: config.communityGrouponGoods + "?id=" + this.data.activityId,
      method: "get",
      success(res) {
        if (res.data.code === 0) {
          let activeCity = res.data.value.communityGroupon.city || "北京市";
          if (activeCity === wx.getStorageSync('city')){
            let info = res.data.value.communityGroupon;
            let activityPics = info.activityPics;
            if (activityPics) {
              info.activityPics = activityPics.split(',');
            }
            if (info.viewCount >= 10000) {
              info.viewCount = (info.viewCount / 10000).toFixed(0) + "w";
            }
            if (info.buyCount >= 10000) {
              info.buyCount = (info.buyCount / 10000).toFixed(0) + "w";
            }
            if (info.shareCount >= 10000) {
              info.shareCount = (info.shareCount / 10000).toFixed(0) + "w";
            }
            // wx.setStorageSync("branchId", info.branchId);
            if (app.globalData.listActivityGoods.length > 0) {
              app.globalData.listActivityGoods.map((item) => {
                res.data.value.listActivityGoods.map((item2) => {
                  try{
                    item2.storeSellPrice = item2.storeSellPrice.toFixed(2);
                    item2.grouponPrice = item2.grouponPrice.toFixed(2);
                    if (item2.id === item.id) {
                      item2.mount = item.mount;
                      return item2;
                    }
                  }catch (e){
                    item2.storeSellPrice = item2.storeSellPrice;
                    item2.grouponPrice = item2.grouponPrice;
                    if (item2.id === item.id) {
                      item2.mount = item.mount;
                      return item2;
                    }
                  }
                  
                })
              })
            } else {
              res.data.value.listActivityGoods.map((item2) => {
                if (res.data.value.listActivityGoods.length <= 1) {
                  item2.mount = 1;
                }
                try{
                  item2.storeSellPrice = item2.storeSellPrice.toFixed(2);
                  item2.grouponPrice = item2.grouponPrice.toFixed(2);
                }catch (e) {
                  item2.storeSellPrice = item2.storeSellPrice;
                  item2.grouponPrice = item2.grouponPrice;
                }    
              })
            }
            that.setData({
              communityGroupon: info,
              listActivityGoods: res.data.value.listActivityGoods,
              showDom: true,
              showNull:false
            }, () => {
              wx.hideLoading();
              if (that.data.communityGroupon.activityStatus === 2) {
                setInterval(() => {
                  if (until.lastTime(that.data.communityGroupon.startTime) <= 0) {
                    that.data.communityGroupon.activityStatus = 1;
                    that.setData({
                      communityGroupon: that.data.communityGroupon
                    })
                    clearInterval();
                  } else {
                    that.setData({
                      remainTime: until.lastTime(that.data.communityGroupon.startTime)
                    })
                  }
                }, 1000)
              }
            })
          }else{
            wx.hideLoading();
            that.setData({
              showDom: false,
              showNull: true
            });
          }
          
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '网络连接失败，请重试',
            icon: 'none',
            duration: 2000
          })
          that.setData({
            showNull: true
          });
        }
      },
      fail(res) {
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          showNull: true
        });
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  // 上拉加载更多
  onReachBottom() {
    var that = this;
    that.setData({
      pageNum: that.data.pageNum + 1
    });
    that.getByHistoryDatas(this.data.activityId);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    this.addShareNum();
    app.globalData.listActivityGoods = this.data.listActivityGoods;
    const that = this;
    return {
      title: this.data.communityGroupon.activityDescription,
      path: `pages/activityDetails/activityDetails?id=` + this.data.activityId,
      imageUrl: this.data.communityGroupon.activityPics.length > 0 ? app.globalData.imgUrl + this.data.communityGroupon.activityPics[0] : "http://thyrsi.com/t6/390/1539933188x1822611437.jpg",
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
        wx.showToast({
          title: '网络连接失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },
  // 跳转到活动详情页
  goProductDetails(event) {
    // 给出判断：有商品详情的才能跳转商品详情
    if (event.currentTarget.dataset.goodssource === 1) {
      app.globalData.listActivityGoods = this.data.listActivityGoods;
      wx.navigateTo({
        url: '../productDetails/productDetails?id=' + event.currentTarget.dataset.itemId
      })
    }

  },
  // 微信授权定位
  getUserLocation: function () {
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
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
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
  getLocation: function () {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy;
        that.getLocal(latitude, longitude)
      },
      fail: function (res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  // 获取当前地理位置
  getLocal: function (latitude, longitude) {
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        let province = res.result.ad_info.province;
        var city = res.result.ad_info.city;
        var OldCity = wx.getStorageSync('city');
        // 获取本地缓存城市，判断是否为同一个地址，有就直接展示购买，没有就空页面，点击返回首页。
        if(city === OldCity){
          // 定完为以后的设置为默认场景值，不让他再定位
          wx.setStorageSync('sceneValue', 1001)
        }else{
          // 定完为以后的设置为默认场景值，不让他再定位
          wx.setStorageSync('', 1001)
          wx.setStorageSync('city', city)
          that.setData({
            province: province,
            city: city,
            showDom:false
          })
        } 
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },
})