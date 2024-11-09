<template>
  <div class="course-list">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="form">
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入课程名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="任课教师">
          <el-input
            v-model="searchForm.teacher"
            placeholder="请输入教师姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option
              v-for="item in courseTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
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
    </div>

    <!-- 课程列表 -->
    <div class="course-grid">
      <el-row :gutter="20">
        <el-col
          v-for="course in courseList"
          :key="course.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          class="mb-4"
        >
          <el-card
            class="course-card"
            shadow="hover"
            :body-style="{ padding: '0px' }"
          >
            <div class="course-image">
              <el-image :src="course.image" fit="cover" :lazy="true">
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-type">{{ course.type }}</div>
            </div>
            <div class="course-info">
              <h3 class="course-name">{{ course.name }}</h3>
              <div class="course-teacher">
                <el-avatar :size="24" :src="course.teacherAvatar" />
                <span>{{ course.teacher }}</span>
              </div>
              <div class="course-meta">
                <span>
                  <el-icon><Calendar /></el-icon>
                  {{ course.time }}
                </span>
                <span>
                  <el-icon><Location /></el-icon>
                  {{ course.location }}
                </span>
              </div>
              <div class="course-stats">
                <span>
                  <el-icon><User /></el-icon>
                  {{ course.enrolled }}/{{ course.capacity }}
                </span>
                <span>
                  <el-icon><Collection /></el-icon>
                  {{ course.credit }}学分
                </span>
              </div>
              <div class="course-actions">
                <el-button
                  type="primary"
                  :disabled="course.enrolled >= course.capacity"
                  @click="handleSelect(course)"
                >
                  {{ course.enrolled >= course.capacity ? "人数已满" : "选课" }}
                </el-button>
                <el-button @click="handleDetail(course)">详情</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 课程详情对话框 -->
    <el-dialog v-model="dialogVisible" title="课程详情" width="600px">
      <div v-if="currentCourse" class="course-detail">
        <div class="detail-header">
          <el-image
            :src="currentCourse.image"
            fit="cover"
            class="detail-image"
          />
          <div class="detail-info">
            <h2>{{ currentCourse.name }}</h2>
            <p class="teacher-info">
              <el-avatar :size="32" :src="currentCourse.teacherAvatar" />
              <span>{{ currentCourse.teacher }}</span>
            </p>
          </div>
        </div>
        <div class="detail-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="课程类型">
              {{ currentCourse.type }}
            </el-descriptions-item>
            <el-descriptions-item label="学分">
              {{ currentCourse.credit }}
            </el-descriptions-item>
            <el-descriptions-item label="上课时间">
              {{ currentCourse.time }}
            </el-descriptions-item>
            <el-descriptions-item label="上课地点">
              {{ currentCourse.location }}
            </el-descriptions-item>
            <el-descriptions-item label="已选/容量">
              {{ currentCourse.enrolled }}/{{ currentCourse.capacity }}
            </el-descriptions-item>
            <el-descriptions-item label="考核方式">
              {{ currentCourse.examType }}
            </el-descriptions-item>
          </el-descriptions>
          <div class="course-description">
            <h4>课程简介</h4>
            <p>{{ currentCourse.description }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button
            type="primary"
            :disabled="
              currentCourse?.enrolled >= (currentCourse?.capacity || 0)
            "
            @click="handleSelect(currentCourse)"
          >
            选课
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { CourseInfo } from "@/types/course";

// 搜索表单
const searchForm = reactive({
  name: "",
  teacher: "",
  type: "",
});

// 课程类型选项
const courseTypes = [
  { label: "必修课", value: "required" },
  { label: "选修课", value: "elective" },
  { label: "公共课", value: "public" },
];

// 分页参数
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(100);

// 在script setup中添加模拟数据
const courseList = ref<CourseInfo[]>([
  {
    id: 1,
    name: "计算机网络",
    code: "CS301",
    type: "required",
    credit: 3,
    hours: 48,
    semester: "2023-2024-2",
    description:
      "本课程系统讲授计算机网络的基本概念、基本原理和基本方法。引导学生深入了解网络协议的分层结构，介绍物理层、数据链路层、网络层、运输层和应用层的主要协议。要求学生理解并掌握这些协议的原理和内在机制。",
    teacher: "张网络",
    teacherId: "T2024001",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "计算机科学与技术学院",
    capacity: 50,
    enrolled: 30,
    time: "周一 1-2节",
    location: "教学楼A101",
    image: "https://picsum.photos/id/1/400/200",
    examType: "exam",
    status: "not_started",
    syllabus: "第1周：计算机网络概述\n第2周：物理层\n第3周：数据链路层...",
    materials: [
      {
        id: 1,
        name: "课程PPT第一章",
        type: "pdf",
        size: 2048,
        url: "https://example.com/ppt1.pdf",
        uploadTime: "2024-03-01 10:00:00",
        downloads: 156,
      },
    ],
    schedule: [
      {
        week: 1,
        content: "计算机网络概述",
        assignment: "完成课后习题1-5",
      },
    ],
  },
  {
    id: 2,
    name: "数据结构",
    code: "CS202",
    type: "required",
    credit: 4,
    hours: 64,
    semester: "2023-2024-2",
    description:
      "数据结构是计算机科学与技术专业的核心课程。本课程系统讲授数据结构的基本概念、基本原理和基本方法，包括线性表、栈、队列、树、图等各种数据结构的逻辑特征和存储表示，以及相关的算法设计与分析。",
    teacher: "李数据",
    teacherId: "T2024002",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "计算机科学与技术学院",
    capacity: 60,
    enrolled: 45,
    time: "周二 3-4节",
    location: "教学楼B202",
    image: "https://picsum.photos/id/2/400/200",
    examType: "exam",
    status: "not_started",
    prerequisites: ["程序设计基础"],
    syllabus: "第1周：数据结构绪论\n第2周：线性表\n第3周：栈和队列...",
  },
  {
    id: 3,
    name: "大学英语",
    code: "EN101",
    type: "public",
    credit: 2,
    hours: 32,
    semester: "2023-2024-2",
    description:
      "本课程旨在提高学生的英语综合应用能力，特别是听说能力，使他们在今后学习、工作和社会交往中能用英语有效地进行口头和书面的信息交流。",
    teacher: "王英语",
    teacherId: "T2024003",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "外国语学院",
    capacity: 35,
    enrolled: 20,
    time: "周三 5-6节",
    location: "外语楼C303",
    image: "https://picsum.photos/id/3/400/200",
    examType: "exam",
    status: "not_started",
  },
  {
    id: 4,
    name: "人工智能导论",
    code: "CS401",
    type: "elective",
    credit: 3,
    hours: 48,
    semester: "2023-2024-2",
    description:
      "本课程介绍人工智能的基本概念、发展历史、主要应用领域以及最新发展动态。包括知识表示、问题求解、机器学习、深度学习、自然语言处理等内容。",
    teacher: "刘智能",
    teacherId: "T2024004",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "计算机科学与技术学院",
    capacity: 40,
    enrolled: 38,
    time: "周四 7-8节",
    location: "科技楼D404",
    image: "https://picsum.photos/id/4/400/200",
    examType: "design",
    status: "not_started",
    prerequisites: ["高等数学", "线性代数", "概率论"],
  },
  {
    id: 5,
    name: "软件工程",
    code: "CS303",
    type: "required",
    credit: 3,
    hours: 48,
    semester: "2023-2024-2",
    description:
      "本课程讲授软件工程的基本概念、原理和方法，包括软件过程、需求分析、系统设计、编码规范、测试技术、项目管理等内容。通过课程学习，使学生掌握规范的软件开发方法。",
    teacher: "赵工程",
    teacherId: "T2024005",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "软件工程学院",
    capacity: 45,
    enrolled: 25,
    time: "周五 3-4节",
    location: "软件楼E505",
    image: "https://picsum.photos/id/5/400/200",
    examType: "paper",
    status: "not_started",
    materials: [
      {
        id: 2,
        name: "软件需求规格说明书模板",
        type: "doc",
        size: 1024,
        url: "https://example.com/srs-template.doc",
        uploadTime: "2024-03-02 14:30:00",
        downloads: 89,
      },
    ],
  },
  {
    id: 6,
    name: "创新创业基础",
    code: "GE201",
    type: "public",
    credit: 2,
    hours: 32,
    semester: "2023-2024-2",
    description:
      "本课程旨在培养学生的创新思维和创业意识，介绍创新创业的基本理论和实践方法，引导学生了解创业过程中的机遇与挑战。",
    teacher: "孙创新",
    teacherId: "T2024006",
    teacherAvatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    department: "创新创业学院",
    capacity: 50,
    enrolled: 15,
    time: "周二 9-10节",
    location: "创业楼F606",
    image: "https://picsum.photos/id/6/400/200",
    examType: "report",
    status: "not_started",
  },
]);

// 当前选中的课程
const currentCourse = ref<CourseInfo | null>(null);
const dialogVisible = ref(false);

// 搜索
const handleSearch = () => {
  // 实际项目中这里应该调用API
  console.log("搜索条件：", searchForm);
};

// 重置搜索
const handleReset = () => {
  searchForm.name = "";
  searchForm.teacher = "";
  searchForm.type = "";
  handleSearch();
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  handleSearch();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  handleSearch();
};

// 选课
const handleSelect = async (course: CourseInfo | null) => {
  if (!course) return;

  try {
    await ElMessageBox.confirm(
      `确定要选择《${course.name}》这门课程吗？`,
      "选课确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      }
    );

    // 实际项目中这里应该调用API
    ElMessage.success("选课成功");
    dialogVisible.value = false;

    // 更新课程数据
    course.enrolled++;
  } catch {
    // 用户取消选课
  }
};

// 查看详情
const handleDetail = (course: CourseInfo) => {
  currentCourse.value = course;
  dialogVisible.value = true;
};
</script>

<style scoped lang="scss">
.course-list {
  padding: 20px;

  .course-grid {
    margin-top: 20px;
  }

  .course-card {
    height: 100%;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .course-image {
      position: relative;
      height: 150px;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .image-placeholder {
        height: 100%;
        background-color: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 40px;
          color: #909399;
        }
      }

      .course-type {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 4px 8px;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .course-info {
      padding: 16px;

      .course-name {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 500;
        // 不使用 @extend，直接写样式
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .course-teacher {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: var(--el-text-color-regular);
      }

      .course-meta,
      .course-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        color: var(--el-text-color-secondary);
        font-size: 13px;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .course-actions {
        display: flex;
        gap: 12px;

        .el-button {
          flex: 1;
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

.course-detail {
  .detail-header {
    margin-bottom: 20px;

    .detail-image {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .detail-info {
      h2 {
        margin: 0 0 12px;
      }

      .teacher-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--el-text-color-regular);
      }
    }
  }

  .detail-content {
    .course-description {
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

// 响应式调整
@media screen and (max-width: 768px) {
  .course-list {
    padding: 12px;

    .search-bar {
      .el-form {
        .el-form-item {
          margin-bottom: 12px;
        }
      }
    }
  }
}
</style>
