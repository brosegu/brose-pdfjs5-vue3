<template>
   <div style="overflow: auto;">
     <input type="file" accept=".pdf" @change="fileChange">
    <PdfPreview :pdfUrl="fileURL" v-if="fileURL"/>
   </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue"
  import PdfPreview from "./components/pdf-preview/index.vue"
  const fileURL = ref<string | null>(null)
  const fileChange = (event: any) => {
  const file = event.target.files[0]
  if (!file) return
  fileURL.value = URL.createObjectURL(file);
}
</script>