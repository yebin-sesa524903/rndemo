'use strict';

import moment from 'moment';
import SQLite from './SqliteStorage.js';
var sqLite = null;

export function isServiceTicketUpdatedInCache(ticketid) {
  return isTicketUpdatedInCache(ticketid, 'service_ticket_operation')
}

//查询某个工单本地是否有修改
export function isTicketUpdatedInCache(ticketId, tableName = 'ticket_operation') {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql(`select distinct ticket_id from ${tableName} where ticket_id = ? limit 10`,
      [ticketId], (tx, results) => {
        var len = results.rows.length;
        if (len >= 1) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, (e) => {
        resolve(e);
      }
    );
  });
}

//查询本地工单总条数
//现在查询的总数是 service_tickets 和 tickets 两张表了
export function getCacheTicketCount() {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql('select distinct ticket_id from tickets limit 10000',
      [], (tx, results) => {
        var len = results.rows.length;
        // resolve(len);
        sqLite.executeSql('select distinct ticket_id from service_tickets limit 10000', [], (tx, res) => {
          let total = len + res.rows.length;
          resolve(total);
        }, e => resolve(e))
      }, (e) => {
        reject(e);
      }
    );
  });
}

//将下载的工单保存在本地数据库中
export function cacheDownloadServiceTickets(downloadDate, arrTickets) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }
  let lastUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  let ids = arrTickets.map(item => item.Id);
  //找到所有修改了的工单ID，
  sqLite.executeSql(
    "select ticket_id from service_ticket_operation GROUP BY ticket_id",
    [], (tx, result) => {
      let needDeleteIds = [].concat(ids);
      if (result.rows.length > 0) {//删除所有下载中不包括已修改的ID
        for (let i = 0; i < result.rows.length; i++) {
          let index = needDeleteIds.findIndex(item => item === result.rows.item(i).ticket_id);
          if (index >= 0) {
            needDeleteIds.splice(index, 1);
            arrTickets.splice(index, 1);//同时下载的数据中也不能插入已经修改的这些ID列
          }
        }
      } else {
        needDeleteIds = ids;//删除所有下载中的id
      }
      //删除存在的ID(不包括本地已修改的)
      sqLite.executeSql(
        `delete from service_tickets where ticket_id in (${needDeleteIds.join(',')})`,
        [], () => {
          arrTickets.forEach((item, index) => {
            let ticket_id = item.Id;
            item.DownloadTime = lastUpdateTime;
            let ticket_detail = JSON.stringify(item);
            let download_date = downloadDate;
            let status = item.Status || 0;
            let content = ''//JSON.stringify(item.Content);
            sqLite.executeSql(
              "INSERT INTO service_tickets(ticket_id,ticket_detail,download_date,status,content) values(?,?,?,?,?)",
              [ticket_id, ticket_detail, download_date, status, content], () => {
                console.warn('insert success...');
              }
            );
          })
        }
      );

    }
  )
}

//将下载的工单保存在本地数据库中
export function cacheDownloadTickets(downloadDate, arrTickets) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }
  let lastUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  //找到所有工单里面的工单日志，需要删除对应的工单日志
  let ticket_log_ids = [];
  arrTickets.forEach(item => {
    ticket_log_ids = ticket_log_ids.concat(item.Logs.map(log => log.Id));
  })

  let ids = arrTickets.map(item => item.Id);
  //找到所有修改了的工单ID，
  sqLite.executeSql(
    "select ticket_id from ticket_operation GROUP BY ticket_id",
    [], (tx, result) => {
      console.warn('insert success...');
      let needDeleteIds = [].concat(ids);
      if (result.rows.length > 0) {//删除所有下载中不包括已修改的ID
        for (let i = 0; i < result.rows.length; i++) {
          let index = needDeleteIds.findIndex(item => item === result.rows.item(i).ticket_id);
          if (index >= 0) {
            needDeleteIds.splice(index, 1);
            arrTickets.splice(index, 1);//同时下载的数据中也不能插入已经修改的这些ID列
          }
        }
      } else {
        needDeleteIds = ids;//删除所有下载中的id
      }
      //删除存在的ID
      sqLite.executeSql(`delete from ticket_logs where ticket_id in (${needDeleteIds.join(',')})`, [], res => {
        sqLite.executeSql(
          `delete from tickets where ticket_id in (${needDeleteIds.join(',')})`,
          [], () => {
            console.warn('insert success...');
            arrTickets.forEach((item, index) => {
              let ticket_id = item.Id;
              item.DownloadTime = lastUpdateTime;
              let ticket_detail = JSON.stringify(item);
              let download_date = downloadDate;
              let status = item.Status || 0;
              let content = item.Content || '';
              sqLite.executeSql(
                "INSERT INTO tickets(ticket_id,ticket_detail,download_date,status,content) values(?,?,?,?,?)",
                [ticket_id, ticket_detail, download_date, status, content], () => {
                  console.warn('insert success...');
                }
              );
              //保存对应的工单日志到数据库
              if (item.Logs && item.Logs.length > 0) {
                item.Logs.forEach(log => {
                  sqLite.executeSql('insert into ticket_logs(log_id,ticket_id,log_detail) values(?,?,?)',
                    [log.Id, log.TicketId, JSON.stringify(log)], (tx, res) => { })
                })
              }
            })
          }
        );
      });

    }
  );

  // arrTickets.forEach((item,index)=>{
  //   let ticket_id=item.Id;
  //   let ticket_detail=JSON.stringify(item);
  //   let download_date=downloadDate;
  //   let status=item.Status||0;
  //   let content=item.Content||'';
  //
  //   sqLite.executeSql(
  //     "INSERT INTO tickets(ticket_id,ticket_detail,download_date,status,content) values(?,?,?,?,?)",
  //     [ticket_id,ticket_detail,download_date,status,content],()=>{
  //       console.warn('insert success...');
  //     }
  //   );
  // })
}

