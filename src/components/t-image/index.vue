<template>
  <img v-if="url" :src="url" class="container-style" />
  <div v-else class="img-container container-style">
    <t-icon name="image" :size="iconSize"></t-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
  fit: {
    type: String,
    default: 'cover',
  },
  width: {
    type: [Number, String],
    default: 120,
  },
  height: {
    type: [Number, String],
    default: 60,
  },
  iconSize: {
    type: [Number, String],
    default: '20',
  },
  radius: {
    type: [Number, String],
    default: 0,
  },
})

const w = computed(() => {
  const { width } = props
  if (typeof width === 'number') return `${width}px`
  return width.endsWith('px') ? width : `${width}px`
})

const h = computed(() => {
  const { height } = props
  if (typeof height === 'number') return `${height}px`
  return height.endsWith('px') ? height : `${height}px`
})

const r = computed(() => {
  const { radius } = props
  if (typeof radius === 'number') return `${radius}px`
  return radius.endsWith('px') ? radius : `${radius}px`
})

// const style = computed(() => {
//   return {
//     width: w.value,
//     height: h.value,
//   }
// })
</script>

<style lang="less" scoped>
img {
  object-fit: v-bind(fit);
}
.img-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--td-bg-color-container-active);

  :deep(.t-icon) {
    opacity: 0.5;
  }
}

.container-style {
  width: v-bind(w);
  height: v-bind(h);
  border-radius: v-bind(r);
}
</style>
