<template>
  <div class="pdf-outline">
    <div v-if="!outline.length" class="empty">无大纲</div>

    <div v-for="item in outline" :key="item.id" class="outline-item" :class="{ active: currentDest === item.dest }"
      :style="{ paddingLeft: `${item.level * 12}px` }" @click="jump(item)">
      {{ item.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  pdfDoc: any
}>()

const emit = defineEmits<{
  (e: 'jump', page: number): void
}>()
const currentDest = ref();
const outline = ref([]);

/* 递归解析 outline */
async function parse(items: any[], level = 0) {
  for (const item of items) {
    if (!item.dest) continue
    outline.value.push({ ...item, level })
    if (item.items?.length) {
      await parse(item.items, level + 1)
    }
  }
}

watch(() => props.pdfDoc, async (newDoc) => {
  if (newDoc) {
    const raw = await props.pdfDoc.getOutline()
    if (raw) await parse(raw)
  }
}, { immediate: true }
)
function jump(item) {
  currentDest.value = item.dest;
  emit('jump', item)
}
</script>

<style lang="less" scoped>
.pdf-outline {
  padding: 8px;
  font-size: 13px;
}

.outline-item {
  cursor: pointer;
  padding: 4px 0;
  line-height: 1.5;
}

.outline-item {

  &:hover,
  &.active {
    background: #e6f7ff;
    color: #1677ff;
  }
}

.empty {
  color: #999;
  text-align: center;
  margin-top: 20px;
}
</style>