export function isServiceTicketInCache(ticketId) {
  return isTicketInCache(ticketId, 'service_tickets');
}

//判断指定的工单是否缓存到本地
export function isTicketInCache(ticketId, tableName = 'tickets') {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql(`select distinct ticket_id from ${tableName} where ticket_id = ? limit 10`,
      [ticketId], (tx, results) => {
        var len = results.rows.length;
        if (len >= 1) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, (e) => {
        resolve(e);
      }
    );
  });
}

export function getUnSyncServiceTickets() {
  return getUnSyncTickets('service_ticket_operation')
}

//获取本地待同步的数据，查询修改记录，
export function getUnSyncTickets(tableName = 'ticket_operation') {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql(`select * from ${tableName} order by operation_time limit 1000 `,
      [], (tx, results) => {
        let arrDatas = [];
        if (results && results.rows && results.rows.length > 0) {
          for (let i = 0; i < results.rows.length; i++) {
            arrDatas.push(results.rows.item(i));
          }
        }
        resolve(arrDatas);
      }, (e) => {
        resolve(e);
      }
    );
  });
}

export function updateServiceImageUpload(pid, content) {
  return updateImageUpload(pid, content, 'service_ticket_operation')
}
export function updateImageUpload(pid, content, tableName = 'ticket_operation') {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }
  let ticketUpdateSql = `UPDATE ${tableName} SET new_content = ? WHERE id = ? `;
  let ticketUpdateParams = [content, pid];
  return new Promise((resolve, reject) => {
    //需要同时更新两张表
    sqLite.executeSql(
      ticketUpdateSql, ticketUpdateParams, () => {
        console.warn('更新ticket_operation 图片内容');
        resolve();//表示操作完成
      }
    );
  });
}

export function updateGPSToAddress(pid, content) {
  //由于数据更新定位信息和更新图片上传执行的sql逻辑，都是更新content字段，所以复用上面的逻辑
  console.warn('更新定位信息', content);
  return updateImageUpload(pid, content);
}

export function cacheSign() {

}

