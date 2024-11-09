<template>
  <div class="student-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="请选择课程"
            clearable
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in courseOptions"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学号">
          <el-input
            v-model="searchForm.studentId"
            placeholder="请输入学号"
            clearable
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="left">
        <el-button type="primary" @click="handleImport">
          <el-icon><Upload /></el-icon>导入名单
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>导出名单
        </el-button>
        <el-button type="success" @click="handleGrade">
          <el-icon><EditPen /></el-icon>成绩登记
        </el-button>
      </div>
      <div class="right">
        <el-radio-group v-model="viewType" size="small">
          <el-radio-button label="table">表格</el-radio-button>
          <el-radio-button label="card">卡片</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 表格视图 -->
    <el-card v-if="viewType === 'table'" class="list-card">
      <template #header>
        <div class="card-header">
          <span>学生名单（{{ total }}人）</span>
          <el-tag type="info" v-if="searchForm.courseId">
            {{ getCurrentCourseName }}
          </el-tag>
        </div>
      </template>

      <el-table
        :data="studentList"
        style="width: 100%"
        :max-height="600"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" width="50" label="序号" />

        <el-table-column label="学生信息" min-width="200">
          <template #default="{ row }">
            <div class="student-info">
              <el-avatar :size="40" :src="row.avatar" />
              <div class="info-content">
                <div class="name">{{ row.name }}</div>
                <div class="id">{{ row.studentId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="className" label="班级" />
        <el-table-column prop="major" label="专业" />

        <el-table-column label="考勤" width="150">
          <template #default="{ row }">
            <el-tooltip :content="`出勤率：${row.attendance}%`" placement="top">
              <el-progress
                :percentage="row.attendance"
                :status="getAttendanceStatus(row.attendance)"
              />
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="成绩" width="100" sortable>
          <template #default="{ row }">
            <el-tag
              :type="getScoreTag(row.score)"
              v-if="row.score !== undefined"
            >
              {{ row.score }}
            </el-tag>
            <el-tag type="info" v-else>未登记</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button link type="primary" @click="handleEditScore(row)">
              登分
            </el-button>
            <el-button link type="danger" @click="handleRemove(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 卡片视图 -->
    <template v-else>
      <el-row :gutter="20">
        <el-col
          v-for="student in studentList"
          :key="student.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          class="mb-4"
        >
          <el-card :body-style="{ padding: '0px' }" shadow="hover">
            <div class="student-card">
              <div class="student-header">
                <el-avatar :size="60" :src="student.avatar" />
                <div class="student-base">
                  <h3>{{ student.name }}</h3>
                  <p>{{ student.studentId }}</p>
                </div>
              </div>
              <div class="student-body">
                <div class="info-item">
                  <span class="label">班级：</span>
                  <span class="value">{{ student.className }}</span>
                </div>
                <div class="info-item">
                  <span class="label">专业：</span>
                  <span class="value">{{ student.major }}</span>
                </div>
                <div class="info-item">
                  <span class="label">出勤率：</span>
                  <span class="value">{{ student.attendance }}%</span>
                </div>
                <div class="info-item">
                  <span class="label">成绩：</span>
                  <span class="value">
                    <el-tag :type="getScoreTag(student.score)">
                      {{ student.score || "未登记" }}
                    </el-tag>
                  </span>
                </div>
              </div>
              <div class="student-footer">
                <el-button-group>
                  <el-button
                    type="primary"
                    @click="handleDetail(student)"
                    :icon="View"
                  >
                    详情
                  </el-button>
                  <el-button
                    type="success"
                    @click="handleEditScore(student)"
                    :icon="EditPen"
                  >
                    登分
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- 成绩登记对话框 -->
    <el-dialog v-model="scoreDialogVisible" title="成绩登记" width="500px">
      <el-form
        ref="scoreFormRef"
        :model="scoreForm"
        :rules="scoreRules"
        label-width="100px"
      >
        <el-form-item label="学生">
          {{ scoreForm.studentName }}（{{ scoreForm.studentId }}）
        </el-form-item>
        <el-form-item label="平时成绩" prop="usual">
          <el-input-number
            v-model="scoreForm.usual"
            :min="0"
            :max="100"
            :precision="1"
          />
        </el-form-item>
        <el-form-item label="考试成绩" prop="exam">
          <el-input-number
            v-model="scoreForm.exam"
            :min="0"
            :max="100"
            :precision="1"
          />
        </el-form-item>
        <el-form-item label="总评成绩">
          <div class="total-score">
            {{ calculateTotalScore }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="scoreDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleScoreSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { View, EditPen } from "@element-plus/icons-vue";

// 搜索表单
const searchForm = ref({
  courseId: "",
  studentId: "",
  name: "",
});

// 课程选项
const courseOptions = ref([
  { id: 1, name: "计算机网络" },
  { id: 2, name: "数据结构" },
  { id: 3, name: "操作系统" },
]);

// 获取当前课程名称
const getCurrentCourseName = computed(() => {
  const course = courseOptions.value.find(
    (c) => c.id === searchForm.value.courseId
  );
  return course ? course.name : "";
});

// 视图类型
const viewType = ref<"table" | "card">("table");

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);

// 表格选择
const selectedStudents = ref<any[]>([]);

// 成绩对话框
const scoreDialogVisible = ref(false);
const scoreForm = ref({
  studentId: "",
  studentName: "",
  usual: 0,
  exam: 0,
});

// 成绩表单规则
const scoreRules = {
  usual: [
    { required: true, message: "请输入平时成绩", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 100,
      message: "成绩范围 0-100",
      trigger: "blur",
    },
  ],
  exam: [
    { required: true, message: "请输入考试成绩", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 100,
      message: "成绩范围 0-100",
      trigger: "blur",
    },
  ],
};

// 计算总评成绩
const calculateTotalScore = computed(() => {
  const usual = scoreForm.value.usual || 0;
  const exam = scoreForm.value.exam || 0;
  return (usual * 0.4 + exam * 0.6).toFixed(1);
});

// 模拟学生数据
const studentList = ref([
  {
    id: 1,
    name: "张三",
    studentId: "2024001",
    className: "计算机2101",
    major: "计算机科学与技术",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    attendance: 95,
    score: 88,
  },
  {
    id: 2,
    name: "李四",
    studentId: "2024002",
    className: "计算机2101",
    major: "计算机科学与技术",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    attendance: 85,
    score: 76,
  },
  // ... 更多学生数据
]);

// 获取考勤状态
const getAttendanceStatus = (attendance: number) => {
  if (attendance >= 90) return "success";
  if (attendance >= 80) return "warning";
  return "exception";
};

// 获取成绩标签类型
const getScoreTag = (score?: number) => {
  if (score === undefined) return "info";
  if (score >= 90) return "success";
  if (score >= 80) return "primary";
  if (score >= 60) return "warning";
  return "danger";
};

// 搜索
const handleSearch = () => {
  // 实现搜索逻辑
};

// 重置
const handleReset = () => {
  searchForm.value = {
    courseId: "",
    studentId: "",
    name: "",
  };
};

// 课程变更
const handleCourseChange = (val: string) => {
  // 根据课程加载学生名单
};

// 选择变更
const handleSelectionChange = (val: any[]) => {
  selectedStudents.value = val;
};

// 编辑成绩
const handleEditScore = (student: any) => {
  scoreForm.value = {
    studentId: student.studentId,
    studentName: student.name,
    usual: 0,
    exam: 0,
  };
  scoreDialogVisible.value = true;
};

// 提交成绩
const handleScoreSubmit = () => {
  // 实现成绩提交逻辑
  ElMessage.success("成绩提交成功");
  scoreDialogVisible.value = false;
};

// 查看详情
const handleDetail = (student: any) => {
  // 实现查看详情逻辑
};

// 移除学生
const handleRemove = async (student: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要将学生 ${student.name}（${student.studentId}）从课程中移除吗？`,
      "移除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // 实现移除逻辑
    ElMessage.success("移除成功");
  } catch {
    // 用户取消操作
  }
};

// 导入名单
const handleImport = () => {
  // 实现导入逻辑
};

// 导出名单
const handleExport = () => {
  // 实现导出逻辑
};

// 批量登记成绩
const handleGrade = () => {
  // 实现批量登记逻辑
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  // 重新加载数据
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  // 重新加载数据
};
</script>

<style scoped lang="scss">
.student-list {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .list-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .student-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .info-content {
        .name {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .id {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .student-card {
    .student-header {
      padding: 20px;
      text-align: center;
      background-color: var(--el-fill-color-light);

      .student-base {
        margin-top: 12px;

        h3 {
          margin: 0 0 4px;
          font-size: 16px;
          color: var(--el-text-color-primary);
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .student-body {
      padding: 16px;

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .label {
          color: var(--el-text-color-secondary);
        }

        .value {
          color: var(--el-text-color-primary);
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .student-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--el-border-color-lighter);
      text-align: center;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.total-score {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
}

// 响应式处理
@media screen and (max-width: 768px) {
  .student-list {
    .action-bar {
      flex-direction: column;
      gap: 12px;

      .right {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
