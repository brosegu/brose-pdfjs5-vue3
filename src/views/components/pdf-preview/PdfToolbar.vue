<template>
  <div class="pdf-toolbar">
    <!-- 翻页 -->
    <a-button
      size="small"
      :disabled="currentPage <= 1"
      @click="emit('prev')"
    >
      上一页
    </a-button>

    <a-button
      size="small"
      :disabled="currentPage >= total"
      @click="emit('next')"
    >
      下一页
    </a-button>

    <span class="page-info">
      {{ currentPage }} / {{ total }}
    </span>

    <!-- 缩放 -->
    <a-button size="small" @click="emit('zoomOut')">-</a-button>

    <span class="zoom-info">
      {{ Math.round(scale * 100) }}%
    </span>

    <a-button size="small" @click="emit('zoomIn')">+</a-button>

    <div class="divider" />

    <!-- 搜索 -->
    <a-input
      v-model:value="keyword"
      size="small"
      placeholder="查找"
      style="width: 180px"
      @keyup.enter="onSearch"
      allow-clear
    />

    <a-button size="small" @click="onSearch">
      查找
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  total: number
  scale: number
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'zoomIn'): void
  (e: 'zoomOut'): void
  (e: 'search', keyword: string): void
}>()
const currentPage=defineModel("current-page",{type:Number,default:1})
const keyword = ref('')

function onSearch() {
  emit('search', keyword.value.trim())
}
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