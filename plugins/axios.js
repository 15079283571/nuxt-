import Vue from 'vue'
import axios from 'axios'
import { MessageBox, Message } from 'element-ui'

const service = axios.create({
  baseURL: '/api'
})

export default ({store, redirect}) => {
  service.interceptors.request.use(
    async config => {
      const token = localStorage.getItem('token')
      if(token){
        config.headers.common['Authorization'] = token;
      }
      return config;
    }
  )
  
  service.interceptors.response.use(
    async response => {
      const { data } = response;
      if(data.code === -2){
        localStorage.removeItem('token')
        MessageBox.confirm("身份已过期", '提示',{
          confirmButtonText: '登录',
          showCancelButton: false,
          showClose: false
        }).then(() => {
          redirect({path: 'login'})
        })
      } else if(data.code === 0){
        Message(data.message)
      }
      return data;
    }
  )
}



Vue.prototype.$http = service;
export const http = service;