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

<style scoped>
.pdf-toolbar {
  position: sticky;
  top: 0;
  z-index: 30;

  display: flex;
  align-items: center;
  gap: 8px;

  height: 48px;
  padding: 0 12px;

  background: #ffffff;

}

.page-info {
  min-width: 60px;
  text-align: center;
  font-size: 13px;
  color: #333;
}

.zoom-info {
  min-width: 50px;
  text-align: center;
  font-size: 13px;
  color: #333;
}

.divider {
  width: 1px;
  height: 20px;
  background: #e5e6eb;
  margin: 0 4px;
}
</style>