//缓存服务工单离线操作
export function cacheServiceTicketModify(ticketId, type, newStatusOrContent) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }
  let ticket_id = ticketId;
  let operation_time = moment().format('YYYY-MM-DD HH:mm:ss');
  let operation_type = type;
  let new_status = '';
  let new_content = null;
  return new Promise((resolve, reject) => {
    //需要合并之前的操作记录，所以需要先查询此记录是否存在，如果存在，进行修改；否则进行插入
    sqLite.executeSql(
      `select id,new_content from service_ticket_operation where ticket_id = ?`, [ticketId], (tx, result) => {
        let id = null;
        if (result && result.rows && result.rows.length > 0) {
          //存在，进行修改
          id = result.rows.item(0).id;
          new_content = result.rows.item(0).new_content;
        }
        if (type === 1) {
          new_status = 2;//newStatusOrContents;
          sqLite.executeSql(`update service_tickets set status = ? where ticket_id = ?`, [new_status, ticket_id], () => { });
          if (id === null) {
            sqLite.executeSql(`INSERT INTO service_ticket_operation (ticket_id,operation_time,operation_type,new_status,new_content) values(?,?,?,?,?)`,
              [ticket_id, operation_time, operation_type, new_status, ''], () => { resolve() })
          } else {
            sqLite.executeSql(`update service_ticket_operation set new_status = ?,operation_time = ?  where ticket_id = ?`,
              [new_status, operation_time, ticket_id], () => { resolve() })
          }
        } else if (type === 2) {
          new_status = 2;
          try {
            if (id !== null) {
              //说明是修改
              if (new_content) {
                let change = JSON.parse(new_content);//{content:{}}   {content:{}}
                //合并之前的现在的修改为一个整体
                Object.assign(change.content, newStatusOrContent.content);
                newStatusOrContent.content = change.content;
              }
              //说明要插入
              let onlyContent = newStatusOrContent.content;
              sqLite.executeSql(`update service_tickets set content = ? where ticket_id = ?`, [JSON.stringify(onlyContent), ticket_id], () => { });
              sqLite.executeSql(`update service_ticket_operation set new_content = ?,operation_time = ?  where ticket_id = ?`,
                [JSON.stringify(newStatusOrContent), operation_time, ticket_id], () => { resolve() })
            } else {
              let onlyContent = newStatusOrContent.content;
              //说明要插入
              sqLite.executeSql(`update service_tickets set content = ? where ticket_id = ?`, [JSON.stringify(onlyContent), ticket_id], () => { });
              sqLite.executeSql(`INSERT INTO service_ticket_operation (ticket_id,operation_time,operation_type,new_status,new_content) values(?,?,?,?,?)`,
                [ticket_id, operation_time, operation_type, 0, JSON.stringify(newStatusOrContent)], () => { resolve() })
            }
          } catch (e) {
            console.warn('modify e', e)
          }

        }
      }
    );
  });
}

