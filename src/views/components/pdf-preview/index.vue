<template>
    <div class="pdf-viewer relative h-[85vh]" ref="mainContainerRef">

    </div>
</template>

<script setup>
import { onMounted, ref, watch, unref } from 'vue';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { TextLayerBuilder,EventBus } from 'pdfjs-dist/legacy/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
const mainContainerRef = ref(null);
const totalPages = ref(0);
let pdfInstance = null;
const eventBus = new EventBus()
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
    renderPDF();
};
const renderPDF = async () => {
    for (let index = 0; index < totalPages.value; index++) {
        const pageProxy = await pdfInstance.getPage(index + 1);
        const scaledViewPort = pageProxy.getViewport({ scale: 1 });
        const pageDiv = document.createElement('div');
        pageDiv.setAttribute('id', `page-${index + 1}`);
        pageDiv.setAttribute('style', 'position: relative');


        var canvas = document.createElement('canvas');
        pageDiv.appendChild(canvas);
        mainContainerRef.value.appendChild(pageDiv);
        var context = canvas.getContext('2d');
        canvas.height = scaledViewPort.height;
        canvas.width = scaledViewPort.width;

        var renderContext = {
            canvasContext: context,
            viewport: scaledViewPort
        };

        await pageProxy.render(renderContext);
        const textContent = await pageProxy.getTextContent();
        // // 创建文本图层div
        const textLayerDiv = document.createElement('div');
        textLayerDiv.setAttribute('class', 'textLayer');
        // // 将文本图层div添加至每页pdf的div中
        pageDiv.appendChild(textLayerDiv);
         const textLayer = new TextLayerBuilder({
    textLayerDiv,
    pageIndex: index + 1,
    viewport: scaledViewPort,
    eventBus,
  })

  textLayer.setTextContent(textContent)
  await textLayer.render()
    }
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

.pdf-viewer {
    position: relative;

    .page {
        position: relative;
    }
}
</style>