const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const lastTime = date => {
  let time = date - new Date().getTime();
  if (time <= 0) {
    return time;
  }
  // 秒数
  var second = time;
  // 天数位
  var day = Math.floor(second / 3600 / 24 / 1000);
  var dayStr = day.toString();
  if (dayStr.length == 1) dayStr = '0' + dayStr;
  // var day = 0;

  // 小时位
  var hr = Math.floor((second - day * 3600 * 24 * 1000) / 3600 / 1000);
  var hrStr = hr.toString();
  if (hrStr.length == 1) hrStr = '0' + hrStr;

  // 分钟位
  var min = Math.floor((second - day * 3600 * 24 * 1000 - hr * 3600 * 1000) / 60 / 1000);
  var minStr = min.toString();
  if (minStr.length == 1) minStr = '0' + minStr;

  // 秒位
  var sec = Math.floor((second - day * 3600 * 24 * 1000 - hr * 3600 * 1000 - min * 60 * 1000) / 1000);
  var secStr = sec.toString();
  if (secStr.length == 1) secStr = '0' + secStr;
  return dayStr+"天" +hrStr + "时" + minStr + "分" + secStr+ "秒";
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const toleavepenny = (n) => {
  if (!n) {
    n = 0;
  }
  // n = n / 100;
  let m = n.toString().split(".");
  if (m[1]) {
    if (m[1].length < 2) {
      m[1] = m[1] + "0"
    } else if (m[1].length >= 2) {
      m[1] = m[1].substring(0, 2);
    }
  } else {
    m.push("00");
  }
  return m.join(".");
};
//解决浮点数计算不精确的问题
//两浮点数相加
const accAdd = (arg1, arg2) => {
  var r1, r2, m, c;
  try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
    var cm = Math.pow(10, c);
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", "")) * cm;
    }
    else {
      arg1 = Number(arg1.toString().replace(".", "")) * cm;
      arg2 = Number(arg2.toString().replace(".", ""));
    }
  }
  else {
    arg1 = Number(arg1.toString().replace(".", ""));
    arg2 = Number(arg2.toString().replace(".", ""));
  }
  return (arg1 + arg2) / m
}
//两浮点数相乘
const mul = (arg1, arg2) => {
  var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
  try { m += s1.split(".")[1].length } catch (e) { }
  try { m += s2.split(".")[1].length } catch (e) { }
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}

// 接口调用地址
const ip = "http://gtop-trial.gyexpress.cn";

function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}

module.exports = {
  formatTime: formatTime,
  ip,
  lastTime,
  toleavepenny,
  accAdd,
  mul, 
  formatLocation
}


