<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="aside">
      <div class="logo-box">
        <div class="logo-circle">危</div>
        <div>
          <div class="system-title">危化品管理系统</div>
          <div class="system-subtitle">Laboratory Safety Platform</div>
        </div>
      </div>

      <el-menu
        router
        :default-active="route.path"
        class="menu"
        background-color="transparent"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/layout/dashboard">
          <span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/layout/users">
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/layout/labs">
          <span>实验室管理</span>
        </el-menu-item>
        <el-menu-item index="/layout/chemicals">
          <span>危化品管理</span>
        </el-menu-item>
        <el-menu-item index="/layout/inventory">
          <span>库存管理</span>
        </el-menu-item>
        <el-menu-item index="/layout/apply">
          <span>申请审批</span>
        </el-menu-item>
        <el-menu-item index="/layout/events">
          <span>安全事件</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-right">
         <div class="user-box">
          <div class="user-name">{{ userInfo.real_name || '未登录用户' }}</div>
          <div class="user-role">{{ userInfo.role_name || '未知角色' }}</div>
         </div>
         <el-button type="danger" plain @click="logout">退出登录</el-button>
        </div>

        <div class="header-right">
          <el-tag type="success" round>{{ userInfo.real_name || '未登录用户' }}</el-tag>
          <el-button type="danger" plain @click="logout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const userInfo = JSON.parse(localStorage.getItem('user') || '{}')

const logout = async () => {
  try {
    await ElMessageBox.confirm('确认退出当前系统吗？', '提示', {
      confirmButtonText: '确认退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {}
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background: #f5f7fb;
}

.aside {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #fff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-circle {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.system-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.system-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.menu {
  border-right: none;
  padding: 14px 10px;
}

:deep(.el-menu-item) {
  border-radius: 10px;
  margin-bottom: 8px;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #2563eb, #3b82f6) !important;
}

.header {
  height: 72px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.page-desc {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-box {
  text-align: right;
  margin-right: 6px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.main {
  padding: 20px;
  background: #f5f7fb;
}
</style>
