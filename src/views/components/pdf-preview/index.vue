<template>
       <div class="pdf-viewer relative h-[85vh]" ref="mainContainerRef">
           
            </div>
</template>

<script setup>
import { onMounted, ref, watch, unref } from 'vue';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import * as pdfJSViewer from 'pdfjs-dist/legacy/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
const containerRef = ref(null);
const mainContainerRef = ref(null);
const totalPages = ref(0);
const scale = ref(1.4);
const eventBus = new pdfJSViewer.EventBus();
const ANNOTATION_MODE = {
  VIEW: 1,
  EDIT: 2,
};
let pdfInstance = null;
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
    let containerOffSetHeight = 0;
    let containerOffSetWidth = 0;
    if (mainContainerRef?.value) {
        containerOffSetHeight = mainContainerRef.value.offsetHeight;
        containerOffSetWidth = mainContainerRef.value.offsetWidth;
    }
    renderPDF({ containerOffSetHeight, containerOffSetWidth });
};
const renderPDF = async ({ containerOffSetHeight, containerOffSetWidth }) => {
        console.log({ containerOffSetHeight, containerOffSetWidth });
    for (let index = 0; index < totalPages.value; index++) {
        const pageProxy = await pdfInstance.getPage(index + 1);
        const scaledViewPort = pageProxy.getViewport({ scale: 1});
        const calculatedScale = Math.min(
            containerOffSetHeight / scaledViewPort.height,
            containerOffSetWidth / scaledViewPort.width
        );

        await renderPage({
            page: pageProxy,
            pageNumber: index + 1,
            viewPort: scaledViewPort,
            scale: calculatedScale,
        });
    }
};

const renderPage = async ({ page, pageNumber, viewPort, scale }) => {
    const pdfPageView = new pdfJSViewer.PDFPageView({
        container: mainContainerRef.value,
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

        .pdf-viewer {
            flex: 1;
            text-align: center;
            overflow: auto;
            background-color: lightgray;
        }
    }
}
.pdf-viewer{
    position: relative;
    .page{
        position: relative;
    }
}
</style>