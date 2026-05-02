<template>
  <div class="page-wrap">
    <el-card shadow="never" class="page-header-card">
      <div class="page-header">
        <div>
          <div class="page-title">用户信息与权限管理</div>
          <div class="page-desc">用于维护系统账户、角色信息及实验室关联关系，支撑后续申请审批与安全追踪业务。</div>
        </div>
        <div class="page-actions">
          <el-button type="primary" @click="openAddDialog">新增用户</el-button>
          <el-button @click="getUserList">刷新数据</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col :span="8">
        <div class="mini-stat-card blue">
          <div class="stat-label">用户总数</div>
          <div class="stat-value">{{ userList.length }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card green">
          <div class="stat-label">正常用户数</div>
          <div class="stat-value">{{ normalCount }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card orange">
          <div class="stat-label">关联实验室用户数</div>
          <div class="stat-value">{{ labBindCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="table-card">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="可按用户名、姓名、角色进行筛选"
          clearable
          style="width: 320px"
        />
      </div>

      <el-table :data="filteredUserList" border style="width: 100%">
        <el-table-column prop="user_id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column prop="real_name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role_name" label="角色" width="120">
          <template #default="scope">
            <el-tag type="primary" effect="plain">{{ scope.row.role_name || '未分配' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lab_name" label="所属实验室" width="140">
          <template #default="scope">
            <span>{{ scope.row.lab_name || '未关联' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增用户" width="520px">
      <el-form :model="form" label-width="88px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.real_name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="角色ID">
          <el-input v-model="form.role_id" />
        </el-form-item>
        <el-form-item label="实验室ID">
          <el-input v-model="form.lab_id" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="正常" value="正常" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const userList = ref([])
const dialogVisible = ref(false)
const keyword = ref('')

const form = reactive({
  username: '',
  password: '123456',
  real_name: '',
  gender: '男',
  phone: '',
  email: '',
  role_id: 5,
  lab_id: 1,
  status: '正常'
})

const getUserList = async () => {
  try {
    const res = await request.get('/users')
    userList.value = res.data.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

const openAddDialog = () => {
  form.username = ''
  form.password = '123456'
  form.real_name = ''
  form.gender = '男'
  form.phone = ''
  form.email = ''
  form.role_id = 5
  form.lab_id = 1
  form.status = '正常'
  dialogVisible.value = true
}

const addUser = async () => {
  try {
    await request.post('/users', form)
    ElMessage.success('新增用户成功')
    dialogVisible.value = false
    getUserList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '新增用户失败')
  }
}

const filteredUserList = computed(() => {
  if (!keyword.value) return userList.value
  return userList.value.filter(item =>
    (item.username || '').includes(keyword.value) ||
    (item.real_name || '').includes(keyword.value) ||
    (item.role_name || '').includes(keyword.value)
  )
})

const normalCount = computed(() =>
  userList.value.filter(item => item.status === '正常').length
)

const labBindCount = computed(() =>
  userList.value.filter(item => item.lab_name).length
)

onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.page-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header-card,
.table-card {
  border-radius: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.page-desc {
  margin-top: 6px;
  color: #6b7280;
  font-size: 14px;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.stat-row {
  margin: 0;
}

.mini-stat-card {
  border-radius: 16px;
  padding: 20px;
  color: #fff;
}

.mini-stat-card.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.mini-stat-card.green { background: linear-gradient(135deg, #22c55e, #16a34a); }
.mini-stat-card.orange { background: linear-gradient(135deg, #f59e0b, #ea580c); }

.stat-label {
  font-size: 14px;
  opacity: 0.95;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-top: 10px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>
