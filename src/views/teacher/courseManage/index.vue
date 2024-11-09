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

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增课程
      </el-button>
      <el-button @click="handleImport">
        <el-icon><Upload /></el-icon>导入课程
      </el-button>
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>导出课程
      </el-button>
    </div>

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
        <el-form-item label="考核方式">
          <el-select
            v-model="searchForm.examType"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="(label, key) in ExamTypeMap"
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

    <!-- 课程列表 -->
    <el-card class="list-card">
      <el-table :data="courseList" style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="course-detail">
              <el-descriptions :column="3" border>
                <el-descriptions-item label="课程编码">
                  {{ row.code }}
                </el-descriptions-item>
                <el-descriptions-item label="学时">
                  {{ row.hours }}
                </el-descriptions-item>
                <el-descriptions-item label="学分">
                  {{ row.credit }}
                </el-descriptions-item>
                <el-descriptions-item label="上课时间">
                  {{ row.time }}
                </el-descriptions-item>
                <el-descriptions-item label="上课地点">
                  {{ row.location }}
                </el-descriptions-item>
                <el-descriptions-item label="选课人数">
                  {{ row.enrolled }}/{{ row.capacity }}
                </el-descriptions-item>
              </el-descriptions>
              <div class="description-content">
                <h4>课程简介</h4>
                <p>{{ row.description }}</p>
              </div>
            </div>
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
                <p>{{ row.description }}</p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="code" label="课程编码" width="120" />

        <el-table-column label="课程类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ CourseTypeMap[row.type] }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="考核方式" width="100">
          <template #default="{ row }">
            <el-tag :type="getExamTypeTag(row.examType)">
              {{ ExamTypeMap[row.examType] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="选课人数" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.enrolled / row.capacity) * 100)"
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

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="primary" @click="handleMaterials(row)">
              资料
            </el-button>
            <el-button link type="primary" @click="handleStudents(row)">
              学生
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
            <el-form-item label="课程类型" prop="type">
              <el-select v-model="courseForm.type" style="width: 100%">
                <el-option
                  v-for="(label, key) in CourseTypeMap"
                  :key="key"
                  :label="label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考核方式" prop="examType">
              <el-select v-model="courseForm.examType" style="width: 100%">
                <el-option
                  v-for="(label, key) in ExamTypeMap"
                  :key="key"
                  :label="label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学分" prop="credit">
              <el-input-number v-model="courseForm.credit" :min="0" :max="10" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学时" prop="hours">
              <el-input-number v-model="courseForm.hours" :min="0" :step="2" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input-number v-model="courseForm.capacity" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="courseForm.status" style="width: 100%">
                <el-option
                  v-for="(label, key) in CourseStatusMap"
                  :key="key"
                  :label="label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="上课时间" prop="time">
          <el-input v-model="courseForm.time" />
        </el-form-item>

        <el-form-item label="上课地点" prop="location">
          <el-input v-model="courseForm.location" />
        </el-form-item>

        <el-form-item label="课程图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
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

        <el-form-item label="课程简介" prop="description">
          <el-input
            v-model="courseForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, UploadProps } from "element-plus";
import type { CourseInfo } from "@/types/course";
import { CourseTypeMap, ExamTypeMap, CourseStatusMap } from "@/types/course";

// 在 script setup 中添加
const courseStats = ref([
  {
    title: "我的课程",
    value: 8,
    icon: "Reading",
    color: "text-primary",
  },
  {
    title: "进行中",
    value: 3,
    icon: "VideoPlay",
    color: "text-success",
  },
  {
    title: "待审核",
    value: 2,
    icon: "Timer",
    color: "text-warning",
  },
  {
    title: "已结束",
    value: 3,
    icon: "CircleCheck",
    color: "text-info",
  },
]);

// 课程类型映射
const CourseTypeMap = {
  required: "必修课",
  elective: "选修课",
  optional: "任选课",
};

// 考核方式映射
const ExamTypeMap = {
  exam: "考试",
  project: "大作业",
  report: "课程报告",
  design: "课程设计",
};

// 课程状态映射
const CourseStatusMap = {
  not_started: "未开始",
  in_progress: "进行中",
  ended: "已结束",
  pending: "待审核",
  rejected: "已驳回",
};

