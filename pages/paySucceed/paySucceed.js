const config = require('../../config.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isattention:false,
    imageList: [],
    isFollow: "",
    qrcodeOne: wx.getStorageSync("qrcodeOne") || null
  },

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
  gotoHomeBtn : function (){
    wx.switchTab({
      url: '../../pages/activeIndex/activeIndex'
    })
  },
  copyBtn: function (e) { 
    var that = this; 
    wx.setClipboardData({ 
      data: that.data.redeemCode, 
      success: function (res) { 
        wx.showToast({ title: '复制成功', }); 
      } 
    }); 
  },
  onShow() {
   
    var base64img = wx.getStorageSync("qrcodeOne");
    this.setData({
      qrcodeOne: base64img 
    }),
    console.log(base64img);
    // 将后台传来的base64图片显示出来
    // var arrayimg = wx.base64ToArrayBuffer(base64img); 
    // var base64 = wx.arrayBufferToBase64(arrayimg);
    // this.setData({ 
    //   qrcodeOne: "data:image/png;base64," + base64 
    //   }, ()=>{
    //     console.log("data:image/png;base64," + base64);
    //   }); 
  }

})