<template>
   <div>
     <a-upload accept=".pdf" @change="fileChange" :show-upload-list="false">
      <a-button>点击上传PDF文件进行预览</a-button>
     </a-upload>
    <PdfPreview :pdfUrl="fileURL" v-if="fileURL"/>
   </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue"
  import PdfPreview from "./components/pdf-preview/index.vue"
  const fileURL = ref<string | null>(null)
  const fileChange = ({file}) => {
  if (!file) return
  fileURL.value = URL.createObjectURL(file.originFileObj);
}
</script>