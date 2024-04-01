import axios from 'axios'
import { ElLoading} from 'element-plus';
import message from './Message.js'
import router from '../router'

const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8';
const contentTypeJson = 'application/json';
const contentTypeFile = 'multipart/form-data';

const request = (config) => {
  let { url, params,dataType='form', showLoading='true'} = config;
  // 上传的数据格式不同，可能使文件或json或表单类型
  let contentType = contentTypeForm;
  if (dataType === 'json') {
    contentType = contentTypeJson;
  } else if (dataType === 'file') {
    contentType = contentTypeFile;
    //params是一个对象
    let param = new FormData();
    for (let key in params) {
      param.append(key, params[key]);
    }
    params = param;
  }

  const instantce = axios.create({
    baseURL: '/api',
    timeout: 10*1000,
    headers: {
      'Content-Type': contentType,
      'X-Requested-With':'XMLHttpRequest',
    }
  })
  // 请求拦截器
  let loading = null;
  instantce.interceptors.request.use(
    (config) => {
      if (showLoading) {
        loading=ElLoading.service({
          lock: true,
          text: 'Loading',
          text:'加载中......',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      }
      return config;
    },
    (error) => {
      if (showLoading && loading) {
        loading.close();
      }
      message.error('发送请求失败')
      return Promise.reject('发送请求失败');
    }
  )
  instantce.interceptors.response.use(
    (response) => {
      if (showLoading && loading) {
        loading.close();
      }
      //接受服务器相应的数据
      const responseData = response.data;
      if (responseData.status == 'error') {
        if (responseData.code == 901) {
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return Promise.reject('登录超时');
        }
        if (config.errorCallback) {
          config.errorCallback();
        }
        return Promise.reject(responseData.info);
      } else {
        if (responseData.code == 200) {
           return responseData;
        } 
      }
    },
    (error) => {
      if (showLoading && loading) {
        loading.close();
      }
      return Promise.reject('网络异常');
  }
  )
//所有都时post请求
  return instantce.post(url, params).catch((error) => {
    message.error(error)
    return null;
  })
}

export default request;