

import storage from '../utils/storage';
import { Platform } from 'react-native';
import appInfo from '../utils/appInfo.js';
import CryptoJS from "crypto-js";
import { getLanguage } from "../utils/Localizations/localization";
import { da } from "pinyin/data/dict-zi-web";

///请求状态
export const RequestStatus = {
  initial: 'initial',///初始换状态
  loading: 'loading',///加载中,正在请求
  success: 'success',///请求成功
  error: 'error',///请求失败
}

export var TOKENHEADER = "Cookie";
export var JWTTOKENHEADER = "Authorization";
export var HEADERDEVICEID = "disco-deviceid";
export var HEADERCUSTOMERID = "CurrentCustomerId";

var _BASEURL = '';

export const controller = new AbortController();

export function getBaseUri() {
  return _BASEURL;
}

export function getMethodUri(urlMethod, userName) {
  var os = Platform.OS;
  var { versionName } = appInfo.get();
  var url = _BASEURL + urlMethod;// + `?platform=${os}&version=${versionName}&username=${userName}`;
  return url;
}

export function getUriHmac(url, timestamp, verb, body) {
  let sMetParam = url.substring(url.indexOf('/api'), url.length);
  let sHmac = '';
  if (verb === 'post') {
    sHmac = CryptoJS.MD5(sMetParam + JSON.stringify(body) + timestamp).toString();
  } else if (verb === 'get') {
    sHmac = CryptoJS.MD5(sMetParam + timestamp).toString();
  }
  // console.warn('-------CryptoJS:',sMetParam+JSON.stringify(body)+timestamp,verb,JSON.stringify(body),sHmac);

  return sHmac;
}

let validateHost = null;

export function clearValidateHost() {
  validateHost = null;
}

//设备列表图片的host
export function getImageHost() {
  return _BASEURL//'http://starbucks-xt.eh.energymost.com'
}

export function setValidateHost(host) {
  validateHost = host;
}

function fillPostFix(host) {
  //判断是否带有api后缀，没有，需要补上
  if (host) {
    host = host.trim();
    if (!host.endsWith('api/')) {
      if (host.endsWith('api')) {
        host += '/';
      } else if (host.endsWith('/')) {
        host += 'api/';
      } else {
        host += '/api/';
      }
    }
  }
  return host;
}

function configLan() {
  let lan = getLanguage()
  if (lan === 'en') {
    return `en-US`
  }
  return `zh-CN`
}

