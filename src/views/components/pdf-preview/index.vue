<template>
  <div class="pdf-viewer">
    <div ref="constainerRef" class="pdfViewer singlePageView"></div>
  </div>
</template>

<script lang="js" setup>
import { ref, onMounted } from 'vue';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsViewer from 'pdfjs-dist/legacy/web/pdf_viewer';
import 'pdfjs-dist/legacy/web/pdf_viewer.css';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker; // 使用本地 worker
const props = defineProps({
  pdfUrl: {
    type: String,
    required: true,
  },
});
const constainerRef = ref(null);
const pdfDoc = ref(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1);
const thumbnails = ref([]);
const pdfOutline = ref([]);
const activeTab = ref("thumbnails");
const isLoading = ref(false);

const PAGE_TO_VIEW = 1;
const SCALE = 1.0;

const eventBus = new pdfjsViewer.EventBus();
const renderPdf = async () => {
  // Loading document.
  const loadingTask = pdfjsLib.getDocument({
    url: props.pdfUrl,
  });

  const pdfDocument = await loadingTask.promise;
  // Document loaded, retrieving the page.
  const pdfPage = await pdfDocument.getPage(PAGE_TO_VIEW);

  // Creating the page view with default parameters.
  const pdfPageView = new pdfjsViewer.PDFPageView({
    container: constainerRef.value,
    id: PAGE_TO_VIEW,
    scale: SCALE,
    defaultViewport: pdfPage.getViewport({ scale: SCALE }),
    eventBus,
  });
  // Associate the actual page with the view, and draw it.
  pdfPageView.setPdfPage(pdfPage);
  pdfPageView.draw();
}
const searchText = (query) => {
  // 实现文本查询的逻辑
  console.log("Searching for:", query);
};

onMounted(() => {
  renderPdf();
});
</script>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pdf-controls {
  margin: 20px 0;
}

.thumbnails {
  display: flex;
  flex-wrap: wrap;
}

.thumbnail {
  width: 100px;
  height: auto;
  cursor: pointer;
  margin: 5px;
  border: 1px solid #ddd;
}
</style>