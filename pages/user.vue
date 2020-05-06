<template>
  <div>
    <input type="file" ref="file" style="display:none" @change="changeFile">
    <el-button type="primary" @click="upload">上传</el-button>
  </div>
</template>
<script>
export default {
  data(){
    return {
      file: null
    }
  },
  async mounted(){
    const json = await this.$http.get('/user/info')
    console.log(json)
  },
  methods: {
    upload(){
      this.$refs.file.click()
    },
    async changeFile(e){
      const [file] = e.target.files;
      if(!file){
        return
      }
      const form = new FormData();
      form.append('name', 'file');
      form.append('file', file);
      const res = await this.$http.post('/uploadFile', form)
    }
  }
}
</script>