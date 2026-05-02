import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../layout/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import UserManage from '../views/UserManage.vue'
import LabManage from '../views/LabManage.vue'
import ChemicalManage from '../views/ChemicalManage.vue'
import InventoryManage from '../views/InventoryManage.vue'
import ApplyManage from '../views/ApplyManage.vue'
import EventManage from '../views/EventManage.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/layout',
    component: Layout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: UserManage },
      { path: 'labs', component: LabManage },
      { path: 'chemicals', component: ChemicalManage },
      { path: 'inventory', component: InventoryManage },
      { path: 'apply', component: ApplyManage },
      { path: 'events', component: EventManage }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.path === '/login') {
    next()
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
