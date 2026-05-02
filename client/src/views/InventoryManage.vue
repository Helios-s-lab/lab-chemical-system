<template>
  <div class="page-wrap">
    <el-card shadow="never" class="page-header-card">
      <div class="page-header">
        <div>
          <div class="page-title">库存监测与预警管理</div>
          <div class="page-desc">用于查看危化品库存状态、预警阈值及入库记录变化情况，支持快速识别低库存风险。</div>
        </div>
        <div class="page-actions">
          <el-button type="warning" @click="getWarningList">查看预警库存</el-button>
          <el-button type="primary" @click="openAddDialog">新增入库</el-button>
          <el-button @click="getInventoryList">刷新数据</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col :span="8">
        <div class="mini-stat-card blue">
          <div class="stat-label">库存记录数</div>
          <div class="stat-value">{{ inventoryList.length }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card red">
          <div class="stat-label">预警库存数</div>
          <div class="stat-value">{{ warningCount }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card green">
          <div class="stat-label">正常库存数</div>
          <div class="stat-value">{{ normalCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="table-card">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="可按实验室、危化品名称筛选"
          clearable
          style="width: 320px"
        />
      </div>

      <el-table :data="filteredInventoryList" border style="width: 100%">
        <el-table-column prop="inventory_id" label="ID" width="70" />
        <el-table-column prop="lab_name" label="实验室" width="150" />
        <el-table-column prop="chemical_name" label="危化品名称" width="160" />
        <el-table-column prop="danger_level" label="危险等级" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.danger_level === '高' ? 'danger' : scope.row.danger_level === '中' ? 'warning' : 'success'"
            >
              {{ scope.row.danger_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="current_quantity" label="当前库存" width="120" />
        <el-table-column prop="warning_threshold" label="预警阈值" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '预警' ? 'danger' : 'success'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" min-width="180" />
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增入库记录" width="520px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="危化品ID">
          <el-input v-model="form.chemical_id" />
        </el-form-item>
        <el-form-item label="实验室ID">
          <el-input v-model="form.lab_id" />
        </el-form-item>
        <el-form-item label="入库数量">
          <el-input v-model="form.quantity" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="form.supplier" />
        </el-form-item>
        <el-form-item label="操作人ID">
          <el-input v-model="form.operator_user_id" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addInbound">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const inventoryList = ref([])
const dialogVisible = ref(false)
const keyword = ref('')

const form = reactive({
  chemical_id: 1,
  lab_id: 1,
  quantity: 1,
  supplier: '',
  operator_user_id: 2,
  remark: ''
})

const getInventoryList = async () => {
  try {
    const res = await request.get('/inventory')
    inventoryList.value = res.data.data
  } catch (error) {
    ElMessage.error('获取库存列表失败')
  }
}

const getWarningList = async () => {
  try {
    const res = await request.get('/inventory/warning')
    inventoryList.value = res.data.data
    ElMessage.success('已切换为预警库存视图')
  } catch (error) {
    ElMessage.error('获取预警库存失败')
  }
}

const openAddDialog = () => {
  form.chemical_id = 1
  form.lab_id = 1
  form.quantity = 1
  form.supplier = ''
  form.operator_user_id = 2
  form.remark = ''
  dialogVisible.value = true
}

const addInbound = async () => {
  try {
    await request.post('/inventory/inbound', form)
    ElMessage.success('新增入库成功')
    dialogVisible.value = false
    getInventoryList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '新增入库失败')
  }
}

const filteredInventoryList = computed(() => {
  if (!keyword.value) return inventoryList.value
  return inventoryList.value.filter(item =>
    (item.lab_name || '').includes(keyword.value) ||
    (item.chemical_name || '').includes(keyword.value)
  )
})

const warningCount = computed(() =>
  inventoryList.value.filter(item => item.status === '预警').length
)

const normalCount = computed(() =>
  inventoryList.value.filter(item => item.status === '正常').length
)

onMounted(() => {
  getInventoryList()
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
.mini-stat-card.red { background: linear-gradient(135deg, #ef4444, #dc2626); }
.mini-stat-card.green { background: linear-gradient(135deg, #22c55e, #16a34a); }
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
