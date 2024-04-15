export const BILL_COMMAND_ID = 'BILL_COMMAND_ID';
export const BILL_OPERATE_ID = 'BILL_OPERATE_ID';
export const BILL_JOB_ID = 'BILL_JOB_ID';

/**
 * 如果能返回到指定路由，则返回true,否则范围false
 * @param navigator
 * @returns {boolean}
 */
export function backToCommandBill(navigator) {
  return doBack(navigator,BILL_COMMAND_ID)
}

function doBack(navigator,id) {
  let routes = navigator.getCurrentRoutes();
  let index = 0;
  let count = routes.length;
  let find = false;
  for(let i=count-1;i>=0;i--) {
    if(routes[i].id === id){
      find = true;
      console.log('popN',index,[].concat(routes));
      navigator.popN(index);
      break;
    }
    index++;
  }
  return find;
}

export function backToOperateBill(navigator) {
  return doBack(navigator,BILL_OPERATE_ID)
}

export function backToJobBill(navigator) {
  return doBack(navigator,BILL_JOB_ID)
}