//保存工单本地的修改，状态和巡检内容保存
//type==1,type===2,type=3那么newStatusOrContents字段存储状态和gps定位信息，格式如下:{status:1,gps:{lat,lng}}
//说明 服务报告本地修改 只用到了 operation 1:修改状态 和 2：修改内容
export function cacheTicketModify(ticketId, type, newStatusOrContents, isService = false) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  console.warn(ticketId, type, newStatusOrContents);
  let ticket_id = ticketId;
  let operation_time = moment().format('YYYY-MM-DD HH:mm:ss');
  let operation_type = type;
  let new_status = '';
  let new_content = '';
  let ticketUpdateSql = '';
  let ticketUpdateParams = [];
  if (type === 1) {
    new_status = newStatusOrContents;
    let tableName = isService ? 'service_tickets' : 'tickets';
    ticketUpdateSql = `UPDATE ${tableName} SET status = ? WHERE ticket_id = ? `;
    ticketUpdateParams = [new_status, ticket_id];
    //只有处理关闭工单才这么处理
    if (typeof newStatusOrContents === 'object') {
      new_status = newStatusOrContents.status;
      new_content = newStatusOrContents.content;
      ticketUpdateParams = [new_status, ticket_id];
      //更新处理意见
      getTicketFromCache(ticket_id).then(ticket => {
        if (ticket) {
          ticket.ChiefOperatorConductResult = newStatusOrContents.content;
          sqLite.executeSql(
            'UPDATE tickets SET ticket_detail = ? WHERE ticket_id = ? ', [JSON.stringify(ticket), ticket_id], () => {
            }
          );
        }
      });
    }

  } else if (type === 2) {

    //数据格式：{ticket,summary,content,update},update为只修改项目,同步解析和同步中对图片处理部分，需要根据此格式进行调整
    //判断有没有修改巡检项
    let onlyContent = newStatusOrContents.content;
    if (onlyContent) {
      //有修改
      let tableName = isService ? 'service_tickets' : 'tickets';
      ticketUpdateSql = `UPDATE ${tableName} SET content = ?,ticket_detail = ? WHERE ticket_id = ? `;
      ticketUpdateParams = [JSON.stringify(onlyContent), newStatusOrContents.ticket, ticket_id];
    }
    new_content = JSON.stringify(newStatusOrContents);


    /**  保留思路
    //由于现在离线巡检项同步只同步修改部分，这里数据有调整,分为完整的巡检项full,和修改部分update
    new_content=newStatusOrContents.update;
    ticketUpdateSql='UPDATE tickets SET content = ? WHERE ticket_id = ? ';
    ticketUpdateParams=[newStatusOrContents.full,ticket_id];
    **/

  } else if (type === 3) {//开始执行
    new_status = newStatusOrContents.status;
    ticketUpdateSql = 'UPDATE tickets SET status = ? WHERE ticket_id = ? ';
    ticketUpdateParams = [new_status, ticket_id];
    if (newStatusOrContents.urgenceTicket) {
      //如果是抢修工单，还需要修改UserTicketStatus值为3
      getTicketFromCache(ticket_id).then(ticket => {
        if (ticket && ticket.TicketType === 7) {
          ticket.UserTicketStatus = 3;
          sqLite.executeSql(
            'UPDATE tickets SET ticket_detail = ? WHERE ticket_id = ? ', [JSON.stringify(ticket), ticket_id], () => {
              console.warn('更新抢修工单状态');
            }
          );
        }
      });
    }
    new_content = JSON.stringify(newStatusOrContents);
    // operation_type=1;
  } else if (type === TICKET_TYPE_SAVE_SIGN || type === TICKET_TYPE_SAVE_SIGN_BZ) {
    //离线保存签名到数据库,保存到操作表就是base64,保存到工单详情表的字段是
    new_content = newStatusOrContents;
    ticketUpdateSql = null;
    getTicketFromCache(ticket_id).then(ticket => {
      if (ticket) {
        if (type === TICKET_TYPE_SAVE_SIGN)
          ticket.SignFilePath = 'data:image/jpeg;base64,' + newStatusOrContents;
        else {
          ticket.ChiefOperatorSignFilePath = 'data:image/jpeg;base64,' + newStatusOrContents;
        }
        sqLite.executeSql(
          'UPDATE tickets SET ticket_detail = ? WHERE ticket_id = ? ', [JSON.stringify(ticket), ticket_id], () => {
            console.warn('更新抢修工单状态');
          }
        );
      }
    });
  } else {
    throw ('error:unsupport type is not 1 or 2');
  }
  return new Promise((resolve, reject) => {
    //需要同时更新两张表
    if (ticketUpdateSql) {
      sqLite.executeSql(
        ticketUpdateSql, ticketUpdateParams, () => {
          console.warn('更新tickets');
        }
      );
    }
    let tableName = isService ? 'service_ticket_operation' : 'ticket_operation';
    sqLite.executeSql(
      `INSERT INTO ${tableName}(ticket_id,operation_time,operation_type,new_status,new_content) values(?,?,?,?,?)`,
      [ticket_id, operation_time, operation_type, new_status, new_content], () => {
        console.warn('insert success...');
      }
    );

    //给了延时处理，防止数据库操作未完成
    setTimeout(() => {
      resolve();//表示操作完成
    }, 300);
  });
}

export function clearServiceTicketById(tickeetId) {
  return clearTicket(tickeetId, true);
}

// 删除某工单+所有操作数据
export function clearTicket(ticketId, isService = false) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }
  let tableName = isService ? 'service_tickets' : 'tickets';
  let operationTableName = isService ? 'service_ticket_operation' : 'ticket_operation';
  return new Promise((resolve, reject) => {
    sqLite.executeSql(
      `delete from ${operationTableName} where ticket_id = ?`,
      [ticketId], () => {
        console.warn('ticket_operation delete success...');
      }
    );
    sqLite.executeSql(
      `delete from ${tableName} where ticket_id = ?`,
      [ticketId], () => {
        console.warn('tickets delete success...');
      }
    );
    if (!isService) {
      sqLite.executeSql(
        "delete from ticket_logs where ticket_id = ?",
        [ticketId], () => {
          console.warn('ticket_logs delete success...');
        }
      );
    }
    resolve();
  });
}
//清除缓存的所有工单数据，
export function clearCacheTicket() {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }
  return new Promise((resolve, reject) => {
    sqLite.executeSql(
      "delete from ticket_operation",
      [], () => {
        console.warn('ticket_operation delete success...');
      }
    );
    // sqLite.executeSql(
    //   "delete from service_ticket_operation",
    //   [],()=>{
    //     console.warn('service ticket_operation delete success...');
    //   }
    // );
    sqLite.executeSql(
      "delete from tickets",
      [], () => {
        console.warn('tickets delete success...');
      }
    );
    // sqLite.executeSql(
    //   "delete from service_tickets",
    //   [],()=>{
    //     console.warn('service tickets delete success...');
    //   }
    // );
    sqLite.executeSql(
      "delete from ticket_logs",
      [], () => {
        console.warn('ticket_logs delete success...');
      }
    );
    resolve();
  });
}

