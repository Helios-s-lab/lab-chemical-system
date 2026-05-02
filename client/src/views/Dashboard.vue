<template>
  <div>
    <div class="welcome-card">
      <div>
        <h2>欢迎使用高校实验室危险化学品与安全事件追踪管理系统</h2>
        <p>实现危险化学品基础信息管理、库存预警、申请审批、安全事件追踪等功能。</p>
      </div>
      <el-tag type="danger" size="large" round>高风险业务场景管理平台</el-tag>
    </div>

    <el-row :gutter="20" class="card-row">
      <el-col :span="6">
        <div class="data-card blue">
          <div class="card-title">用户总数</div>
          <div class="card-value">{{ dashboard.userCount }}</div>
          <div class="card-footer">系统注册用户数量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-card green">
          <div class="card-title">实验室数量</div>
          <div class="card-value">{{ dashboard.labCount }}</div>
          <div class="card-footer">纳入平台管理实验室</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-card orange">
          <div class="card-title">危化品数量</div>
          <div class="card-value">{{ dashboard.chemicalCount }}</div>
          <div class="card-footer">危险化学品基础档案数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-card red">
          <div class="card-title">预警库存数</div>
          <div class="card-value">{{ dashboard.warningCount }}</div>
          <div class="card-footer">低于阈值或状态预警</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-card shadow="hover" class="panel-card">
          <template #header>
            <div class="panel-header">系统功能说明</div>
          </template>
          <ul class="intro-list">
            <li>支持实验室信息、危化品分类及危化品基础档案管理</li>
            <li>支持库存查询、入库记录维护与低库存预警</li>
            <li>支持危化品领用申请、审批和过程留痕</li>
            <li>支持安全事件上报、处理记录和追踪管理</li>
            <li>支持数据库触发器、存储过程、视图等高级功能实现</li>
          </ul>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card shadow="hover" class="panel-card">
          <template #header>
            <div class="panel-header">系统提示</div>
          </template>
          <div class="tip-box">
            <el-alert title="请及时关注库存预警信息" type="warning" :closable="false" show-icon />
            <el-alert title="请规范填写危化品申请用途" type="info" :closable="false" show-icon style="margin-top:12px;" />
            <el-alert title="安全事件需及时上报并处理" type="error" :closable="false" show-icon style="margin-top:12px;" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import request from '../api/request'

const dashboard = reactive({
  userCount: 0,
  labCount: 0,
  chemicalCount: 0,
  warningCount: 0
})

const loadDashboardData = async () => {
  try {
    const [userRes, labRes, chemicalRes, warningRes] = await Promise.all([
      request.get('/users'),
      request.get('/labs'),
      request.get('/chemicals'),
      request.get('/inventory/warning')
    ])

    dashboard.userCount = userRes.data.data.length
    dashboard.labCount = labRes.data.data.length
    dashboard.chemicalCount = chemicalRes.data.data.length
    dashboard.warningCount = warningRes.data.data.length
  } catch (error) {
    console.error('首页统计加载失败', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border-radius: 18px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.18);
}

.welcome-card h2 {
  margin: 0;
  font-size: 24px;
}

.welcome-card p {
  margin-top: 10px;
  color: rgba(255,255,255,0.88);
}

.card-row {
  margin-bottom: 20px;
}

.data-card {
  border-radius: 16px;
  padding: 22px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.data-card.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.data-card.green { background: linear-gradient(135deg, #22c55e, #16a34a); }
.data-card.orange { background: linear-gradient(135deg, #f59e0b, #ea580c); }
.data-card.red { background: linear-gradient(135deg, #ef4444, #dc2626); }

.card-title {
  font-size: 14px;
  opacity: 0.95;
}

.card-value {
  font-size: 34px;
  font-weight: bold;
  margin: 14px 0 10px;
}

.card-footer {
  font-size: 12px;
  opacity: 0.9;
}

.panel-card {
  border-radius: 16px;
}

.panel-header {
  font-weight: 700;
  color: #1f2937;
}

.intro-list {
  margin: 0;
  padding-left: 18px;
  line-height: 2;
  color: #374151;
}

.tip-box {
  padding: 4px 0;
}
</style>
