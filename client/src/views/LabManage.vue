<template>
  <div class="page-wrap">
    <el-card shadow="never" class="page-header-card">
      <div class="page-header">
        <div>
          <div class="page-title">实验室基础档案管理</div>
          <div class="page-desc">维护实验室名称、位置、安全等级和运行状态，为危化品库存与安全事件关联提供基础数据支撑。</div>
        </div>
        <div class="page-actions">
          <el-button type="primary" @click="openAddDialog">新增实验室</el-button>
          <el-button @click="getLabList">刷新数据</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col :span="8">
        <div class="mini-stat-card blue">
          <div class="stat-label">实验室总数</div>
          <div class="stat-value">{{ labList.length }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card green">
          <div class="stat-label">正常运行</div>
          <div class="stat-value">{{ normalCount }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card red">
          <div class="stat-label">高安全等级</div>
          <div class="stat-value">{{ highCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="table-card">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="可按实验室名称、位置进行筛选"
          clearable
          style="width: 320px"
        />
      </div>

      <el-table :data="filteredLabList" border style="width: 100%">
        <el-table-column prop="lab_id" label="ID" width="80" />
        <el-table-column prop="lab_name" label="实验室名称" width="180" />
        <el-table-column prop="location" label="位置" width="180" />
        <el-table-column prop="safety_level" label="安全等级" width="120">
          <template #default="scope">
            <el-tag
              :type="scope.row.safety_level === '高' ? 'danger' : scope.row.safety_level === '中' ? 'warning' : 'success'"
            >
              {{ scope.row.safety_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="220" />
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增实验室" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="实验室名称">
          <el-input v-model="form.lab_name" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item label="安全等级">
          <el-select v-model="form.safety_level">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="正常" value="正常" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addLab">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const labList = ref([])
const dialogVisible = ref(false)
const keyword = ref('')

const form = reactive({
  lab_name: '',
  location: '',
  safety_level: '中',
  status: '正常',
  remark: ''
})

const getLabList = async () => {
  try {
    const res = await request.get('/labs')
    labList.value = res.data.data
  } catch (error) {
    ElMessage.error('获取实验室列表失败')
  }
}

const openAddDialog = () => {
  form.lab_name = ''
  form.location = ''
  form.safety_level = '中'
  form.status = '正常'
  form.remark = ''
  dialogVisible.value = true
}

const addLab = async () => {
  try {
    await request.post('/labs', form)
    ElMessage.success('新增实验室成功')
    dialogVisible.value = false
    getLabList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '新增实验室失败')
  }
}

const filteredLabList = computed(() => {
  if (!keyword.value) return labList.value
  return labList.value.filter(item =>
    (item.lab_name || '').includes(keyword.value) ||
    (item.location || '').includes(keyword.value)
  )
})

const normalCount = computed(() =>
  labList.value.filter(item => item.status === '正常').length
)

const highCount = computed(() =>
  labList.value.filter(item => item.safety_level === '高').length
)

onMounted(() => {
  getLabList()
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

.mini-stat-card {
  border-radius: 16px;
  padding: 20px;
  color: #fff;
}

.mini-stat-card.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.mini-stat-card.green { background: linear-gradient(135deg, #22c55e, #16a34a); }
.mini-stat-card.red { background: linear-gradient(135deg, #ef4444, #dc2626); }

.stat-label {
  font-size: 14px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-top: 10px;
}

.toolbar {
  margin-bottom: 16px;
}
</style>
