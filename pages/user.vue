<template>
  <div>
    <input type="file" ref="file" style="display:none" @change="changeFile">
    <div ref="drag" id="drag"></div>
    <div>
      <el-progress :stroke-width="20" :text-inside="true" :percentage="progress"></el-progress>
    </div>
    <el-button type="primary" @click="upload">上传</el-button>
    <div>
      <p>进度条</p>
      <el-progress :stroke-width="20" :text-inside="true" :percentage="hashProgress"></el-progress>
    </div>
  </div>
</template>
<script>
const CHUNK_SIZE = 0.5 * 1024 * 1024;
export default {
  data(){
    return {
      file: null,
      progress: 0,
      chunks: null,
      worker: null,
      hashProgress: 0
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
          const res = reader.result.split("").map(v => v.charCodeAt()).map(v => v.toString(16).padStart(2, '0')).join(" ")
          resolve(res)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isGif(file){
      const blob = await this.blobToString(file.slice(0, 6))
      return blob === '47 49 46 38 39 61' || blob === '47 49 46 38 37 61'
    },
    isImage(file){
      return this.isGif(file)
    },
    async isVideo(file){
      const res = await this.blobToString(file.slice(0, 7))
      return res === '00 00 00 18 66 74 79'
    },
    async calculateHashWorker(){
      return new Promise(resolve => {
        this.worker = new Worker('/work.js')
        this.worker.postMessage({
          chunks: this.chunks
        })
        this.worker.onmessage = e => {
          const { progress, hash } = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if(hash){
            resolve(hash)
          }
        }
      })
    },
    async createFileChunk(file, size = CHUNK_SIZE){
      const chunks = []
      let cur = 0;
      while(cur < file.size){
        chunks.push({index: cur, file: file.slice(cur, cur+size)})
        cur+=size
      }
      return chunks
    },
    async uploadFile(file){
      this.chunks = this.createFileChunk(file)
      const hash = await this.calculateHashWorker();
      console.log(hash)
      // if(!await this.isVideo(file)){
      //   console.log('视频')
      //   alert("文件格式不正确")
      //   return;
      // }
      // if(!await this.isImage(file)){
      //   console.log('图片')
      //   alert("文件格式不对")
      //   return
      // }
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