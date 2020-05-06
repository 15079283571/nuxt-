<template>
  <div id="box">
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="captcha">
        <img :src="form.captchaUrl" @click="updateCaptchaUrl" alt="">
        <el-input v-model="form.captcha" placeholder="请输入验证码"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="form.nickName" placeholder="请输入昵称"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <el-input v-model="form.pwd" placeholder="请输入密码" type="password"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="repwd">
        <el-input v-model="form.repwd" placeholder="请再次输入密码" type="password">></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.native.prevent="regForm">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import md5 from 'md5';
export default {
  data(){
    return {
      form: {
        email: "631515751@qq.com",
        captcha: '',
        nickName: 'nihao',
        pwd: 'Aa123456',
        repwd: 'Aa123456',
        captchaUrl: '/api/captcha'
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' },
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入昵称', trigger: 'blur' }
        ],
        pwd: [
          { required: true, pattern: /^[\w_-]{6,12}$/g , message: '请输入6-12位密码', trigger: 'blur' }
        ],
        repwd: [
          { required: true, message: '请输入相同的密码', trigger: 'blur' },
          {
            validator:(rule, value, callback) => {
              if(value !== this.form.pwd){
                callback(new Error("两次密码不一致"));
              }
              callback()
            }
          }
        ]
      }
    }
  },
  methods: {
    updateCaptchaUrl(){
      this.form.captchaUrl = '/api/captcha?_t='+ new Date().getTime()
    },
    regForm(){
      this.$refs.form.validate(async valid => {
        if(valid){
          const sendData = {
            email: this.form.email,
            nickName: this.form.nickName,
            pwd: this.form.pwd,
            captcha: this.form.captcha
          }
          const res = await this.$http.post('/user/reg', sendData);
          if(res.code === 0){
            this.$alert("注册成功", "成功", {
              confirmButtonText: '去登录',
              callback: () => {
                this.$router.push("/login")
              }
            })
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