const courseList = ref([
  {
    id: 1,
    name: "数据结构",
    code: "CS201",
    type: "required",
    credit: 4,
    hours: 64,
    semester: "2023-2024-2",
    description:
      "本课程讲授数据结构的基本概念、基本原理和基本方法，包括线性表、栈、队列、树、图等数据结构的定义、存储结构、运算以及应用。",
    capacity: 60,
    enrolled: 55,
    time: "周二 3-4节",
    location: "教学楼B202",
    image: "https://picsum.photos/id/2/400/200",
    status: "in_progress",
    examType: "exam",
    materials: [
      { name: "教学大纲.pdf", url: "#", size: "521KB" },
      { name: "课件第一章.pptx", url: "#", size: "2.3MB" },
      { name: "实验指导书.doc", url: "#", size: "1.1MB" },
    ],
    students: [
      {
        id: "S001",
        name: "张三",
        className: "计科2101",
        attendance: 95,
        grade: 88,
      },
      {
        id: "S002",
        name: "李四",
        className: "计科2102",
        attendance: 88,
        grade: 92,
      },
    ],
    schedule: [
      { week: 1, content: "绪论", status: "completed" },
      { week: 2, content: "线性表", status: "completed" },
      { week: 3, content: "栈和队列", status: "in_progress" },
      { week: 4, content: "树", status: "pending" },
      { week: 5, content: "图", status: "pending" },
    ],
    createTime: "2024-01-16 09:00:00",
    updateTime: "2024-03-14 16:20:00",
  },
  {
    id: 2,
    name: "计算机网络",
    code: "CS301",
    type: "required",
    credit: 3,
    hours: 48,
    semester: "2023-2024-2",
    description:
      "本课程系统讲授计算机网络的基本概念、基本原理和基本方法。引导学生深入了解网络协议的分层结构，介绍物理层、数据链路层、网络层、运输层和应用层的主要协议。",
    capacity: 50,
    enrolled: 48,
    time: "周一 1-2节",
    location: "教学楼A101",
    image: "https://picsum.photos/id/1/400/200",
    status: "in_progress",
    examType: "exam",
    materials: [
      { name: "教学大纲.pdf", url: "#", size: "498KB" },
      { name: "实验指导书.pdf", url: "#", size: "1.5MB" },
    ],
    students: [
      {
        id: "S003",
        name: "王五",
        className: "网络2101",
        attendance: 92,
        grade: 85,
      },
    ],
    schedule: [
      { week: 1, content: "计算机网络概述", status: "completed" },
      { week: 2, content: "物理层", status: "in_progress" },
      { week: 3, content: "数据链路层", status: "pending" },
    ],
    createTime: "2024-01-15 10:00:00",
    updateTime: "2024-03-15 15:30:00",
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
    capacity: 40,
    enrolled: 35,
    time: "周三 5-6节",
    location: "实验楼C305",
    image: "https://picsum.photos/id/3/400/200",
    status: "pending",
    examType: "project",
    materials: [
      { name: "课程说明.pdf", url: "#", size: "325KB" },
      { name: "示例代码.zip", url: "#", size: "5.2MB" },
    ],
    students: [],
    schedule: [
      { week: 1, content: "Web概述", status: "pending" },
      { week: 2, content: "HTML5与CSS3", status: "pending" },
      { week: 3, content: "JavaScript基础", status: "pending" },
    ],
    createTime: "2024-02-01 14:00:00",
    updateTime: "2024-03-10 11:30:00",
  },
]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(courseList.value.length);

// 搜索表单
const searchForm = ref({
  name: "",
  type: "",
  examType: "",
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
  capacity: undefined,
  time: "",
  location: "",
  image: "",
  examType: "",
  materials: [],
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

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const formRef = ref<FormInstance>();

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入课程编码", trigger: "blur" }],
  type: [{ required: true, message: "请选择课程类型", trigger: "change" }],
  examType: [{ required: true, message: "请选择考核方式", trigger: "change" }],
  credit: [{ required: true, message: "请输入学分", trigger: "blur" }],
  hours: [{ required: true, message: "请输入学时", trigger: "blur" }],
  capacity: [{ required: true, message: "请输入容量", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  time: [{ required: true, message: "请输入上课时间", trigger: "blur" }],
  location: [{ required: true, message: "请输入上课地点", trigger: "blur" }],
  description: [{ required: true, message: "请输入课程简介", trigger: "blur" }],
};

// 获取考核方式标签类型
const getExamTypeTag = (type: string) => {
  const map: Record<string, string> = {
    exam: "",
    paper: "success",
    design: "warning",
    report: "info",
  };
  return map[type] || "";
};

// 获取状态标签类型
const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    not_started: "info",
    in_progress: "success",
    ended: "",
  };
  return map[status] || "";
};

// 搜索
const handleSearch = () => {
  // 实际项目中这里应该调用搜索API
  console.log("搜索条件:", searchForm);
};

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key as keyof typeof searchForm] = "";
  });
};

// 新增课程
const handleAdd = () => {
  dialogType.value = "add";
  Object.keys(courseForm).forEach((key) => {
    courseForm[key as keyof typeof courseForm] = "";
  });
  dialogVisible.value = true;
};

// 编辑课程
const handleEdit = (row: CourseInfo) => {
  dialogType.value = "edit";
  Object.keys(courseForm).forEach((key) => {
    courseForm[key as keyof typeof courseForm] = row[key as keyof CourseInfo];
  });
  dialogVisible.value = true;
};

// 删除课程
const handleDelete = async (row: CourseInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程《${row.name}》吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // 实际项目中这里应该调用删除API
    ElMessage.success("删除成功");
  } catch {
    // 用户取消删除
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid, fields) => {
    if (valid) {
      // 实际项目中这里应该调用保存API
      ElMessage.success(dialogType.value === "add" ? "添加成功" : "更新成功");
      dialogVisible.value = false;
    } else {
      console.log("验证失败:", fields);
    }
  });
};

// 图片上传相关
const beforeAvatarUpload: UploadProps["beforeUpload"] = (file) => {
  const isJPG = file.type === "image/jpeg";
  const isPNG = file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error("上传头像图片只能是 JPG/PNG 格式!");
  }
  if (!isLt2M) {
    ElMessage.error("上传头像图片大小不能超过 2MB!");
  }

  return (isJPG || isPNG) && isLt2M;
};

const handleAvatarSuccess: UploadProps["onSuccess"] = (
  response,
  uploadFile
) => {
  courseForm.image = URL.createObjectURL(uploadFile.raw!);
};

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  // 重新加载数据
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  // 重新加载数据
};

// 其他功能
const handleImport = () => {
  // 实现导入功能
};

const handleExport = () => {
  // 实现导出功能
};

const handleMaterials = (row: CourseInfo) => {
  // 实现课程资料管理
};

const handleStudents = (row: CourseInfo) => {
  // 实现学生管理
};
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

  .action-bar {
    margin: 20px 0;
  }

  .search-card {
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

        p {
          margin: 0;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }

    .course-detail {
      padding: 20px;

      .description-content {
        margin-top: 20px;

        h4 {
          margin-bottom: 8px;
          color: var(--el-text-color-primary);
        }

        p {
          color: var(--el-text-color-regular);
          line-height: 1.6;
        }
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
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
