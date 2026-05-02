<template>
  <div class="login-page">
    <div class="overlay"></div>

    <div class="login-panel">
      <div class="left-box">
        <h1>高校实验室危险化学品与安全事件追踪管理系统</h1>
        <p>构建实验室危化品全生命周期管理平台，实现库存预警、申请审批、安全事件追踪与过程留痕。</p>
        <div class="feature-list">
          <div>✓ 危化品档案管理</div>
          <div>✓ 库存预警与入库管理</div>
          <div>✓ 申请审批闭环追踪</div>
          <div>✓ 安全事件上报与处理</div>
        </div>
      </div>

      <el-card class="login-card" shadow="hover">
        <h2>系统登录</h2>
        <p class="sub-text">请输入账号信息进入系统</p>
        <el-form :model="form">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin">登录系统</el-button>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const router = useRouter()

const form = reactive({
  username: 'admin',
  password: '123456'
})

const handleLogin = async () => {
  try {
    const res = await request.post('/auth/login', form)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    ElMessage.success('登录成功')
    router.push('/layout/dashboard')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a, #1d4ed8, #0ea5e9);
  position: relative;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(2px);
}

.login-panel {
  position: relative;
  z-index: 2;
  width: 1100px;
  max-width: 92%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.left-box {
  color: #fff;
  width: 52%;
}

.left-box h1 {
  font-size: 34px;
  line-height: 1.4;
  margin-bottom: 18px;
}

.left-box p {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255,255,255,0.9);
}

.feature-list {
  margin-top: 24px;
  display: grid;
  gap: 12px;
  font-size: 16px;
}

.login-card {
  width: 400px;
  border-radius: 20px;
  padding: 10px 8px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 8px;
}

.sub-text {
  text-align: center;
  color: #6b7280;
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  height: 42px;
  font-size: 16px;
}
</style>
