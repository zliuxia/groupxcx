/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

//开发环境
// var hostOrder = "http://47.95.28.11:8505/api"//订单接口付海泉
// var hostLogin = "http://192.168.100.118:8506/api" //冯跃丽
// var getPhone = "http://192.168.100.146:8505/api" //冯跃丽
// var hostGroup = "http://47.95.28.11:8509/api"
// var env = "development";

//正式环境
// var hostGroup = "https://generalstore.gtexpress.cn/group/api"
// var hostLogin = "https://generalstore.gtexpress.cn/user/api"
// var hostOrder = "https://generalstore.gtexpress.cn/order/api"
// var env = "production";

//使用环境
var hostGroup = "https://gtop-trial.gyexpress.cn/group/api"
var hostLogin = "https://gtop-trial.gyexpress.cn/user/api"
var hostOrder = "https://gtop-trial.gyexpress.cn/order/api"
var env = "test";

// 开发环境
// var hostGroup = "http://rd.gyexpress.cn/group/api"
// var hostLogin = "http://rd.gyexpress.cn/user/api"
// var hostOrder = "http://rd.gyexpress.cn/order/api"
// var env = "dev";

//测试环境
// var hostGroup = "https://test-ec-gateway.gtexpress.cn/group/api"
// var hostLogin = "https://test-ec-gateway.gtexpress.cn/user/api"
// var hostOrder = "https://test-ec-gateway.gtexpress.cn/order/api"
// var env = "test";


var config = {
  appletVersion: "1.10.0",
  env,
  // 添加/修改当前社区
  updateGroupHistoryAddress: `${hostLogin}/user/updateGroupHistoryAddress`,
  // 获取社区
  getSiteHomePage:`${hostGroup}/communityGroupon/getSiteHomePage`,
  // 获取历史社区
  getGroupHistoryAddress: `${hostLogin}/user/getGroupHistoryAddress`,
  // 获取1.10活动列表getActivityHomePage
  getActivityHomePage: `${hostGroup}/communityGroupon/getActivityHomePage`,
  // getOrderNum
  getOrderNum: `${hostOrder}/order/getHistoryOrderStatusNums`,
  // getPhone
  getPhone: `${hostOrder}/collect/getPhone`,
  // getfromId
  getfromId: `${hostOrder}/collect/userFormId`,
  // 下面的地址配合云端 Server 工作
  getOrderById: `${hostOrder}/order/getOrderById`,
  // 活动首页的接口地址
  communityGrouponGoods: `${hostGroup}/communityGrouponGoods/getCommodityDisplay`,
  // communityGrouponGoods: `${hostGroup}/communityGrouponGoods/getCommodityDisplay`,
  // 获取用户id
  getuserIdUrl: `${hostLogin}/user/login`,
  // 获取活动banner
  getactivityBannder: `${hostGroup}/communityGroupon/getAll`,
  // 获取用户订单
  getOrderOver: `${hostOrder}/order/getOrderOver`,

  //获取团购购买历史
  getByHistoryDatas: `${hostGroup}/communityGroupon/getByHistoryDatas`,

  //获取商品详情
  getDisplayMerchandiseDetails: `${hostGroup}/communityGrouponGoods/getDisplayMerchandiseDetails`,

  //获取自提站点
  getSelfLiftStation: `${hostGroup}/communityGroupon/getSelfLiftStation`,

  // 保存团购订单信息
  saveGroupOrder: `${hostOrder}/order/saveGroupOrder`,

  //点击数增加
  addViewNum: `${hostGroup}/communityGroupon/addViewNum`,

  // 购买数增加
  addBuyNum: `${hostGroup}/communityGroupon/addBuyNum`,

  // 分享数增加
  addShareNum: `${hostGroup}/communityGroupon/addShareNum`,

  //查询用户是否已关注
  getQueryIsConcerned: `${hostGroup}/communityGroupon/getQueryIsConcerned`,

  //支付接口
  onLineGroupPay: `${hostOrder}/pay/onLineGroupPay`,

  //动态获取二维码信息
  getminiqrQr: `${hostGroup}/communityGroupon/accessToken`,

  // 获取我的订单
  getHistoryOrder: `${hostOrder}/order/getHistoryOrderMes`,
  // 获取老的我的订单
  // getHistoryOrder: `${hostOrder}/order/getHistoryOrder`,

  //查看是否为老用户
  isOldUser: `${hostGroup}/communityGroupon/getNewUserGroupOrderNums`,
  //  getHistoryOrder: `${hostOrder}/order/getHistoryOrder`

  //查询用户默认收货地址
  getAddress: `${hostLogin}/receiveAddress/getSelectByUserId`
};

module.exports = config;