var defaultFetch = async function (options) {
  // var isProd = await storage.getItem('prod');
  // console.warn('appInfo.get().prod',appInfo.get().prod);
  var baseUrl = _BASEURL = await storage.getOssBucket();
  // let baseUrl = 'http://39.98.50.32:31888';
  // var baseUrl = _BASEURL = 'http://pop-ticket-api-to.energymost.com';//
  // console.warn('---------',baseUrl);
  // if(appInfo.get().prod){
  //   baseUrl = appInfo.get().prod;
  //   _BASEURL = baseUrl;
  // }
  if (validateHost) {
    baseUrl = validateHost;
    _BASEURL = validateHost;
  }

  // baseUrl = fillPostFix(baseUrl);
  // _BASEURL = baseUrl;

  var token = await storage.getToken();
  var jwtToken = await storage.getJwtToken();
  var deviceid = await storage.getDeviceId();
  var osspath = await storage.getItem("OSSPATH");
  var knowledgeToken = await storage.getItem("KNOWLEDGETOKEN");
  var hostCallin = await storage.getItem("CALLINHOST");
  var hostKnowledge = await storage.getItem("KNOWLEDGEHOST");
  var customerId = await storage.getCustomerId();

  var headers = {
    "Content-Type": "application/json",
    'Accept': 'application/json',
    'Cache-Control': 'no-store',
    'Accept-Language': configLan(),
  };
  if (token) {
    headers[TOKENHEADER] = token;
    //headers[JWTTOKENHEADER] = jwtToken;
  }
  headers[HEADERDEVICEID] = deviceid;
  //headers[HEADERCUSTOMERID] = customerId;
  if (customerId) {
    headers['Generic_field'] = customerId;
  }
  var os = Platform.OS;
  var { versionName } = appInfo.get();
  var userName = await storage.getItem('USERNAMEKEY');
  var url = baseUrl + options.url;

  // if (options.url.indexOf('/eh/') !== -1) {
  //   url = "http://starbucks-xt.eh.energymost.com" + options.url;
  //headers['Cookie'] = "hi-lang=zh-cn; _sm_au_c=kYVMTADxfOR+/GC3vBjK3BMCH4CaXAMDBJMdoCKlxDdIgAAAAqJLQaaL5HeAslcfQkmJtvfBOVEPouy2Wvrb8fK6ZM0A=; dssession=yqYaux/LJ0eTSjuX9XO7sENJjyrWESfbKUBoaL8QCV23x4kv2q3MEY9CXIyrmBhDtyDG8ibswbhVkmhUw1oeN/jcYGwVXf1MjdoOBgUhpDHfFHHWFRQ7WN6kZcd4XAhw9q7EbxKpqB5FJqIoOY85JDadPx082EH2yARwlhM6+BT7A7NSrlEh8zJLVrMHbUzMjI1czTyIux5xFz0rM7FzI8OR1/bFdaas86QiRttRv9tR4t5rVngPyanV+IjwCavtw5AhsfsytKPlhYpfYQQ6GVgf+Qai1sFE8D/xmEuS1xeXgpnPTYzJsYJs9reZsYZeIhIvWc+rrAnLhfFRyqaoBOr3YEQqvfaRQsivkT8jAvFx8hil47UZzNKshaq/PhpQYBZrduZzIfJB8GcdGfPKCTVq8NE2tdVlIxJjUwqKkd8IanMYw1bM88TpSa83vrrmyivkiL6gcaGM0TNY64qWoMx677xuRoCwjmf8ga65MA6VYCfteVsky0WAvZngE7KpwsYkOQxmTlLUfa+wfRfng1aJksP3zGoXMuGThCpwasr490iVheiZKa8E1gV2lV44w1E6jIN++bnaWgv/VtLn6SqHXQwVXVeFnJ8YmkqsImxICJWNVXkJDcFGHuXMvxydOBHocnlVce+aaiUSkD2+pdPKzL3NwlM813GzmBg23tA=.TCF9LiR61T2lZZeb7Nmtgp+j66w=";
  // }

  let timestamp = new Date().getTime();
  let sHmac = getUriHmac(url, timestamp, options.verb, options.body);

  headers['timestamp'] = timestamp;
  headers['hmac'] = sHmac;

  // if (url.indexOf('/inf/api/order/') !== -1) {//callin ticket and alarm
  //   url = hostCallin + options.url;
  //   options.body = Object.assign({}, options.body, {
  //     token: callinToken,
  //   })
  // }
  if (url.indexOf('sgai-certificate/') !== -1) {
    url = hostKnowledge + options.url;
    headers["Auth-Token"] = knowledgeToken;//"eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJqd3QiLCJpYXQiOjE2Nzk0NDQxMjQsInN1YiI6IntcImVtYWlsXCI6XCJhZG1pbkBzZS5jb21cIixcImdjb2RlXCI6XCIzYTVkMTM5NDJjY2Y0ZDkyODI3NWRhYWY3MDcxYzA5NFwiLFwibW9iaWxlXCI6XCIxMzk5OTk5OTk5N1wiLFwicmVhbE5hbWVcIjpcImFkbWluXCIsXCJ1c2VySWRcIjo4MTM5Mjh9IiwiZXhwIjoxNjc5NDg3MzI0fQ.jLFtkIqQYFttx_pO_smRuLCX7-ZKAkbZMLct7x1XRRE";
  }

  let body = JSON.stringify(options.body);
  let requestParams = {
    method: options.verb,
    headers,
  }
  if (body) {
    requestParams['body'] = body;
    // console.log('请求参数:' + body);
  }

  return fetch(url, requestParams)
    .then((response) => {
      if (response.status === 204) {
        return new Promise((resolve) => {
          resolve({ Result: true, Error: '0' });
        })
      } else if (response.status === 401) {
        console.log('>>', response, response.text())
        return new Promise((resolve) => {
          resolve({ Result: false, Error: '401' });
        })
      } else if (response.status === 403) {
        return new Promise((resolve) => {
          resolve({ Result: false, Error: '403' });
        })
      } else if (response.status === 404) {
        return new Promise((resolve) => {
          resolve({ Result: false, Error: '404' });
        })
      } else if (response.status >= 500) {
        return new Promise((resolve) => {
          resolve({ Result: false, Error: '503' });
        })
      }
      return response;
    })
    .then(async (objResult) => {
      let data = {};
      if (objResult) {
        if (objResult.Result !== undefined && objResult.Result === false && objResult.Error && objResult.code !== "0") {
          data = objResult;
        } else {
          data = await objResult.json();
        }
      }
      console.log('\n\n请求参数:' + body + '\n请求地址:' + url + '\n请求头:' + JSON.stringify(headers) + '\n请求结果:', data, + '\n\n');
      ///兼容话务工单相关接口请求
      if (data.retCode) {
        if (data.retCode == '0000') {
          return data.retData;
        } else if (data.retCode == '9999') {
          data.message = data.retMsg;
          return Promise.reject(data);
        }
      }

      if (data.code == 200 || data.error == 0 || data.Error == 0 || data.status == 200 || objResult.status == 200) {
        if ((options.type === 'LOGIN_SUCCESS' || options.type === 'LOGIN_BY_PASSWORD_SUCCESS')
          && data.Result) {
          data.Result["Token"] = objResult.headers.get('Set-Cookie');
        }
        ///请求成功了
        if (data.Result) {
          //如果有错误码
          if (data.Error && (data.Error !== '0' && data.Error !== '200' && data.Error !== 200)) {
            return Promise.reject(data);
          }
          return data.Result;
        }
        if (data.result !== undefined && data.result !== null) {
          data["Result"] = data.result;
          data.result = undefined;
          return data.Result;
        }
        if (data.data !== undefined && data.data !== null) {
          data["Result"] = data.data;
          data.data = undefined;
          return data.Result;
        }
        ///保存点检记录,返回的data为null
        // if (data.data === null) {
        //   data["Result"] = [];
        //   data.data = undefined;
        //   return data.Result;
        // }
        ///有些垃圾数据 {code:200, result: null, message: '请求成功'}
        if (data.code == 200 && (data.data == null || data.result == null)) {
          return {};
        }

        ///{"Code": 0,"Data": {"datas":[]}, "Msg":null}
        ///兼容获取课室信息
        if (data.Code == 0) {
          if (data.Data) {
            return data.Data;
          }
        }

        let msg = data.message || data.msg;
        if (data.code && msg && !data.data) {
          if (data.code == 0) {
            return data;
          } else {
            return Promise.reject(data);
          }
        }
        if (data.code == 0 && data.data == null) {
          return data.data;
        }

        ///返回为空
        return Promise.reject(data);
      } else {
        ///请求发生了错误
        return Promise.reject(data);
      }
    });
}



export default (store) => (next) => (action) => {
  let { url, body, types, method } = action;
  if (typeof url === 'undefined') {
    return next(action);
  }

  const [requestType, successType, failureType] = types;
  next(Object.assign({}, action, { type: requestType }));
  return defaultFetch({ url, body, verb: body ? 'post' : "get", type: successType }).then(async (data) => {
    next(Object.assign({}, action, { type: successType, response: data }));
  }, (error) => {
    next(Object.assign({}, action, { type: failureType, error }));
  });

};
