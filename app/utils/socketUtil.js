import storage from "./storage";
import { DeviceEventEmitter, Platform } from "react-native";

var { NativeModules } = require('react-native');
var remNotification = NativeModules.REMNotification;
var socketIO = require('socket.io-client');

let socket, ticketSocket;

export default {
  connectTicketClient: async function (userId) {
    // var address = 'https://wss-prod.energymost.com/mobile-msg';
    // var address = 'https://wss-test.energymost.com/mobile-msg';//appInfo.get().taskCenterUri;
    let host = storage.getOssBucket()
    if (host) {
      host = host.trim();
      let index = host.lastIndexOf(':')
      if (index > 0 && index !== 4 && index !== 5) {
        host = host.substring(0, index);
      }
    }
    // var address = 'http://wss-test-k3s.energymost.com/web-msg';
    var address = `${host}:32021/web-msg`//'http://172.26.197.160:96/web-msg';'http://wss-test-k3s.energymost.com/web-msg'//
    var sysType = 1;
    var userId = userId//this.props.user.getIn(['user','Id']);
    // var groupKey = this.props.substation.id;//变电所 ID
    var customerId = 0;
    var token = await storage.getToken();
    var deviceid = await storage.getDeviceId();
    // address += "?userId=" + userId + "&customerId=" + customerId + "&sysType=" + sysType +"&deviceId="+deviceid;
    if (ticketSocket) ticketSocket.disconnect();
    address += "?event=popticketupdate" + "&sysType=" + sysType + "&userId=" + userId + "&groupKey=" + userId + "&deviceId=" + deviceid + "&customerId=0";

    remNotification.connectSocketIO && remNotification.connectSocketIO(address);
    if (true) return;
    // console.warn('toden,deviceid...',token,deviceid,address);
    let socket = socketIO.connect(address, {
      timeout: 10000,
      jsonp: false,
      transports: ['polling'],
      autoConnect: true,
      agent: '-',
      // path: '/', // Whatever your path is
      pfx: '-',
      key: token, // Using token-based auth.
      // passphrase: cookie, // Using cookie auth.
      cert: '-',
      ca: '-',
      ciphers: '-',
      rejectUnauthorized: '-',
      perMessageDeflate: '-'
    });
    ticketSocket = socket;
    console.warn('socketIO:will connect...', address);
    socket.on('connect', function () {
      console.warn("socketIO:client conn " + address + " success");
    });

    socket.on('server', function (data) {
      console.warn(`socketIO:RCV server ${JSON.stringify(data)}`);
    });

    socket.on('popticketupdate', (data) => {
      //{"id":18,"customerId":"3","content":{"id":0,"fromId":0,"toId":0,"title":"","subTitle":"","messageType":0,"objectId":0,"unread":false,"createdTime":"2022-02-10 15:22:54"}}
      console.warn(Date.now(), `socketIO:RCV paramupdate ${JSON.stringify(data)}`);
      if (data && data.content) {
        let type = 'work_ticket';
        if (data.content.messageType === 20) {
          type = 'ticket';
        }
        if (data.id !== global._preNotifyId) {
          //发送通知
          DeviceEventEmitter.emit('notifyRefresh')
          global._preNotifyId = data.id;
          if (Platform.OS === 'android') {
            remNotification.localNotification(data.content.title, data.content.subTitle, String(data.content.objectId), type);
          }
        }
      }
    });

    socket.on('error', (error) => {
      console.warn(`socketIO:error：${error}`);
    });
    socket.on('disconnect', (reason) => {
      console.warn(`socketIO:disconnect：${reason}`);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        this._connectTicketClient();
      }
      // else the socket will automatically try to reconnect
    });
  },

  connectSanPiaoClient: async function (userId, substationId) {
    // var address = 'https://wss-prod.energymost.com/mobile-msg';
    // var address = 'https://wss-test.energymost.com/mobile-msg';//appInfo.get().taskCenterUri;
    if (socket) socket.disconnect()
    let host = storage.getOssBucket()
    if (host) {
      host = host.trim();
      let index = host.lastIndexOf(':')
      if (index > 0 && index !== 4 && index !== 5) {
        host = host.substring(0, index);
      }
    }
    var address = `${host}:32021/web-msg`//'http://172.26.197.160:96/web-msg';'http://wss-test-k3s.energymost.com/web-msg'//
    var sysType = 1;
    var userId = userId//this.props.user.getIn(['user','Id']);
    var groupKey = substationId; //this.props.substation.id;//变电所 ID
    var customerId = 0;
    var token = await storage.getToken();
    var deviceid = await storage.getDeviceId();
    // address += "?userId=" + userId + "&customerId=" + customerId + "&sysType=" + sysType +"&deviceId="+deviceid;

    address += "?event=popticketupdate" + "&sysType=" + sysType + "&userId=" + userId + "&groupKey=" + groupKey + "&deviceId=" + deviceid + "&customerId=0";
    // console.warn('toden,deviceid...',token,deviceid,address);

    remNotification.connectSocketIO && remNotification.connectSocketIO(address);
    return;
    socket = socketIO.connect(address, {
      timeout: 10000,
      jsonp: false,
      transports: ['polling'],
      autoConnect: true,
      agent: '-',
      // path: '/', // Whatever your path is
      pfx: '-',
      key: token, // Using token-based auth.
      // passphrase: cookie, // Using cookie auth.
      cert: '-',
      ca: '-',
      ciphers: '-',
      rejectUnauthorized: '-',
      perMessageDeflate: '-'
    });
    console.warn('socketIO:will connect...', address);
    socket.on('connect', function () {
      console.warn("socketIO:client conn " + address + " success");
    });

    socket.on('server', function (data) {
      console.warn(`socketIO:RCV server ${JSON.stringify(data)}`);
    });

    socket.on('popticketupdate', (data) => {
      //{"id":18,"customerId":"3","content":{"id":0,"fromId":0,"toId":0,"title":"","subTitle":"","messageType":0,"objectId":0,"unread":false,"createdTime":"2022-02-10 15:22:54"}}
      console.warn(Date.now(), `socketIO:RCV paramupdate ${JSON.stringify(data)}`);
      if (data && data.content) {
        let type = 'work_ticket';
        if (data.content.messageType === 20) {
          type = 'ticket';
        }
        if (data.id !== global._preNotifyId) {
          //发送通知
          DeviceEventEmitter.emit('notifyRefresh')
          global._preNotifyId = data.id;
          remNotification.localNotification(data.content.title, data.content.subTitle, String(data.content.objectId), type);
        }
      }
    });

    socket.on('error', (error) => {
      console.warn(`socketIO:error：${error}`);
    });
    socket.on('disconnect', (reason) => {
      console.warn(`socketIO:disconnect：${reason}`);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        // this._connectSanPiaoClient();
      }
    });
  }
}


