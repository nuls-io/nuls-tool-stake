import nuls from 'nuls-sdk-js'
import {BigNumber} from 'bignumber.js'
import {API_CHAIN_ID, API_PREFIX} from '@/config'
import copy from 'copy-to-clipboard'

/**
 * 10的N 次方
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Power(arg) {
  let newPower = new BigNumber(10);
  return newPower.pow(arg);
}

/**
 * 减法
 * @param nu
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Minus(nu, arg) {
  let newMinus = new BigNumber(nu);
  return newMinus.minus(arg);
}

/**
 * 乘法
 * @param nu
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Times(nu, arg) {
  let newTimes = new BigNumber(nu);
  return newTimes.times(arg);
}

/**
 * 加法
 * @param nu
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Plus(nu, arg) {
  let newPlus = new BigNumber(nu);
  return newPlus.plus(arg);
}

/**
 * 除法
 * @param nu
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Division(nu, arg) {
  let newDiv = new BigNumber(nu);
  return newDiv.div(arg);
}

/**
 * 数字除以精度系数
 */
export function divisionDecimals(nu, decimals = 8) {
  let newNu = new BigNumber(Division(nu, Power(decimals)).toString());
  return newNu.toFormat().replace(/[,]/g, '');
}

/**
 * 数字乘以精度系数
 */
export function timesDecimals(nu, decimals = 8) {
  let newNu = new BigNumber(Times(nu, Power(decimals)).toString());
  return Number(newNu);
}

/**
 * 复制 copy
 * @param value
 */
export const copys = (value) => copy(value);

/**
 * @disc: 验证密码
 * @params:  accountInfo
 * @params:  password
 * @date: 2019-08-22 12:05
 * @author: Wave
 */
export function passwordVerification(accountInfo, password) {
  let aesPri = accountInfo.aesPri ? accountInfo.aesPri : accountInfo.encryptedPrivateKey;
  const pri = nuls.decrypteOfAES(aesPri, password);
  const newAddressInfo = nuls.importByKey(API_CHAIN_ID, pri, password, API_PREFIX);
  if (newAddressInfo.address === accountInfo.address) {
    return {success: true, pri: pri, pub: accountInfo.pub, address: accountInfo.address, aesPri: newAddressInfo.aesPri};
  } else {
    return {success: false};
  }
}

/**
 * 获取链ID
 * @returns {number}
 */
export function chainID() {
  return API_CHAIN_ID
}

/**
 * 获取chainId+number
 * @returns {string}
 */
export function chainIdNumber() {
  return 'chainId' + chainID();
}

/**
 * 获取地址列表或选择地址
 * @param type 0:地址列表，1:选中地址
 * @returns {*}
 */
export function addressInfo(type) {
  let chainNumber = 'chainId' + chainID();
  let addressList = localStorage.hasOwnProperty(chainNumber) ? JSON.parse(localStorage.getItem(chainNumber)) : [];
  if (addressList) {
    if (type === 0) {
      return addressList
    } else {
      for (let item  of addressList) {
        if (item.selection) {
          return item
        }
      }
    }
  } else {
    return addressList
  }
}

/**
 * 超长数字显示
 * @param nu
 * @param powerNu
 * @returns {string}
 */
export function langNumber(nu, powerNu) {
  let newNu = new BigNumber(Division(nu, powerNu).toString());
  return newNu.toFormat().replace(/[,]/g, '');
}

/**
 * 字符串中间显示....
 * @param string
 * @param leng
 * @returns {*}
 */
export function superLong(string, leng) {
  if (string && string.length > 10) {
    return string.substr(0, leng) + "...." + string.substr(string.length - leng, string.length);
  } else {
    return string;
  }
}

/**
 * 连接跳转
 * @param name
 * @param parameter
 * @param type 0:路由跳转 1：连接跳转（浏览器、其他地址）
 */
export function connect(name, parameter, type) {
  if (type === 0) {
    let newQuery = {};
    let newPush = {name: name};
    if (!parameter) {
      if (name === 'projectsInfo') {
        newQuery = {releaseId: parameter}
      }
      newPush.query = newQuery;
    }
    return {success: true, data: newPush};
  } else {
    window.open(name, '_blank');
    return {success: false};
  }
}


/**
 * @param n 输入数字
 * @param is_int 是否只显示整数
 * @returns {string}
 */
export function formatNum(n, is_int = true) {
  //转化成字符串
  let str = n.toString();
  //若是整数自动补全小数位
  if (-1 === str.indexOf(".")) {
    str = str + ".00"
  }
  //全部替换
  if (-1 !== str.indexOf(",")) {
    str = str.replace(new RegExp(',', "g"), "")
  }
  let intSum = str.substring(0, str.indexOf(".")).replace(/\B(?=(?:\d{3})+$)/g, ',');//取到整数部分
  if (is_int) {
    return intSum;
  }
  let dot = str.substring(str.length, str.indexOf(".")); //取到小数部分搜索
  let ret = intSum + dot;
  return ret;
}

/**
 * 根据不同时区显示时间
 * @param time
 * @returns {*}
 */
export function getLocalTime(time) {
  if (typeof time !== 'number') return;
  let d = new Date();
  let offset = d.getTimezoneOffset() * 60000;
  let localUtc = new Date().getTimezoneOffset() / 60;
  let utcTime;
  if (localUtc > 0) {
    utcTime = time - offset;
  } else {
    utcTime = time + offset;
  }
  let localTime = utcTime + 3600000 * Math.abs(localUtc);
  return new Date(localTime);
}

/**
 * @disc: 数组去重
 * @params:
 * @date: 2021-03-16 15:38
 * @author: Wave
 */
export function arrDistinctByProp(arr, name) {
    let map = new Map();
    for (let item of arr) {
      if (!map.has(item[name])) {
        map.set(item[name], item);
      }
    }
    return [...map.values()];
}

/**
 * 保留指定小数位数
 * @param val 要处理的数据，Number | String
 * @param len 保留小数位数，位数不足时，以0填充
 * @param side 1|-1 对应 入|舍
 * @returns {string|number}
 */
export function tofix(val, len, side) {
  const numval = Number(val);
  if (isNaN(numval)) return 0;
  const str = val.toString();
  if (str.indexOf('.') > -1) {
    let numArr = str.split('.');
    if (numArr[1].length > len) {
      let tempnum = numval * Math.pow(10, len);
      if (!side) {
        return Number(val).toFixed(len)
      } else if (side === 1) {
        if (tempnum < 1) return (1 / Math.pow(10, len));
        return (Math.ceil(tempnum) / Math.pow(10, len)).toFixed(len)
      } else if (side === -1) {
        return (Math.floor(tempnum) / Math.pow(10, len)).toFixed(len)
      } else {
        return Number(val.toFixed(len))
      }
    } else {
      return Number(str).toFixed(len)
    }
  } else {
    return Number(val).toFixed(len)
  }
}
