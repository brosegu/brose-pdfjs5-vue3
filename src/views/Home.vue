<template>
  <div style="overflow: auto;">
    <a-upload type="file" accept=".pdf" @change="fileChange"><a-button>上传 PDF 文件</a-button></a-upload>
    <PdfPreview :pdfUrl="fileURL" v-if="fileURL" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import PdfPreview from "./components/pdf-preview/index.vue"
const fileURL = ref<string | null>(null)
const fileChange = ({ file }) => {
  if (!file) return
  fileURL.value = URL.createObjectURL(file.originFileObj);
}
</script>