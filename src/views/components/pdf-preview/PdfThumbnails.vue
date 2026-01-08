<template>
    <div class="pdf-thumbnails" ref="containerRef">
        <div v-for="page in totalPages" :key="page" class="thumbnail-item text-center flex flex-col items-center"
            :class="{ active: page === currentPage }" :data-page="page" ref="setItemRef" @click="emitJump(page)">
            <canvas :ref="el => renderThumbnail(el as HTMLCanvasElement, page)" class="object-fit" />
            <div class="page-number">{{ page }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
    pdfDoc: any
    totalPages?: number
}>(), {
    totalPages: 0,
})

const emit = defineEmits<{
    (e: 'jump', page: number): void
}>()

function emitJump(page: number) {
    currentPage.value = page;
    emit('jump', page)
}
const currentPage = defineModel("current-page", { type: Number, default: 1 })
/* 渲染缩略图 */
async function renderThumbnail(canvas: HTMLElement, pageNum: number) {
    if (!props.pdfDoc || !canvas) return;
    const page = await props.pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale: 0.25 })
    const ctx = canvas.getContext('2d')!
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: ctx, viewport }).promise
}

</script>

<style scoped>
.pdf-thumbnails {
    height: 100%;
    overflow-y: auto;
    padding: 8px;
    background: #fafafa;
}

.thumbnail-item {
    cursor: pointer;
    margin-bottom: 12px;
    padding: 6px;
    border-radius: 6px;
    transition: background 0.2s, box-shadow 0.2s;
    text-align: center;
}

.thumbnail-item:hover {
    background: #f0f5ff;
}

.thumbnail-item.active {
    background: #e6f4ff;
    box-shadow: 0 0 0 1px #91caff;
}

.canvas-wrapper {
    display: flex;
    justify-content: center;
}

.page-number {
    text-align: center;
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}
</style>