export function getTicketLogsFromCache(ticketId) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }
  return new Promise((resolve, reject) => {
    sqLite.executeSql('select * from ticket_logs where ticket_id = ?', [ticketId],
      (tx, res) => {
        let logs = [];
        if (res && res.rows && res.rows.length > 0) {
          let len = res.rows.length;
          for (let i = 0; i < len; i++) {
            logs.push(JSON.parse(res.rows.item(i).log_detail));
          }
          logs.sort((a, b) => {
            let one = moment(a.UpdateTime);
            let tow = moment(b.UpdateTime);
            return tow.unix() - one.unix();
          });
        }
        return resolve(logs);
      });
  });
}

//从缓存中取指定的工单
export function getTicketFromCache(ticketId, multi) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql(`select ticket_id,ticket_detail,download_date,status,content
      from tickets where ticket_id IN (${ticketId})`,
      [], (tx, results) => {
        var len = results.rows.length;

        if (len >= 1) {
          if (multi) {
            let arr = [];
            for (let i = 0; i < len; i++) {
              let ticket = JSON.parse(results.rows.item(i).ticket_detail);
              ticket.Content = results.rows.item(i).content;
              ticket.Status = results.rows.item(i).status;
              //如果是巡检工单，则需要这么处理下
              if (ticket.TicketType === 6) {
                ticket.InspectionContent = JSON.parse(ticket.Content);
              }
              arr.push(ticket);
            }
            resolve(arr);
          } else {
            let ticket = JSON.parse(results.rows.item(0).ticket_detail);
            ticket.Content = results.rows.item(0).content;
            ticket.Status = results.rows.item(0).status;
            if (ticket.TicketType === 6) {
              ticket.InspectionContent = JSON.parse(ticket.Content);
            }
            //说明查询到了
            resolve(ticket);
          }
        } else {
          //说明没有查询到
          resolve(null);
        }
      }, (e) => {
        resolve(null);
      }
    );
  });
}

export function getCacheServiceTicketByDate(date) {
  let where = ` download_date = '${date}' order by id `;
  return queryServiceTicketFromCache(where);
}

export function getServiceTicketFromCache(ticketIds) {
  //ticket_id IN (${ticketId})
  let where = `ticket_id IN (${ticketIds})`;
  return queryServiceTicketFromCache(where);
}

//通用 从缓存中取指定的服务工单工单
function queryServiceTicketFromCache(where) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql(`select ticket_id,ticket_detail,download_date,status,content
      from service_tickets where ${where}`,
      [], (tx, results) => {
        var len = results.rows.length;
        if (len >= 1) {
          let arr = [];
          try {
            for (let i = 0; i < len; i++) {
              let ticket = JSON.parse(results.rows.item(i).ticket_detail);
              let content = results.rows.item(i).content;
              if (!content) content = {};
              else content = JSON.parse(content);
              ticket.Content = Object.assign(ticket.Content, content);
              ticket.Status = results.rows.item(i).status;
              arr.push(ticket);
            }
          } catch (e) {
          }
          resolve(arr);
        } else {
          //说明没有查询到
          resolve(null);
        }
      }, (e) => {
        resolve(null);
      }
    );
  });
}

//获取指定日期的本地缓存数据
export function getCacheTicketByDate(date) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql(`select ticket_id,ticket_detail,download_date,status,content
      from tickets where download_date = ?`,
      [date], (tx, results) => {
        var len = results.rows.length;
        if (len >= 1) {
          try {
            let arr = [];
            for (let i = 0; i < len; i++) {
              let item = results.rows.item(i);
              let ticket = JSON.parse(item.ticket_detail);
              ticket.Content = item.content;
              ticket.Status = item.status;
              if (ticket.TicketType === 6) {
                ticket.InspectionContent = JSON.parse(ticket.Content);
              }
              arr.push(ticket);
            }
            resolve(arr);
          } catch (e) {
            console.warn(e)
            resolve(null);
          }
        } else {
          //说明没有查询到
          resolve(null);
        }
      }, (e) => {
        console.warn(e);
        resolve(null);
      }
    );
  });
}

