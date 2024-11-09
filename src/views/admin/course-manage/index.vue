<template>
  <div class="course-manage">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6" v-for="stat in courseStats" :key="stat.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :class="stat.color"><component :is="stat.icon" /></el-icon>
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入课程名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="课程编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入课程编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="开课院系">
          <el-select
            v-model="searchForm.department"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.value"
              :label="dept.label"
              :value="dept.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option
              v-for="(label, key) in CourseTypeMap"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option
              v-for="(label, key) in CourseStatusMap"
              :key="key"
              :label="label"
              :value="key"
            />
          </el-select>
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
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增课程
        </el-button>
        <el-button
          @click="handleBatchDelete"
          :disabled="!selectedCourses.length"
        >
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
        <el-button
          @click="handleBatchApprove"
          :disabled="!selectedCourses.length"
        >
          <el-icon><Check /></el-icon>批量审核
        </el-button>
      </div>
      <div class="right">
        <el-button-group>
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>导入
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 课程列表 -->
    <el-card class="list-card">
      <el-table
        :data="courseList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-form label-position="left" inline class="course-detail">
              <el-form-item label="课程简介">
                <span>{{ row.description }}</span>
              </el-form-item>
              <el-form-item label="先修课程">
                <el-tag
                  v-for="course in row.prerequisites"
                  :key="course"
                  class="mr-2"
                >
                  {{ course }}
                </el-tag>
              </el-form-item>
              <el-form-item label="教学大纲">
                <div class="syllabus">{{ row.syllabus }}</div>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>

        <el-table-column label="课程信息" min-width="300">
          <template #default="{ row }">
            <div class="course-info">
              <el-image
                :src="row.image"
                class="course-image"
                :preview-src-list="[row.image]"
              />
              <div class="info-content">
                <h4>{{ row.name }}</h4>
                <p class="code">{{ row.code }}</p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="department" label="开课院系" />

        <el-table-column label="任课教师" width="150">
          <template #default="{ row }">
            <div class="teacher-info">
              <el-avatar :size="32" :src="row.teacherAvatar" />
              <span>{{ row.teacher }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="课程类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ CourseTypeMap[row.type] }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="学分/学时" width="100">
          <template #default="{ row }">
            {{ row.credit }}/{{ row.hours }}
          </template>
        </el-table-column>

        <el-table-column label="选课人数" width="120" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.enrolled / row.capacity) * 100)"
              :format="format"
              :status="row.enrolled >= row.capacity ? 'success' : ''"
            />
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ CourseStatusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              link
              type="primary"
              @click="handleApprove(row)"
              v-if="row.status === 'pending'"
            >
              审核
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
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

    <!-- 课程表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增课程' : '编辑课程'"
      width="700px"
    >
      <el-form
        ref="formRef"
        :model="courseForm"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="name">
              <el-input v-model="courseForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程编码" prop="code">
              <el-input v-model="courseForm.code" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开课院系" prop="department">
              <el-select v-model="courseForm.department" style="width: 100%">
                <el-option
                  v-for="dept in departmentOptions"
                  :key="dept.value"
                  :label="dept.label"
                  :value="dept.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任课教师" prop="teacherId">
              <el-select
                v-model="courseForm.teacherId"
                style="width: 100%"
                filterable
                remote
                :remote-method="handleTeacherSearch"
                :loading="teacherLoading"
              >
                <el-option
                  v-for="teacher in teacherOptions"
                  :key="teacher.id"
                  :label="teacher.name"
                  :value="teacher.id"
                >
                  <div class="teacher-option">
                    <el-avatar :size="24" :src="teacher.avatar" />
                    <span>{{ teacher.name }}</span>
                    <span class="department">{{ teacher.department }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 更多表单项... -->

        <el-form-item label="课程图片">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
          >
            <img
              v-if="courseForm.image"
              :src="courseForm.image"
              class="avatar"
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="approveDialogVisible" title="课程审核" width="500px">
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="pass">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="approveForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleApproveSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { FormInstance, FormRules, UploadProps } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import type { CourseInfo } from "@/types/course";
import { CourseTypeMap, CourseStatusMap } from "@/types/course";

// 在 script setup 中添加
const courseStats = ref([
  {
    title: "总课程数",
    value: 156,
    icon: "Reading",
    color: "text-primary",
  },
  {
    title: "进行中课程",
    value: 45,
    icon: "VideoPlay",
    color: "text-success",
  },
  {
    title: "待审核课程",
    value: 12,
    icon: "Timer",
    color: "text-warning",
  },
  {
    title: "已结束课程",
    value: 99,
    icon: "CircleCheck",
    color: "text-info",
  },
]);

const departmentOptions = [
  {
    value: "cs",
    label: "计算机科学与技术学院",
    children: [
      { value: "se", label: "软件工程系" },
      { value: "cs", label: "计算机科学系" },
      { value: "is", label: "信息安全系" },
    ],
  },
  {
    value: "ee",
    label: "电子工程学院",
    children: [
      { value: "ce", label: "通信工程系" },
      { value: "ee", label: "电子工程系" },
      { value: "ae", label: "自动化系" },
    ],
  },
];

const courseList = ref([
  {
    id: 1,
    name: "计算机网络",
    code: "CS301",
    type: "required",
    credit: 3,
    hours: 48,
    semester: "2023-2024-2",
    description:
      "本课程系统讲授计算机网络的基本概念、基本原理和基本方法。引导学生深入了解网络协议的分层结构，介绍物理层、数据链路层、网络层、运输层和应用层的主要协议。",
    teacher: "张网络",
    teacherId: "T2024001",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "计算机科学与技术学院/计算机科学系",
    capacity: 50,
    enrolled: 30,
    time: "周一 1-2节",
    location: "教学楼A101",
    image: "https://picsum.photos/id/1/400/200",
    status: "in_progress",
    examType: "exam",
    prerequisites: ["计算机组成原理", "操作系统"],
    syllabus:
      "第1周：计算机网络概述\n第2周：物理层\n第3周：数据链路层\n第4周：网络层\n第5周：运输层\n第6周：应用层",
    createTime: "2024-01-15 10:00:00",
    updateTime: "2024-03-15 15:30:00",
  },
  {
    id: 2,
    name: "数据结构",
    code: "CS201",
    type: "required",
    credit: 4,
    hours: 64,
    semester: "2023-2024-2",
    description:
      "本课程讲授数据结构的基本概念、基本原理和基本方法，包括线性表、栈、队列、树、图等数据结构的定义、存储结构、运算以及应用。",
    teacher: "李数据",
    teacherId: "T2024002",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "计算机科学与技术学院/软件工程系",
    capacity: 60,
    enrolled: 55,
    time: "周二 3-4节",
    location: "教学楼B202",
    image: "https://picsum.photos/id/2/400/200",
    status: "in_progress",
    examType: "exam",
    prerequisites: ["程序设计基础"],
    syllabus:
      "第1周：绪论\n第2周：线性表\n第3周：栈和队列\n第4周：树\n第5周：图\n第6周：查找与排序",
    createTime: "2024-01-16 09:00:00",
    updateTime: "2024-03-14 16:20:00",
  },
  {
    id: 3,
    name: "Web开发技术",
    code: "SE301",
    type: "elective",
    credit: 2,
    hours: 32,
    semester: "2023-2024-2",
    description:
      "本课程介绍现代Web开发技术，包括HTML5、CSS3、JavaScript、Vue.js等前端技术，以及Node.js、Express等后端技术。",
    teacher: "王前端",
    teacherId: "T2024003",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "计算机科学与技术学院/软件工程系",
    capacity: 40,
    enrolled: 38,
    time: "周三 5-6节",
    location: "实验楼C305",
    image: "https://picsum.photos/id/3/400/200",
    status: "pending",
    examType: "project",
    prerequisites: ["程序设计基础", "数据库原理"],
    syllabus:
      "第1周：Web概述\n第2周：HTML5与CSS3\n第3周：JavaScript基础\n第4周：Vue.js框架\n第5周：Node.js基础\n第6周：项目实战",
    createTime: "2024-02-01 14:00:00",
    updateTime: "2024-03-10 11:30:00",
  },
  {
    id: 4,
    name: "人工智能导论",
    code: "AI201",
    type: "elective",
    credit: 3,
    hours: 48,
    semester: "2023-2024-2",
    description:
      "本课程介绍人工智能的基本概念、发展历史、主要应用领域，以及机器学习、深度学习的基础知识。",
    teacher: "张智能",
    teacherId: "T2024004",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "计算机科学与技术学院/人工智能系",
    capacity: 45,
    enrolled: 20,
    time: "周四 7-8节",
    location: "教学楼D404",
    image: "https://picsum.photos/id/4/400/200",
    status: "not_started",
    examType: "exam",
    prerequisites: ["高等数学", "线性代数", "概率论"],
    syllabus:
      "第1周：人工智能概述\n第2周：问题求解\n第3周：知识表示\n第4周：机器学习基础\n第5周：深度学习入门\n第6周：人工智能应用",
    createTime: "2024-02-15 16:00:00",
    updateTime: "2024-03-12 09:45:00",
  },
]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(courseList.value.length);

// 搜索表单
const searchForm = ref({
  name: "",
  code: "",
  department: "",
  type: "",
  status: "",
});

// 课程表单
const courseForm = ref({
  name: "",
  code: "",
  type: "",
  credit: undefined,
  hours: undefined,
  semester: "",
  description: "",
  teacher: "",
  teacherId: "",
  department: "",
  capacity: undefined,
  time: "",
  location: "",
  image: "",
  examType: "",
  prerequisites: [],
  syllabus: "",
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: "请输入课程名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  code: [
    { required: true, message: "请输入课程编码", trigger: "blur" },
    {
      pattern: /^[A-Z]{2,}\d{3}$/,
      message: "请输入正确的课程编码格式",
      trigger: "blur",
    },
  ],
  type: [{ required: true, message: "请选择课程类型", trigger: "change" }],
  credit: [
    { required: true, message: "请输入学分", trigger: "blur" },
    {
      type: "number",
      min: 1,
      max: 10,
      message: "学分在 1 到 10 之间",
      trigger: "blur",
    },
  ],
  hours: [
    { required: true, message: "请输入学时", trigger: "blur" },
    {
      type: "number",
      min: 16,
      max: 96,
      message: "学时在 16 到 96 之间",
      trigger: "blur",
    },
  ],
  semester: [{ required: true, message: "请选择学期", trigger: "change" }],
  department: [
    { required: true, message: "请选择开课院系", trigger: "change" },
  ],
  teacher: [{ required: true, message: "请选择任课教师", trigger: "change" }],
  capacity: [
    { required: true, message: "请输入容量", trigger: "blur" },
    {
      type: "number",
      min: 1,
      max: 200,
      message: "容量在 1 到 200 之间",
      trigger: "blur",
    },
  ],
  examType: [{ required: true, message: "请选择考核方式", trigger: "change" }],
};

// 选中的课程
const selectedCourses = ref<CourseInfo[]>([]);

// 获取状态标签类型
const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    not_started: "info",
    in_progress: "success",
    ended: "",
    pending: "warning",
  };
  return map[status] || "";
};

