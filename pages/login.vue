<template>
  <div id="box">
    <el-form :model="form" :rules="rules" ref="loginForm">
      <el-form-item label="用户名" prop="email">
        <el-input placeholder="请输入用户名" v-model="form.email"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <el-input placeholder="请输入用户名" v-model="form.pwd"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="captcha">
        <img :src="captchaUrl" @click="updateCaptcha" alt="">
        <el-input placeholder="请输入用户名" v-model="form.captcha"></el-input>
      </el-form-item>
      <el-form-item label="邮箱验证码" prop="emailCode">
        <!-- <img :src="captchaUrl" @click="updateCaptcha" alt=""> -->
        <el-input placeholder="请输入邮箱验证码" v-model="form.emailCode"></el-input>
        <el-button @click="sendEmail" :disabled="time !== 0">{{ codeText }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.native.prevent="login">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'
export default {
  data(){
    return {
      form: {
        email: '631515751@qq.com',
        pwd: 'Aa123456',
        captcha: "",
        emailCode: ''
      },
      captchaUrl: "/api/captcha",
      time: 0,
      timer: null,
      rules: {
        email: [
          {required: true, message: '请输入邮箱', frigger: 'blur'},
          {type: 'email', message: '请输入正确的邮箱', frigger: 'blur'}
        ],
        pwd: [{required: true, message: '请输入密码', frigger: 'blur'}],
        captcha: [{required: true, message: '请输入验证码', frigger: 'blur'}],
        emailCode: [{required: true, message: '请输入邮箱验证码', frigger: 'blur'}]
      }
    }
  },
  computed:{
    codeText(){
      if(this.time <= 0){
        return '发送'
      }
      return `${this.time}s后发送`
    }
  },
  methods: {
    async sendEmail(){
      this.time = 10;
      this.timer = setInterval(() => {
        if(this.time <= 0){
          clearInterval(this.timer)
        } else{
          this.time --;
        }
      }, 1000)
      await this.$http.get('/sendEmail?email=' + this.form.email)
    },
    updateCaptcha(){
      this.captchaUrl = "/api/captcha?_t=" + new Date().getTime()
    },
    login(){
      this.$refs.loginForm.validate(async valid => {
        if(valid){
          const sendData = {
            email: this.form.email,
            pwd: md5(this.form.pwd),
            captcha: this.form.captcha,
            emailCode: this.emailCode
          }
          const res = await this.$http.post('/user/login', sendData);
          console.log(res)
          if(res.code === 0){
            this.$message.success("登录成功")
            setTimeout(() => {
              this.$router.push('/')
            }, 500)
          } else {
            this.$message.error(res.message)
          }
        } else {
          console.log("校验失败")
        }
      })
    }
  }
}
</script>