export const TICKET_LOG_ADD = 4;
export const TICKET_LOG_UPDATE = 5;
export const TICKET_LOG_DELETE = 6;
export const TICKET_TYPE_SAVE_SIGN = 7;
export const TICKET_TYPE_SAVE_SIGN_BZ = 8;
//记录对工单日志的离线操作
export function cacheTicketLogOperate(type, ticketLog) {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }
  let operation_time = moment().format('YYYY-MM-DD HH:mm:ss');
  //删除日志，需要把ticket_logs表中的对应记录删除
  //还需要在ticket_operation表中记录删除日志操作
  let logSql = null;
  let logParam = [];
  //操作记录
  let operateSql = null;
  let operateParam = [];
  let log_string = JSON.stringify(ticketLog);
  switch (type) {
    case TICKET_LOG_ADD:
      logSql = 'insert into ticket_logs(log_id,ticket_id,log_detail) values(?,?,?)';
      logParam = [ticketLog.Id, ticketLog.TicketId, log_string];
      operateSql = "INSERT INTO ticket_operation(ticket_id,log_id,operation_time,operation_type,new_status,new_content) values(?,?,?,?,?,?)";
      operateParam = [ticketLog.TicketId, ticketLog.Id, operation_time, TICKET_LOG_ADD, '', log_string];
      break;
    case TICKET_LOG_UPDATE:
      logSql = 'update ticket_logs set log_detail = ? where log_id = ?';
      logParam = [log_string, ticketLog.Id];
      //如果是修改的本地创建日志，更新操作不单独记录操作，而仅仅只是在原来创建记录中做修改
      if (ticketLog.localCreate) {
        operateSql = 'update ticket_operation set operation_time = ?,new_content =? where log_id =?';
        operateParam = [operation_time, log_string, ticketLog.Id];
      } else {
        operateSql = "INSERT INTO ticket_operation(ticket_id,log_id,operation_time,operation_type,new_status,new_content) values(?,?,?,?,?,?)";
        operateParam = [ticketLog.TicketId, ticketLog.Id, operation_time, TICKET_LOG_UPDATE, '', log_string];
      }
      break;
    case TICKET_LOG_DELETE:
      logSql = 'delete from  ticket_logs where log_id = ?';
      logParam = [ticketLog.Id];
      //这里情况有点特殊，如果删除的日志，是本地添加的，还没有被同步过，则不需要记录到同步记录里面
      //为了区分是本地工单日志，给本地工单日志添加一个字段进行标识 isLocal=true;
      if (ticketLog.localCreate) {
        operateSql = 'delete from ticket_operation where log_id = ?';
        operateParam = [ticketLog.Id];
      } else {
        operateSql = "INSERT INTO ticket_operation(ticket_id,log_id,operation_time,operation_type,new_status,new_content) values(?,?,?,?,?,?)";
        operateParam = [ticketLog.TicketId, ticketLog.Id, operation_time, TICKET_LOG_DELETE, '', log_string];
      }
      break;
    default:
      throw (`日志操作类型错误：${type}`);
  }
  return new Promise((resolve, reject) => {
    sqLite.executeSql(logSql, logParam, res => {
      console.warn(logSql, logParam, res);
      sqLite.executeSql(operateSql, operateParam, res => {
        console.warn(operateSql, operateParam, res);
      });
      resolve();
    });
  });
}

export function getServiceCacheDays() {
  return getCacheDays('service_tickets');
}
//获取指定日期的本地缓存数据
export function getCacheDays(tableName = 'tickets') {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql(`select download_date from ${tableName} GROUP BY download_date `,
      [], (tx, results) => {
        var len = results.rows.length;
        if (len >= 1) {
          let arr = [];
          for (let i = 0; i < len; i++) {
            let item = results.rows.item(i);
            arr.push(item.download_date);
          }
          resolve(arr);
        } else {
          //说明没有查询到
          resolve([]);
        }
      }, (e) => {
        console.warn(e);
        resolve(null);
      }
    );
  });
}

//获取指定工单的下载时间（同步是判断是否被其他用户修改需要用到）
export function getDownloadTimeByTicketId(ticketId, tableName = 'tickets') {
  if (!sqLite) {
    sqLite = SQLite.getInstance();
  }

  return new Promise((resolve, reject) => {
    sqLite.executeSql(`select ticket_detail
                       from ${tableName}
                       where ticket_id = ? `,
      [ticketId], (tx, results) => {
        var len = results.rows.length;
        if (len >= 1) {
          let downloadTime = JSON.parse(results.rows.item(0).ticket_detail).DownloadTime;
          resolve(downloadTime);
        } else {
          //说明没有查询到
          resolve(null);
        }
      }, (e) => {
        console.warn(e);
        resolve(null);
      }
    );
  });
}

// //更新指定的本地工单（数据有更新，或者同步完成，清除本地的修改记录)
// export function updateTicket(ticket){
//
// }
