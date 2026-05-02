<template>
  <div class="page-wrap">
    <el-card shadow="never" class="page-header-card">
      <div class="page-header">
        <div>
          <div class="page-title">领用申请与审批中心</div>
          <div class="page-desc">用于提交危化品领用申请、查看审批状态，并对待审批申请进行审核处理，形成完整业务闭环。</div>
        </div>
        <div class="page-actions">
          <el-button type="warning" @click="getPendingList">待审批申请</el-button>
          <el-button type="primary" @click="openApplyDialog">提交申请</el-button>
          <el-button type="success" @click="openApproveDialog">审批申请</el-button>
          <el-button @click="getApplyList">刷新数据</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col :span="8">
        <div class="mini-stat-card blue">
          <div class="stat-label">申请总数</div>
          <div class="stat-value">{{ applyList.length }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card orange">
          <div class="stat-label">待审批数量</div>
          <div class="stat-value">{{ pendingCount }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card green">
          <div class="stat-label">已通过数量</div>
          <div class="stat-value">{{ approvedCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="table-card">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="可按申请人、实验室、危化品名称筛选"
          clearable
          style="width: 360px"
        />
      </div>

      <el-table :data="filteredApplyList" border style="width: 100%">
        <el-table-column prop="apply_id" label="申请ID" width="90" />
        <el-table-column prop="apply_user_name" label="申请人" width="120" />
        <el-table-column prop="lab_name" label="实验室" width="140" />
        <el-table-column prop="chemical_name" label="危化品" width="150" />
        <el-table-column prop="apply_quantity" label="申请数量" width="100" />
        <el-table-column prop="usage_purpose" label="用途" min-width="180" />
        <el-table-column prop="apply_time" label="申请时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === '待审批' ? 'warning' : scope.row.status === '已通过' ? 'success' : 'danger'"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="applyDialogVisible" title="提交申请" width="500px">
      <el-form :model="applyForm" label-width="100px">
        <el-form-item label="申请人ID">
          <el-input v-model="applyForm.apply_user_id" />
        </el-form-item>
        <el-form-item label="实验室ID">
          <el-input v-model="applyForm.lab_id" />
        </el-form-item>
        <el-form-item label="危化品ID">
          <el-input v-model="applyForm.chemical_id" />
        </el-form-item>
        <el-form-item label="申请数量">
          <el-input v-model="applyForm.apply_quantity" />
        </el-form-item>
        <el-form-item label="用途说明">
          <el-input v-model="applyForm.usage_purpose" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApply">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveDialogVisible" title="审批申请" width="500px">
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="申请ID">
          <el-input v-model="approveForm.apply_id" />
        </el-form-item>
        <el-form-item label="审批人ID">
          <el-input v-model="approveForm.approver_user_id" />
        </el-form-item>
        <el-form-item label="审批结果">
          <el-select v-model="approveForm.approval_result">
            <el-option label="已通过" value="已通过" />
            <el-option label="已驳回" value="已驳回" />
          </el-select>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="approveForm.approval_opinion" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="success" @click="submitApprove">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const applyList = ref([])
const applyDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const keyword = ref('')

const applyForm = reactive({
  apply_user_id: 4,
  lab_id: 1,
  chemical_id: 1,
  apply_quantity: 1,
  usage_purpose: ''
})

const approveForm = reactive({
  apply_id: '',
  approver_user_id: 3,
  approval_result: '已通过',
  approval_opinion: ''
})

const getApplyList = async () => {
  try {
    const res = await request.get('/apply')
    applyList.value = res.data.data
  } catch (error) {
    ElMessage.error('获取申请列表失败')
  }
}

const getPendingList = async () => {
  try {
    const res = await request.get('/apply/pending')
    applyList.value = res.data.data
    ElMessage.success('已切换为待审批申请')
  } catch (error) {
    ElMessage.error('获取待审批申请失败')
  }
}

const openApplyDialog = () => {
  applyForm.apply_user_id = 4
  applyForm.lab_id = 1
  applyForm.chemical_id = 1
  applyForm.apply_quantity = 1
  applyForm.usage_purpose = ''
  applyDialogVisible.value = true
}

const openApproveDialog = () => {
  approveForm.apply_id = ''
  approveForm.approver_user_id = 3
  approveForm.approval_result = '已通过'
  approveForm.approval_opinion = ''
  approveDialogVisible.value = true
}

const submitApply = async () => {
  try {
    await request.post('/apply', applyForm)
    ElMessage.success('提交申请成功')
    applyDialogVisible.value = false
    getApplyList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '提交申请失败')
  }
}

const submitApprove = async () => {
  try {
    await request.post('/apply/approve', approveForm)
    ElMessage.success('审批成功')
    approveDialogVisible.value = false
    getApplyList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '审批失败')
  }
}

const filteredApplyList = computed(() => {
  if (!keyword.value) return applyList.value
  return applyList.value.filter(item =>
    (item.apply_user_name || '').includes(keyword.value) ||
    (item.lab_name || '').includes(keyword.value) ||
    (item.chemical_name || '').includes(keyword.value)
  )
})

const pendingCount = computed(() =>
  applyList.value.filter(item => item.status === '待审批').length
)

const approvedCount = computed(() =>
  applyList.value.filter(item => item.status === '已通过').length
)

onMounted(() => {
  getApplyList()
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
.mini-stat-card.orange { background: linear-gradient(135deg, #f59e0b, #ea580c); }
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
