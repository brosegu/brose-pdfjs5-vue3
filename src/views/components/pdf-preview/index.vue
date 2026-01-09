<template>
    <div class="pdf-container">
        <div class="controls">
            <PdfToolbar :page="currentPage" :total="totalPages" :scale="scale" @search="search" @prev="prevPage"
                @next="nextPage" @zoomIn="scale += 0.1; renderPage()" @zoomOut="scale -= 0.1; renderPage()" />
        </div>
        <div class="body">
            <aside class="outline">
                <a-tabs size="small" tab-position="left">
                    <a-tab-pane key="thumb" tab="页面">
                        <PdfThumbnails @jump="thumbJump" :pdf-doc="pdfInstance" :total-pages="totalPages"
                            :current-page="currentPage" />
                    </a-tab-pane>
                    <a-tab-pane key="outline" tab="大纲">
                        <PdfOutline :pdf-doc="pdfInstance" @jump="outlineJump" />
                    </a-tab-pane>
                </a-tabs>
            </aside>
            <div class="viewer-body">
                <div ref="pdfContainer" class="pdfViewer"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted,unref, ref, watch } from 'vue';
import PdfOutline from './PdfOutline.vue';
import PdfThumbnails from './PdfThumbnails.vue';
import PdfToolbar from './PdfToolbar.vue';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfjsViewer from 'pdfjs-dist/legacy/web/pdf_viewer';
import 'pdfjs-dist/legacy/web/pdf_viewer.css';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const props = defineProps({
    pdfUrl: {
        type: String,
        required: true
    },
});
const pdfContainer = ref(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1);
let pdfInstance = null;

const eventBus = new pdfjsViewer.EventBus();
// 加载PDF文档
const loadPdf = async () => {
    const loadingTask = pdfjsLib.getDocument(props.pdfUrl);
    pdfInstance = await loadingTask.promise;
    totalPages.value = pdfInstance.numPages;
    renderAllPages();
};

// 渲染当前页
const renderAllPages = async () => {
    if (!pdfInstance) return;
    for(let i=0;i<totalPages.value;i++){
       renderPage(i+1);
    }
};
const renderPage = async (pageNum) => {
     // Document loaded, retrieving the page.
  const pdfPage = await pdfInstance.getPage(pageNum);
  // Creating the page view with default parameters.
  const pdfPageView = new pdfjsViewer.PDFPageView({
    container: pdfContainer.value,
    id: pageNum,
    scale: unref(scale),
    defaultViewport: pdfPage.getViewport({ scale: unref(scale) }),
    eventBus,
  });
  // Associate the actual page with the view, and draw it.
  pdfPageView.setPdfPage(pdfPage);
  pdfPageView.draw();
};
// 翻页功能
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};
const thumbJump = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};
const outlineJump = async item => {
    if (!pdfInstance) return;
    try {
        let dest = item.dest;
        if (!dest && item.action && item.action.dest) dest = item.action.dest;
        if (!dest) return;
        let destArray = dest;
        if (typeof dest === 'string') destArray = await pdfInstance.getDestination(dest);
        const pageRef = destArray[0];
        const pageIndex = await pdfInstance.getPageIndex(pageRef);
        currentPage.value = pageIndex + 1;
    } catch (err) {
        console.warn('gotoOutline error', err);
    }
}
// 搜索功能
const search = async (searchText) => {
    if (!searchText) return;

    for (let i = 1; i <= totalPages.value; i++) {
        const page = await pdfInstance.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => item.str);

        if (textItems.some(text => text.includes(searchText))) {
            currentPage.value = i;
            break;
        }
    }
};

// 监听页码变化重新渲染
// watch(currentPage, renderPage);

onMounted(loadPdf);

</script>

<style lang="less" scoped>
.pdf-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #000;
    margin: 10px;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    .controls {
        position: sticky;
        top: 0;
        width: 100%;
        display: flex;
        gap: 10px;
        align-items: center;
        border-bottom: 1px solid #e5e6eb;
    }

    .body {
        position: relative;
        height: 85vh;
        display: flex;
        width: 100%;
        overflow: hidden;

        .outline {
            width: 330px;
            height: 100%;
            overflow: auto;

            :deep(.ant-tabs) {
                height: 100%;
            }
        }

        .viewer-body {
            flex: 1;
            text-align: center;
            overflow: auto;
            background-color: lightgray;
        }
    }
}
</style>