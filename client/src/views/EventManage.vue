<template>
  <div class="page-wrap">
    <el-card shadow="never" class="page-header-card">
      <div class="page-header">
        <div>
          <div class="page-title">安全事件追踪处置中心</div>
          <div class="page-desc">记录实验室安全异常、泄漏、误操作等事件信息，并跟踪处理过程与状态变化。</div>
        </div>
        <div class="page-actions">
          <el-button type="primary" @click="openEventDialog">上报事件</el-button>
          <el-button type="success" @click="openHandleDialog">处理事件</el-button>
          <el-button @click="getEventList">刷新数据</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col :span="8">
        <div class="mini-stat-card blue">
          <div class="stat-label">事件总数</div>
          <div class="stat-value">{{ eventList.length }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card red">
          <div class="stat-label">高等级事件数</div>
          <div class="stat-value">{{ highLevelCount }}</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mini-stat-card orange">
          <div class="stat-label">待处理/处理中</div>
          <div class="stat-value">{{ processingCount }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="table-card">
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="可按实验室、事件类型、上报人筛选"
          clearable
          style="width: 340px"
        />
      </div>

      <el-table :data="filteredEventList" border style="width: 100%">
        <el-table-column prop="event_id" label="事件ID" width="90" />
        <el-table-column prop="lab_name" label="实验室" width="140" />
        <el-table-column prop="report_user_name" label="上报人" width="120" />
        <el-table-column prop="event_type" label="事件类型" width="120" />
        <el-table-column prop="event_level" label="事件等级" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.event_level === '高' ? 'danger' : scope.row.event_level === '中' ? 'warning' : 'success'"
            >
              {{ scope.row.event_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="event_desc" label="事件描述" min-width="180" />
        <el-table-column prop="event_time" label="发生时间" width="180" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === '待处理' ? 'warning' : scope.row.status === '处理中' ? 'danger' : 'success'"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="eventDialogVisible" title="上报安全事件" width="520px">
      <el-form :model="eventForm" label-width="100px">
        <el-form-item label="实验室ID">
          <el-input v-model="eventForm.lab_id" />
        </el-form-item>
        <el-form-item label="上报人ID">
          <el-input v-model="eventForm.report_user_id" />
        </el-form-item>
        <el-form-item label="事件类型">
          <el-input v-model="eventForm.event_type" />
        </el-form-item>
        <el-form-item label="事件等级">
          <el-select v-model="eventForm.event_level">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="事件描述">
          <el-input v-model="eventForm.event_desc" type="textarea" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="eventForm.status">
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="eventDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEvent">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="handleDialogVisible" title="处理安全事件" width="520px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="事件ID">
          <el-input v-model="handleForm.event_id" />
        </el-form-item>
        <el-form-item label="处理人ID">
          <el-input v-model="handleForm.handler_user_id" />
        </el-form-item>
        <el-form-item label="处理内容">
          <el-input v-model="handleForm.handle_content" type="textarea" />
        </el-form-item>
        <el-form-item label="处理结果">
          <el-input v-model="handleForm.handle_result" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="success" @click="submitHandle">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const eventList = ref([])
const eventDialogVisible = ref(false)
const handleDialogVisible = ref(false)
const keyword = ref('')

const eventForm = reactive({
  lab_id: 1,
  report_user_id: 4,
  event_type: '',
  event_level: '中',
  event_desc: '',
  status: '待处理'
})

const handleForm = reactive({
  event_id: '',
  handler_user_id: 3,
  handle_content: '',
  handle_result: ''
})

const getEventList = async () => {
  try {
    const res = await request.get('/events')
    eventList.value = res.data.data
  } catch (error) {
    ElMessage.error('获取事件列表失败')
  }
}

const openEventDialog = () => {
  eventForm.lab_id = 1
  eventForm.report_user_id = 4
  eventForm.event_type = ''
  eventForm.event_level = '中'
  eventForm.event_desc = ''
  eventForm.status = '待处理'
  eventDialogVisible.value = true
}

const openHandleDialog = () => {
  handleForm.event_id = ''
  handleForm.handler_user_id = 3
  handleForm.handle_content = ''
  handleForm.handle_result = ''
  handleDialogVisible.value = true
}

const submitEvent = async () => {
  try {
    await request.post('/events', eventForm)
    ElMessage.success('上报事件成功')
    eventDialogVisible.value = false
    getEventList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '上报事件失败')
  }
}

const submitHandle = async () => {
  try {
    await request.post('/events/handle', handleForm)
    ElMessage.success('处理事件成功')
    handleDialogVisible.value = false
    getEventList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '处理事件失败')
  }
}

const filteredEventList = computed(() => {
  if (!keyword.value) return eventList.value
  return eventList.value.filter(item =>
    (item.lab_name || '').includes(keyword.value) ||
    (item.event_type || '').includes(keyword.value) ||
    (item.report_user_name || '').includes(keyword.value)
  )
})

const highLevelCount = computed(() =>
  eventList.value.filter(item => item.event_level === '高').length
)

const processingCount = computed(() =>
  eventList.value.filter(item => item.status === '待处理' || item.status === '处理中').length
)

onMounted(() => {
  getEventList()
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
.mini-stat-card.orange { background: linear-gradient(135deg, #f59e0b, #ea580c); }
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
