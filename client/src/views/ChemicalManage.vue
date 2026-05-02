<template>
  <div class="page-wrap">
    <el-card shadow="never" class="page-header-card">
      <div class="page-header">
        <div>
          <div class="page-title">危险化学品基础信息管理</div>
          <div class="page-desc">维护危化品分类、CAS 编号、危险等级、储存要求与状态信息，形成实验室危化品基础档案。</div>
        </div>
        <div class="page-actions">
          <el-button type="primary" @click="openAddDialog">新增危化品</el-button>
          <el-button @click="getChemicalList">刷新数据</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col :span="8">
        <div class="mini-stat-card blue">
          <div class="stat-label">危化品总数</div>
          <div class="stat-value">{{ chemicalList.length }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card red">
          <div class="stat-label">高危险等级</div>
          <div class="stat-value">{{ highDangerCount }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card green">
          <div class="stat-label">正常状态数量</div>
          <div class="stat-value">{{ normalCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="table-card">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="可按名称、分类、CAS 编号筛选"
          clearable
          style="width: 320px"
        />
      </div>

      <el-table :data="filteredChemicalList" border style="width: 100%">
        <el-table-column prop="chemical_id" label="ID" width="70" />
        <el-table-column prop="chemical_name" label="危化品名称" width="150" />
        <el-table-column prop="category_name" label="分类" width="120">
          <template #default="scope">
            <el-tag type="info" effect="plain">{{ scope.row.category_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cas_no" label="CAS 编号" width="150" />
        <el-table-column prop="danger_level" label="危险等级" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.danger_level === '高' ? 'danger' : scope.row.danger_level === '中' ? 'warning' : 'success'"
            >
              {{ scope.row.danger_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="validity_date" label="有效期" width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '正常' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" />
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增危化品" width="620px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="form.chemical_name" />
        </el-form-item>
        <el-form-item label="分类ID">
          <el-input v-model="form.category_id" />
        </el-form-item>
        <el-form-item label="CAS编号">
          <el-input v-model="form.cas_no" />
        </el-form-item>
        <el-form-item label="危险等级">
          <el-select v-model="form.danger_level">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.unit" />
        </el-form-item>
        <el-form-item label="储存要求">
          <el-input v-model="form.storage_requirement" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-input v-model="form.validity_date" placeholder="例如 2027-12-31" />
        </el-form-item>
        <el-form-item label="SDS路径">
          <el-input v-model="form.sds_file_path" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="正常" value="正常" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addChemical">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const chemicalList = ref([])
const dialogVisible = ref(false)
const keyword = ref('')

const form = reactive({
  chemical_name: '',
  category_id: 1,
  cas_no: '',
  danger_level: '高',
  unit: 'L',
  storage_requirement: '',
  validity_date: '',
  sds_file_path: '',
  status: '正常',
  remark: ''
})

const getChemicalList = async () => {
  try {
    const res = await request.get('/chemicals')
    chemicalList.value = res.data.data
  } catch (error) {
    ElMessage.error('获取危化品列表失败')
  }
}

const openAddDialog = () => {
  form.chemical_name = ''
  form.category_id = 1
  form.cas_no = ''
  form.danger_level = '高'
  form.unit = 'L'
  form.storage_requirement = ''
  form.validity_date = ''
  form.sds_file_path = ''
  form.status = '正常'
  form.remark = ''
  dialogVisible.value = true
}

const addChemical = async () => {
  try {
    await request.post('/chemicals', form)
    ElMessage.success('新增危化品成功')
    dialogVisible.value = false
    getChemicalList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '新增危化品失败')
  }
}

const filteredChemicalList = computed(() => {
  if (!keyword.value) return chemicalList.value
  return chemicalList.value.filter(item =>
    (item.chemical_name || '').includes(keyword.value) ||
    (item.category_name || '').includes(keyword.value) ||
    (item.cas_no || '').includes(keyword.value)
  )
})

const highDangerCount = computed(() =>
  chemicalList.value.filter(item => item.danger_level === '高').length
)

const normalCount = computed(() =>
  chemicalList.value.filter(item => item.status === '正常').length
)

onMounted(() => {
  getChemicalList()
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
