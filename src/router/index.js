import { createRouter, createWebHistory } from 'vue-router'
import TodoView from '../views/TodoView.vue'
import KnowledgeBaseView from '../views/KnowledgeBaseView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/todo',
  },
  {
    path: '/todo',
    name: 'Todo',
    component: TodoView,
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: KnowledgeBaseView,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
