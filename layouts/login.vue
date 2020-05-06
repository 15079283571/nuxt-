<template>
  <div id="box">
    <el-form :form="form" :rules="rules">
      <el-form-item label="用户名" prop="nickName">
        <el-input placeholder="请输入用户名" v-model="form.nickName"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <el-input placeholder="请输入用户名" v-model="form.pwd"></el-input>
      </el-form-item>
      <el-form-item label="验证码" prop="captcha">
        <img :src="captchaUrl" @click="updateCaptcha" alt="">
        <el-input placeholder="请输入用户名" v-model="form.captcha"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.native.prevent="">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data(){
    return {
      form: {
        nickName: '',
        pwd: '',
        captcha: ""
      },
      captchaUrl: "/api/captcha",
      rules: {
        nickName: [{required: true, message: '请输入用户名', frigger: 'blur'}],
        pwd: [{required: true, message: '请输入密码', frigger: 'blur'}],
        captcha: [{required: true, message: '请输入验证码', frigger: 'blur'}]
      }
    }
  },
  methods: {
    updateCaptcha(){
      this.captchaUrl = "/api/captcha?_t=" + new Date().getTime()
    }
  }
}
</script>