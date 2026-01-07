<template>
  <input type="file" @change="fileChange">
  <div class="pdf-viewer">
    <!-- 工具栏 -->
    <div class="toolbar">
      <PdfToolbar :page="pageNum" :total="totalPages" :scale="scale" @prev="prevPage" @next="nextPage" @zoomIn="zoomIn"
        @zoomOut="zoomOut" @search="search" />
    </div>
    <div class="body">
      <!-- 大纲 -->
      <aside class="outline">
        <a-tabs size="small" tab-position="left">
          <a-tab-pane key="thumb" tab="页面">
            <PdfThumbnails :pdf-doc="pdfProxyRef" :total-pages="totalPages" :current-page="pageNum" />
          </a-tab-pane>
          <a-tab-pane key="outline" tab="大纲">
            <PdfOutline :pdf-doc="pdfProxyRef" />
          </a-tab-pane>
        </a-tabs>
      </aside>
      <!-- PDF 渲染区 -->
      <div class="viewer" ref="mainContainerRef">
        <div ref="containerRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, watch } from 'vue'
import PdfThumbnails from './components/pdf-preview/PdfThumbnails.vue'
import PdfOutline from './components/pdf-preview/PdfOutline.vue'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfJSViewer from 'pdfjs-dist/legacy/web/pdf_viewer.mjs';
import 'pdfjs-dist/web/pdf_viewer.css';

import PdfToolbar from './components/pdf-preview/PdfToolbar.vue';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const ANNOTATION_MODE = {
  VIEW: 1,
  EDIT: 2,
};
const containerRef = ref<HTMLCanvasElement | null>(null)
const mainContainerRef = ref<HTMLCanvasElement | null>(null)
const pdfProxyRef = shallowRef()
const pageNum = ref(1)
const totalPages = ref(0)
const scale = ref(1.2)
const fileURL = ref("")
const eventBus = new pdfJSViewer.EventBus();
const linkService = new pdfJSViewer.PDFLinkService({ eventBus })
const findController = new pdfJSViewer.PDFFindController({
  eventBus,
  linkService,
})
/* 渲染页面 */
async function renderPage() {
  if (pdfProxyRef.value) {
    pdfProxyRef.value.destroy();
  }
  let containerOffSetHeight = 0;
  let containerOffSetWidth = 0;
  if (mainContainerRef.value) {
    containerRef.value.innerHTML = '';
    containerOffSetHeight = mainContainerRef.value.offsetHeight;
    containerOffSetWidth = mainContainerRef.value.offsetWidth;
  }
  pdfProxyRef.value = await pdfjsLib.getDocument(fileURL.value).promise;
  await renderPDF({ containerOffSetHeight, containerOffSetWidth });
}
const renderPDF = async ({ containerOffSetHeight, containerOffSetWidth }) => {
  const { numPages } = pdfProxyRef.value;
  totalPages.value = numPages
  for (let index = 0; index < numPages; index++) {
    const pageProxy = await pdfProxyRef.value.getPage(index + 1);
    const scaledViewPort = pageProxy.getViewport({ scale: 1 });
    const calculatedScale = Math.min(
      containerOffSetHeight / scaledViewPort.height,
      containerOffSetWidth / scaledViewPort.width
    );
    await renderPageView({
      page: pageProxy,
      pageNumber: index + 1,
      viewPort: scaledViewPort,
      scale: calculatedScale,
    });
  }
};
const renderPageView = async ({ page, pageNumber, viewPort, scale }) => {
  const pdfPageView = new pdfJSViewer.PDFPageView({
    container: containerRef.value,
    id: pageNumber,
    scale,
    defaultViewport: viewPort,
    eventBus,
    annotationMode: ANNOTATION_MODE.VIEW,
    // annotationMode: ANNOTATION_MODE.EDIT
  });
  pdfPageView.setPdfPage(page);
  await pdfPageView.draw();
};
/* 翻页 */
function prevPage() {
}

function nextPage() {
}

/* 缩放 */
function zoomIn() {

}

function zoomOut() {
}

/* 大纲跳转 */
async function jumpTo(item: any) {
}

/* 搜索（简化版） */
async function search(keyword) {
}
const fileChange = (event: any) => {
  const file = event.target.files[0]
  if (!file) return
  fileURL.value = URL.createObjectURL(file);
  renderPage()
}
</script>

<style scoped>
.pdf-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}


.body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.viewer {
  position: relative;
  height: 1000px;
  flex: 1;
  overflow: auto;
  background: #f5f5f5;
}
</style>
