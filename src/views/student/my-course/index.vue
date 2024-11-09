<template>
  <div class="my-course">
    <!-- 课程统计卡片 -->
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

    <!-- 课程列表 -->
    <el-card class="course-list">
      <template #header>
        <div class="card-header">
          <span>我的课程</span>
          <div class="header-actions">
            <el-radio-group v-model="listType" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="in_progress">进行中</el-radio-button>
              <el-radio-button label="ended">已结束</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-table :data="filteredCourseList" style="width: 100%">
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

        <el-table-column label="教师" width="150">
          <template #default="{ row }">
            <div class="teacher-info">
              <el-avatar :size="32" :src="row.teacherAvatar" />
              <span>{{ row.teacher }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="time" label="上课时间" width="120" />
        <el-table-column prop="location" label="上课地点" width="120" />

        <el-table-column label="考核方式" width="100">
          <template #default="{ row }">
            <el-tag :type="getExamTypeTag(row.examType)">
              {{ ExamTypeMap[row.examType] }}
            </el-tag>
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
            <el-button link type="primary" @click="handleViewDetail(row)">
              查看
            </el-button>
            <el-button
              link
              type="primary"
              @click="handleViewMaterials(row)"
              :disabled="!row.materials?.length"
            >
              资料
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDropCourse(row)"
              :disabled="row.status === 'ended'"
            >
              退课
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 课程资料对话框 -->
    <el-dialog v-model="materialsDialogVisible" title="课程资料" width="600px">
      <el-table :data="currentMaterials" style="width: 100%">
        <el-table-column prop="name" label="资料名称" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDownload(row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import type { CourseInfo, CourseMaterial } from "@/types/course";
import { CourseStatusMap, ExamTypeMap } from "@/types/course";

// 课程统计数据
const courseStats = ref([
  {
    title: "总学分",
    value: "16",
    icon: "Collection",
    color: "text-primary",
  },
  {
    title: "在修课程",
    value: "5",
    icon: "Reading",
    color: "text-success",
  },
  {
    title: "已修课程",
    value: "3",
    icon: "Check",
    color: "text-info",
  },
  {
    title: "平均绩点",
    value: "3.8",
    icon: "Star",
    color: "text-warning",
  },
]);

// 列表类型
const listType = ref<"all" | "in_progress" | "ended">("all");

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

// 根据类型筛选课程
const filteredCourseList = computed(() => {
  if (listType.value === "all") return courseList.value;
  return courseList.value.filter((course) => course.status === listType.value);
});

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

// 课程资料相关
const materialsDialogVisible = ref(false);
const currentMaterials = ref<CourseMaterial[]>([]);

// 查看课程资料
const handleViewMaterials = (course: CourseInfo) => {
  currentMaterials.value = course.materials || [];
  materialsDialogVisible.value = true;
};

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return size + "B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + "KB";
  return (size / 1024 / 1024).toFixed(1) + "MB";
};

// 下载文件
const handleDownload = (material: CourseMaterial) => {
  ElMessage.success(`开始下载：${material.name}`);
  // 实际项目中这里应该调用下载API
  window.open(material.url, "_blank");
};

// 查看课程详情
const handleViewDetail = (course: CourseInfo) => {
  // 实际项目中这里应该跳转到课程详情页
  console.log("查看课程详情:", course);
};

// 退课操作
const handleDropCourse = async (course: CourseInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要退出《${course.name}》这门课程吗？`,
      "退课确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    // 实际项目中这里应该调用退课API
    ElMessage.success("退课成功");

    // 更新课程列表
    const index = courseList.value.findIndex((item) => item.id === course.id);
    if (index > -1) {
      courseList.value.splice(index, 1);
    }
  } catch {
    // 用户取消退课
  }
};
</script>

<style scoped lang="scss">
.my-course {
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

  .course-list {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

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
          // 不使用 @extend，直接写样式
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }
    }

    .teacher-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
