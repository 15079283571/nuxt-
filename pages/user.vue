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
    <div class="cube-container" :style="{width: cubeWidth + 'px'}">
      <div class="cube" v-for="chunk in chunks" :key="chunk.name">
        <div :class="{
          'uploading': chunk.progress > 0 && chunk.progress < 100,
          'success': chunk.progress === 100,
          'error': chunk.progress < 0
        }">
        <i class="el-icon-loading" style="color: #f5f6f7" v-if="chunk.progress < 100 && chunk.progress > 0"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const CHUNK_SIZE = 0.5 * 1024 * 1024;
import sparkMd5 from 'spark-md5'
import request from '../../../xuanfu/代码/前端代码/新后台代码/tool/request';
export default {
  data(){
    return {
      file: null,
      progress: 0,
      chunks: [],
      worker: null,
      hashProgress: 0,
      hash: null
    }
  },
  computed: {
    cubeWidth(){
      return Math.ceil(Math.sqrt(this.chunks.length)) * 16
    },
    uploadProgress(){
      if(!this.file || this.chunks.length){
        return 0
      }
      const loaded = this.chunks.map(item => item.chunk.size + item.progress)
                                .reduce((acc, cur) => acc + cur, 0)
      return parseInt(((loaded*100) / this.file.size).toFixed(2))
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
    async calculateHashWorker(chunks){
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
    createFileChunk(file, size = CHUNK_SIZE){
      let chunks = []
      let cur = 0;
      while(cur < file.size){
        chunks.push({index: cur, file: file.slice(cur, cur+size)})
        cur+=size
      }
      return chunks
    },
    async calculateHashHashSample(){
      return new Promise(resolve => {
        const spark = new sparkMd5.ArrayBuffer();
        const reader = new FileReader()
        const file = this.file;
        const size = file.size
        const offset = 2 * 1024 * 1024
        let chunks = [file.slice(0, offset)]
        let cur = offset
        while(cur < size){
          if(cur + offset >= size){
            // 最后一个区块
            chunks.push(file.slice(cur, cur + offset))
          } else {
            const mid = cur + offset / 2
            const end = cur + offset
            chunks.push(file.slice(cur, cur + 2))
            chunks.push(file.slice(mid, mid + 2))
            chunks.push(file.slice(end - 2, end))
          }
          cur += offset
        }
        reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = e => {
          spark.append(e.target.result)
          resolve(spark.end())
        }
      })
    },
    async calculateHashIdle(){
      const chunks = this.chunks
      return new Promise(resolve => {
        const spark = new sparkMd5.ArrayBuffer();
        let count = 0;
        const appendToSpark = async file => {
          return new Promise(resolve => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = e => {
              spark.append(e.target.result)
              resolve()
            }
          })
        }
        const workLoop = async deadline => {
          while(count < chunks.length && deadline.timeRemaining() > 1){
            await appendToSpark(chunks[count].file)
            count++
            if(count < chunks.length){
              this.hashProgress = Number(((100 * count) / chunks.length).toFixed(2))
            } else {
              this.hashProgress = 100
              resolve(spark.end())
            }
          }
          window.requestIdleCallback(workLoop)
        }
        window.requestIdleCallback(workLoop)
      })
    },
    async uploadFile(file){
      this.file = file
      const chunks = this.createFileChunk(file)
      // const hash = await this.calculateHashWorker();
      // const hash1 = await this.calculateHashIdle();
      const hash = await this.calculateHashHashSample();
      this.hash = hash;
      console.log(hash)
      console.log(hash1)
      console.log(hash2)
      this.chunks = chunks.map((chunk, index) => {
        const name = hash + '-' + index
        return {
          hash,
          name,
          index,
          chunk: chunk.file
        }
        // const fileReader = new FileReader()
      })
      await this.uploadChunks()
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
      // const form = new FormData();
      // form.append('name', file.name);
      // form.append('file', file);
      // const res = await this.$http.post('/uploadFile', form, {
      //   onUploadProgress: progress => {
      //     this.progress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
      //   }
      // })
      this.$refs.file.value = '';
    },
    async uploadChunks(){
      const request = this.chunk.map((chunk, index) => {
        const form = new FormData()
        form.append("name", chunk.name)
        form.append("hash", chunk.hash)
        form.append("chunk", chunk.chunk)
        return form
        // form.append("name", chunk.name)
      }).map((form, index) => {
        this.$http.post("/uploadFile",{
          onUploadProgress: progress => {
            this.chunks[index].progress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
          }
        })
      })
      Promise.all(request)
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
<style s>
  #drag{
    width: 100px;
    height: 100px;
    border: 2px dashed #eee;
  }
  .cube-container{
    
  }
  .cube{
    width: 14px;
    height: 14px;
    line-height: 12px;
    border: 1px solid black;
    background: #eee;
    float: left;
  }
  .success{
    background: green;
  }
  .error{
    background: red;
  }
  .uploading{
    background: blue;
  }
</style>