// 格式化进度条文本
const format = (percentage: number) => {
  if (percentage === 100) return "已满";
  return `${percentage}%`;
};

// 搜索
const handleSearch = () => {
  // 实现搜索逻辑
};

// 重置
const handleReset = () => {
  searchForm.value = {
    name: "",
    code: "",
    department: "",
    type: "",
    status: "",
  };
};

// 选择变更
const handleSelectionChange = (val: CourseInfo[]) => {
  selectedCourses.value = val;
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCourses.value.length} 门课程吗？`,
      "批量删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // 实现批量删除逻辑
    ElMessage.success("删除成功");
  } catch {
    // 用户取消操作
  }
};

// 批量审核
const handleBatchApprove = () => {
  // 实现批量审核逻辑
};

// 导入导出
const handleImport = () => {
  // 实现导入逻辑
};

const handleExport = () => {
  // 实现导出逻辑
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

// ... 其他业务逻辑
</script>

<style scoped lang="scss">
.course-manage {
  padding: 20px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .el-icon {
        font-size: 32px;

        &.text-primary {
          color: var(--el-color-primary);
        }
        &.text-success {
          color: var(--el-color-success);
        }
        &.text-warning {
          color: var(--el-color-warning);
        }
        &.text-info {
          color: var(--el-color-info);
        }
      }

      .stat-info {
        .stat-title {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--el-text-color-primary);
        }
      }
    }
  }

  .search-card {
    margin: 20px 0;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .list-card {
    .course-info {
      display: flex;
      gap: 12px;

      .course-image {
        width: 120px;
        height: 67.5px;
        border-radius: 4px;
      }

      .info-content {
        flex: 1;
        min-width: 0;

        h4 {
          margin: 0 0 8px;
          font-size: 14px;
        }

        .code {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .teacher-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .course-detail {
      padding: 20px;

      .syllabus {
        white-space: pre-line;
        color: var(--el-text-color-regular);
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.teacher-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .department {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-left: auto;
  }
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 178px;
  height: 100px;
  display: block;
}
</style>
