import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/Home.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
