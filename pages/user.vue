<template>
  <div>
    <input type="file" ref="file" style="display:none" @change="changeFile">
    <div ref="drag" id="drag"></div>
    <div>
      <el-progress :stroke-width="20" :text-inside="true" :percentage="progress"></el-progress>
    </div>
    <el-button type="primary" @click="upload">上传</el-button>
  </div>
</template>
<script>
export default {
  data(){
    return {
      file: null,
      progress: 0
    }
  },
  async mounted(){
    // const json = await this.$http.get('/user/info')
    // console.log(json)
    this.dragUpload();
  },
  methods: {
    dragUpload(){
      const drag = this.$refs.drag
      drag.addEventListener('dragover',e => {
        e.target.style.borderColor = 'red'
        e.preventDefault();
      })
      drag.addEventListener('dragleave',e => {
        e.target.style.borderColor = '#eee'
        e.preventDefault();
      })
      drag.addEventListener('drop',e => {
        e.target.style.borderColor = '#eee'
        const file = e.dataTransfer.files[0]
        if(!file) return;
        this.uploadFile(file)
        e.preventDefault();
      })
    },
    upload(){
      this.$refs.file.click()
    },
    async blobToString(blob){
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = function(){
          const res = reader.result.split("").map(v => v.charCodeAt()).map(v => v.toString(16)).join("")
          resolve(res)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isGif(file){
      const blob = await this.blobToString(file.slice(0, 6))
      console.log(blob)
      return blob === '47 49 46 38 39 61' || blob === '47 49 46 38 37 61'
    },
    isImage(file){
      return this.isGif(file)
    },
    async uploadFile(file){
      if(!await this.isImage(file)){
        alert("文件格式不对")
        return
      }
      const form = new FormData();
      form.append('name', file.name);
      form.append('file', file);
      const res = await this.$http.post('/uploadFile', form, {
        onUploadProgress: progress => {
          this.progress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
        }
      })
      this.$refs.file.value = '';
    },
    async changeFile(e){
      const [file] = e.target.files;
      if(!file){
        return
      }
      this.uploadFile(file)
    }
  }
}
</script>
<style>
  #drag{
    width: 100px;
    height: 100px;
    border: 2px dashed #eee;
  }
</style>