const config = require('../../config.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    station: wx.getStorageSync('presentAddress') || null,
    receiverAddress: '',
    receierPhone: '',
    receiverName: '',
    Totalprice: wx.getStorageSync('orderInfo').totalPrice,
    customerPick: wx.getStorageSync('customerPick'),
    isExpress: wx.getStorageSync('isExpress'),
    loadingStatus: false,
    showBindPhone: false,
    focus: false,
    showGetphone:true
  },
  // 聚焦时触发事件
  // focusInput(e) {
  //   if (e.currentTarget.dataset.iptName === 'receierPhone') {
  //     let userPhone = wx.getStorageSync("Submitobj").receierPhone;
  //     if (userPhone) {
  //       this.setData({
  //         showBindPhone: false,
  //         focus: true
  //       })
  //     } else {
  //       this.setData({
  //         showBindPhone: true,
  //         focus: false
  //       })
  //     }
  //   }
  // },
  // 失去焦点的时候存内存
  blurInput(e){
    let Submitobj = {
      receiverName: this.data.receiverName,
      receierPhone: this.data.receierPhone,
      receiverAddress: this.data.receiverAddress || ""
    }
    wx.setStorageSync("Submitobj", Submitobj);
  },
  // 授权获取用户手机号
  getPhoneNumber: function (e) {
    var that = this;
    wx.login({
      success: res => {
        wx.request({
          url: config.getPhone,
          data: {
            'encryptedData': e.detail.encryptedData,
            'iv': e.detail.iv,
            'code': res.code
          },
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            console.log(res)
            if (res.data.result == 0) {
              //存入缓存即可
              if (res.data.data.phoneNumber) {
                that.setData({
                  receierPhone: res.data.data.phoneNumber
                }) 
                that.CloseBindPhoneFn();
                wx.showToast({
                  title: '获取成功',
                  icon: 'none',
                  duration: 2000
                })
                // 获取手机号成功的时候把手机号存入内存
                let Submitobj = {
                  receiverName: that.data.receiverName,
                  receierPhone: that.data.receierPhone,
                  receiverAddress: that.data.receiverAddress || ""
                }
                wx.setStorageSync("Submitobj", Submitobj);
              }

            }
            that.CloseBindPhoneFn();
          },
          fail: function (err) {
            console.log(err);
            that.CloseBindPhoneFn();
          }
        })
      }
    })
  },
  // 关闭弹出框
  CloseBindPhoneFn: function() {
    this.setData({
      showBindPhone: false
    })
  },
  // 获取fromId
  getFromId: function(playid) {
    var sessionKey = wx.getStorageSync('userId');
    wx.request({
      url: config.getfromId, //仅为示例，并非真实的接口地址
      method: "post",
      data: {
        formId: playid,
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
  formSubmit: function(e) {
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
    if (this.data.loadingStatus) {
      return;
    }
    if (e.detail.value.receiverName == "") {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (e.detail.value.receierPhone == "") {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (e.detail.value.receierPhone && !/^1\d{10}$/.test(e.detail.value.receierPhone)) {
      wx.showToast({
        title: '请输入正确手机号码',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (wx.getStorageSync("isExpress") === 1) {
      if (!this.data.receiverAddress) {
        wx.showToast({
          title: '请填写收货地址',
          icon: 'none',
          duration: 2000
        })
        return;
      }
    } else {
      this.setData({
        receiverAddress: ''
      })
    }
    if (wx.getStorageSync("customerPick") === 1) {
      if (!this.data.station) {
        wx.showToast({
          title: '请选择提货站点',
          icon: 'none',
          duration: 2000
        })
        return;
      }
    }
    this.setData({
      loadingStatus: true
    })
    let Submitobj = e.detail.value;
    if (this.data.station) {
      Submitobj.pickupStoreId = this.data.station.siteId;
    }
    Submitobj.receiverAddress = this.data.receiverAddress;
    Submitobj.sessionKey = wx.getStorageSync('orderInfo').sessionKey;
    Submitobj.activityId = wx.getStorageSync('orderInfo').activityId;
    Submitobj.itemList = wx.getStorageSync('orderInfo').itemList;
    delete Submitobj.takeStation;
    wx.setStorageSync("Submitobj", Submitobj);
    this.pay(Submitobj);
  },
  // 调用添加团购
  pay(data) {
    const that = this;
    data.receiveAddressId = wx.getStorageSync("presentAddress").siteId || 0;
    if (wx.getStorageSync('ifNewUser') == 2) {
      app.isOldUser(wx.getStorageSync('userId'), (data1) => {
        if (data1 > 0) {
          wx.showToast({
            title: '该活动为新用户专享，仅限购买一个',
            icon: 'none',
            duration: 2000
          });
          that.setData({
            loadingStatus: false
          })
        } else {
          wx.showLoading();
          wx.request({
            url: config.saveGroupOrder,
            method: "post",
            data: data,
            success(res) {
              if (res.data.code === 0) {
                if (res.data.value.qrcode) {
                  wx.setStorageSync("qrcodeOne", res.data.value.qrcode);
                } else {
                  wx.setStorageSync("qrcodeOne", '');
                }

                wx.request({
                  url: config.onLineGroupPay + "?orderCode=" + res.data.value.orderCode + "&sessionKey=" + wx.getStorageSync("orderInfo").sessionKey,
                  method: "get",
                  success(res) {
                    if (res.data.code === 0) {
                      console.log(res.data.value.packageStr);
                      wx.requestPayment({
                        timeStamp: res.data.value.timestamp,
                        nonceStr: res.data.value.noncestr,
                        package: res.data.value.packageStr,
                        signType: res.data.value.signType,
                        paySign: res.data.value.sign,
                        success(res) {
                          // 清空购物车的列表信息
                          app.globalData.listActivityGoods = [];
                          wx.hideLoading();
                          //购买数增加
                          that.setData({
                            loadingStatus: false
                          })
                          wx.hideLoading();
                          wx.navigateTo({
                            url: '../paySucceed/paySucceed',
                          })
                        },
                        fail(err) {
                          that.setData({
                            loadingStatus: false
                          })
                          wx.hideLoading();
                        }
                      })
                    } else {
                      that.setData({
                        loadingStatus: false
                      })
                      wx.hideLoading();
                      wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  },
                  fail(err) {
                    that.setData({
                      loadingStatus: false
                    })
                    wx.showToast({
                      title: '网络连接失败，请重试',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                })
              } else {
                that.setData({
                  loadingStatus: false
                })
                wx.hideLoading();
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail(err) {
              that.setData({
                loadingStatus: false
              })
              wx.showToast({
                title: '网络连接失败，请重试',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      });
    } else {
      wx.showLoading();
      wx.request({
        url: config.saveGroupOrder,
        method: "post",
        data: data,
        success(res) {
          if (res.data.code === 0) {
            if (res.data.value.qrcode) {
              wx.setStorageSync("qrcodeOne", res.data.value.qrcode);
            } else {
              wx.setStorageSync("qrcodeOne", '');
            }

            wx.request({
              url: config.onLineGroupPay + "?orderCode=" + res.data.value.orderCode + "&sessionKey=" + wx.getStorageSync("orderInfo").sessionKey,
              method: "get",
              success(res) {
                if (res.data.code === 0) {
                  let playid = res.data.value.packageStr
                  that.getFromId(playid);
                  wx.requestPayment({
                    timeStamp: res.data.value.timestamp,
                    nonceStr: res.data.value.noncestr,
                    package: res.data.value.packageStr,
                    signType: res.data.value.signType,
                    paySign: res.data.value.sign,
                    success(res) {
                      // 清空购物车的列表信息
                      app.globalData.listActivityGoods = [];
                      wx.hideLoading();
                      //购买数增加
                      that.setData({
                        loadingStatus: false
                      })
                      wx.hideLoading();
                      wx.navigateTo({
                        url: '../paySucceed/paySucceed',
                      })
                    },
                    fail(err) {
                      that.setData({
                        loadingStatus: false
                      })
                      wx.hideLoading();
                    }
                  })
                } else {
                  that.setData({
                    loadingStatus: false
                  })
                  wx.hideLoading();
                  wx.showToast({
                    title: '网络连接失败，请重试',
                    icon: 'none',
                    duration: 2000
                  })
                }
              },
              fail(err) {
                that.setData({
                  loadingStatus: false
                })
                wx.showToast({
                  title: '网络连接失败，请重试',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          } else {
            that.setData({
              loadingStatus: false
            })
            wx.hideLoading();
            wx.showToast({
              title: '网络连接失败，请重试',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail(err) {
          that.setData({
            loadingStatus: false
          })
          wx.showToast({
            title: '网络连接失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }

  },
  // 获取文本域内容
  getTextarea: function(e) {
    this.setData({
      receiverAddress: e.detail.value
    })
  },
  // 打开选择提货点
  // goTackStation: function(e) {
  //   if (!this.data.loadingStatus) {
  //     if (this.data.receierPhone) {
  //       let Submitobj = {
  //         receiverName: this.data.receiverName,
  //         receierPhone: this.data.receierPhone,
  //         receiverAddress: this.data.receiverAddress
  //       }
  //       wx.setStorageSync("Submitobj", Submitobj);
  //     }
  //     wx.navigateTo({
  //       url: '../takeTheirStation/takeTheirStation'
  //     })
  //   }
  // },
  //监听表单的输入
  watchInput(e) {
    this.setData({
      [e.currentTarget.dataset.iptName]: e.detail.value
    })
  },
  onShow() {
    this.setData({
      station: wx.getStorageSync('presentAddress') || null,
      loadingStatus: false,
      Totalprice: wx.getStorageSync('orderInfo').totalPrice,
      customerPick: wx.getStorageSync('customerPick'),
      isExpress: wx.getStorageSync('isExpress')
    })
    // 显示的时候获取提货站点
    const that = this;
    //先判断后端缓存用户是否含有手机号姓名，站点等信息
    wx.request({
      url: config.getAddress + "?sessionKey=" + wx.getStorageSync("userId"),
      method: "get",
      success(res) {
        if (res.data.code === 0 && res.data.value) {
          // wx.setStorageSync("receiveAddressId", res.data.value.idString);
          if (wx.getStorageSync("Submitobj")) {
            if (!wx.getStorageSync("Submitobj").receierPhone) {
              that.setData({
                receierPhone: res.data.value.phone
              })
            } else {
              that.setData({
                receierPhone: wx.getStorageSync("Submitobj").receierPhone
              })
            }
            if (!wx.getStorageSync("Submitobj").receiverName) {
              that.setData({
                receiverName: res.data.value.name,
                receiverAddress: wx.getStorageSync("Submitobj").receiverAddress || ""
              })
            } else {
              that.setData({
                receiverName: wx.getStorageSync("Submitobj").receiverName,
                receiverAddress: wx.getStorageSync("Submitobj").receiverAddress || ""
              })
            }
          } else {
            that.setData({
              receiverName: res.data.value.name,
              receierPhone: res.data.value.phone,
              receiverAddress: wx.getStorageSync("Submitobj").receiverAddress || ""
            })
          }
          if (!wx.getStorageSync("branchId")) {
            wx.setStorageSync("branchId", res.data.value.pickupStoreId);
          }
          wx.request({
            url: config.getSelfLiftStation + "?activityId=" + wx.getStorageSync("orderInfo").activityId,
            method: "get",
            success(res) {
              if (res.data.code === 0) {
                res.data.value.forEach((item, index) => {
                  if (item.branchId === wx.getStorageSync("branchId")) {
                    // wx.setStorageSync('station', item);
                    wx.setStorageSync('staIndex', index);
                  }
                })
                // that.setData({
                //   station: wx.getStorageSync('station')
                // })
              }
            }
          })
        } else {
          if (wx.getStorageSync("Submitobj")) {
            // 如果没有缓存手机号弹出授权手机号弹出框
            if (!wx.getStorageSync("Submitobj").receierPhone) {
              that.setData({
                showBindPhone: true
              })
            }
            that.setData({
              receiverName: wx.getStorageSync("Submitobj").receiverName,
              receierPhone: wx.getStorageSync("Submitobj").receierPhone,
              receiverAddress: wx.getStorageSync("Submitobj").receiverAddress || ""
            })
          } else {
            that.setData({
              showBindPhone: true
            })
          }
          if (wx.getStorageSync("branchId")) {
            wx.request({
              url: config.getSelfLiftStation + "?activityId=" + wx.getStorageSync("orderInfo").activityId,
              method: "get",
              success(res) {
                if (res.data.code === 0) {
                  res.data.value.forEach((item, index) => {
                    if (item.branchId === wx.getStorageSync("branchId")) {
                      // wx.setStorageSync('station', item);
                      wx.setStorageSync('staIndex', index);
                    }
                  })
                  // that.setData({
                  //   station: wx.getStorageSync('station')
                  // })
                }
              }
            })
          }
          // wx.setStorageSync("receiveAddressId", null);
        }
      },
      fail (err) {
        if (wx.getStorageSync("Submitobj")) {
          // 如果没有缓存手机号弹出授权手机号弹出框
          if (!wx.getStorageSync("Submitobj").receierPhone) {
            that.setData({
              showBindPhone: true
            })
          }
          that.setData({
            receiverName: wx.getStorageSync("Submitobj").receiverName,
            receierPhone: wx.getStorageSync("Submitobj").receierPhone,
            receiverAddress: wx.getStorageSync("Submitobj").receiverAddress || ""
          })
        } else {
          that.setData({
            showBindPhone: true
          })
        }
        if (wx.getStorageSync("branchId")) {
          wx.request({
            url: config.getSelfLiftStation + "?activityId=" + wx.getStorageSync("orderInfo").activityId,
            method: "get",
            success(res) {
              if (res.data.code === 0) {
                res.data.value.forEach((item, index) => {
                  if (item.branchId === wx.getStorageSync("branchId")) {
                    // wx.setStorageSync('station', item);
                    wx.setStorageSync('staIndex', index);
                  }
                })
                // that.setData({
                //   station: wx.getStorageSync('station')
                // })
              }
            }
          })
        }
        // wx.setStorageSync("receiveAddressId", null);
      }
    })
  }
})