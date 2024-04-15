import storage from "../../../../../utils/storage";
const apiUploadFile = (data, key) => {
  let formData = new FormData();
  formData.append("fileType", 0);
  formData.append('key', key)
  formData.append('file', { uri: data.uri, name: data.filename, key: data.filename, type: 'image/jpg' });
  return fetch(storage.getOssBucket() + '/bff/xiot/rest/commonUploadFile', {
    method: 'post',
    headers: { Cookie: storage.getOssToken() },
    body: formData,
  }).then(res => {
    console.log(data, formData, res)
    if (res.status === 200) {
      return res.json()
    } else {
      return Promise.reject({ status: -1 })
    }
  })
}

function genKey() {
  return `${Math.random() * 100000}-${Date.now()}`
}

//data为从imagepicker里选择的数据
export const uploadImages = (data, callback) => {
  const CODE_OK = 200;
  let key = `${genKey()}.jpg`;
  apiUploadFile(data, key).then((ret) => {
    console.log('ret', ret)
    if (ret.status === CODE_OK) {
      callback({
        key, name: data.filename
      })
    } else {
      console.log('ret', ret)
      callback({ error: true })
    }
  });
}