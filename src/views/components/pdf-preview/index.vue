<template>
    <div class="pdf-container">
        <div class="controls">
            <PdfToolbar v-model:current-page="currentPage" :total="totalPages" :scale="scale" @search="search"
                @prev="prevPage" @next="nextPage" @zoomIn="scale += 0.1;" @zoomOut="scale -= 0.1;" />
        </div>
        <div class="body">
            <aside class="outline relative">
                <a-radio-group v-model:value="sideMode" button-style="solid" size="small"
                    class="absolute left-2 top-2 z-10">
                    <a-radio-button value="thumbs">缩略图导航</a-radio-button>
                    <a-radio-button value="outline">大纲</a-radio-button>
                </a-radio-group>
                <PdfThumbnails @jump="thumbJump" v-if="sideMode === 'thumbs'" :pdf-doc="pdfInstance"
                    :total-pages="totalPages" v-model:current-page="currentPage" />
                <PdfOutline :pdf-doc="pdfInstance" v-else @jump="outlineJump" />
            </aside>
            <div class="pdf-viewer">
                <div v-for="pageNum in totalPages" :key="pageNum" class="py-2 flex justify-center" :id="`viewer_pageitem_${pageNum}`">
                    <canvas :ref="el => renderPage(el, pageNum)"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import {range} from "lodash-es"
import PdfOutline from './PdfOutline.vue';
import PdfThumbnails from './PdfThumbnails.vue';
import PdfToolbar from './PdfToolbar.vue';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
const pdfCanvas = ref(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.4);
const sideMode = ref("thumbs")
let pdfInstance = null;
const renderTasks = new Map();
const props = defineProps({
    pdfUrl: {
        type: String,
        required: true
    },
});
// 加载PDF文档
const loadPdf = async () => {
    const loadingTask = pdfjsLib.getDocument(props.pdfUrl);
    pdfInstance = await loadingTask.promise;
    totalPages.value = pdfInstance.numPages;
    renderPage();
};

// 渲染当前页
const renderPage = async (canvas, pageNum, scaleValue = scale.value) => {
    if (!pdfInstance || !canvas) return;
    // 如果上一次 render 还在，先取消
    const page = await pdfInstance.getPage(pageNum);
    const viewport = page.getViewport({ scale: scaleValue });
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    const renderTask =  page.render(renderContext)
    await renderTask.promise;
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
const scrollByPage = page => {
    document.getElementById(`viewer_pageitem_${page}`).scrollIntoView({ behavior: 'smooth' });
}
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
async function rerenderAllPages(scaleValue) {
  await Promise.all(range(1, totalPages.value + 1).map(pageNum => {
      const canvas = document.querySelector(`#viewer_pageitem_${pageNum} canvas`);
      return renderPage(canvas, pageNum, scaleValue);
  }));
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
watch(currentPage, scrollByPage);
watch(scale, rerenderAllPages);

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
            width: 300px;
            height: 100%;
            overflow: auto;

            :deep(.ant-tabs) {
                height: 100%;
            }
        }

        .pdf-viewer {
            flex: 1;
            text-align: center;
            overflow: auto;
            background-color: lightgray;
        }
    }
}
</style>