<template>
  <div>
    <div>
      <el-buttom type="primart" @click="submit">提交</el-buttom>
    </div>
    <el-main>
      <el-row :span="12">
        <textarea class="textarea" :value="content" @input="getValue"></textarea>
      </el-row>
      <el-row :span="12">
        <div v-html="content"></div>
      </el-row>
    </el-main>
  </div>
</template>
<script>
import marked from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/github.css';
export default {
  data(){
    return {
      content: `
        * 吃饭
        * 睡觉
      `
    }
  },
  methods: {
    submit(){},
    getValue(e){
      console.log(e)
    }
  }
}
</script>
<style scoped>
  .textarea{width: 100%;height: 100vh;}
</style>