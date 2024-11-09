<template>
  <div class="teacher-layout">
    <!-- 顶部信息栏 -->
    <div class="info-bar">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>教师信息</span>
            <el-button type="primary" link>编辑</el-button>
          </div>
        </template>
        <div class="info-content">
          <el-avatar :size="64" :src="userStore.userInfo?.avatar" />
          <div class="info-details">
            <h3>{{ userStore.userInfo?.name }}</h3>
            <p>工号：{{ (userStore.userInfo as TeacherInfo)?.teacherId }}</p>
            <p>院系：{{ (userStore.userInfo as TeacherInfo)?.department }}</p>
            <p>职称：{{ (userStore.userInfo as TeacherInfo)?.title }}</p>
          </div>
          <div class="teaching-info">
            <div class="info-item">
              <h4>授课课程</h4>
              <p>{{ teachingStats.courseCount }}</p>
            </div>
            <div class="info-item">
              <h4>学生人数</h4>
              <p>{{ teachingStats.studentCount }}</p>
            </div>
            <div class="info-item">
              <h4>教学评分</h4>
              <p>{{ teachingStats.rating }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 右侧信息栏 -->
    <div class="side-bar">
      <!-- 今日课程 -->
      <el-card class="schedule-card">
        <template #header>
          <div class="card-header">
            <span>今日课程</span>
            <el-button type="primary" link>课表</el-button>
          </div>
        </template>
        <div class="schedule-list">
          <div
            v-for="course in todayCourses"
            :key="course.id"
            class="schedule-item"
          >
            <div class="course-time">{{ course.time }}</div>
            <div class="course-info">
              <div class="course-name">{{ course.name }}</div>
              <div class="course-location">
                {{ course.location }} | {{ course.studentCount }}人
              </div>
            </div>
            <el-tag
              :type="course.status === 'ongoing' ? 'success' : ''"
              size="small"
            >
              {{ courseStatusMap[course.status] }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 待办事项 -->
      <el-card class="todo-card">
        <template #header>
          <div class="card-header">
            <span>待办事项</span>
            <el-button type="primary" link>全部</el-button>
          </div>
        </template>
        <div class="todo-list">
          <div v-for="todo in todoList" :key="todo.id" class="todo-item">
            <el-checkbox v-model="todo.done">{{ todo.title }}</el-checkbox>
            <span class="todo-deadline">{{ todo.deadline }}</span>
          </div>
        </div>
      </el-card>

      <!-- 教学通知 -->
      <el-card class="notice-card">
        <template #header>
          <div class="card-header">
            <span>教学通知</span>
            <el-button type="primary" link>发布</el-button>
          </div>
        </template>
        <div class="notice-list">
          <div v-for="notice in notices" :key="notice.id" class="notice-item">
            <div class="notice-content">
              <span class="notice-title">{{ notice.title }}</span>
              <span class="notice-course">{{ notice.course }}</span>
            </div>
            <div class="notice-footer">
              <span class="notice-time">{{ notice.time }}</span>
              <span class="notice-stats">
                已读 {{ notice.readCount }}/{{ notice.totalCount }}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import type { TeacherInfo } from "@/types/user";

const userStore = useUserStore();

// 课程状态映射
const courseStatusMap = {
  upcoming: "未开始",
  ongoing: "进行中",
  finished: "已结束",
};

// 模拟数据 - 教学统计
const teachingStats = ref({
  courseCount: 5,
  studentCount: 238,
  rating: 4.8,
});

// 模拟数据 - 今日课程
const todayCourses = ref([
  {
    id: 1,
    name: "数据结构",
    time: "8:00-9:40",
    location: "教学楼A101",
    studentCount: 45,
    status: "finished",
  },
  {
    id: 2,
    name: "计算机网络",
    time: "10:00-11:40",
    location: "教学楼B203",
    studentCount: 52,
    status: "ongoing",
  },
  {
    id: 3,
    name: "操作系统",
    time: "14:00-15:40",
    location: "教学楼C305",
    studentCount: 48,
    status: "upcoming",
  },
]);

// 模拟数据 - 待办事项
const todoList = ref([
  {
    id: 1,
    title: "提交本周教学进度报告",
    deadline: "今天 18:00",
    done: false,
  },
  {
    id: 2,
    title: "批改数据结构作业",
    deadline: "明天 12:00",
    done: false,
  },
  {
    id: 3,
    title: "准备期中考试试题",
    deadline: "3月20日",
    done: true,
  },
]);

// 模拟数据 - 教学通知
const notices = ref([
  {
    id: 1,
    title: "关于下周实验课安排调整的通知",
    course: "计算机网络",
    time: "10分钟前",
    readCount: 30,
    totalCount: 52,
  },
  {
    id: 2,
    title: "期中考试时间安排",
    course: "数据结构",
    time: "2小时前",
    readCount: 42,
    totalCount: 45,
  },
  {
    id: 3,
    title: "课程作业提交说明",
    course: "操作系统",
    time: "昨天",
    readCount: 45,
    totalCount: 48,
  },
]);
</script>

<style scoped lang="scss">
.teacher-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  grid-template-rows: auto 1fr;
  gap: 20px;
  padding: 20px;

  .info-bar {
    grid-column: 1 / -1;

    .info-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .info-content {
        display: flex;
        align-items: center;
        gap: 20px;

        .info-details {
          h3 {
            margin: 0 0 8px 0;
          }

          p {
            margin: 4px 0;
            color: #666;
          }
        }

        .teaching-info {
          margin-left: auto;
          display: flex;
          gap: 40px;

          .info-item {
            text-align: center;

            h4 {
              margin: 0;
              color: #666;
              font-weight: normal;
            }

            p {
              margin: 8px 0 0 0;
              font-size: 24px;
              color: var(--el-color-primary);
            }
          }
        }
      }
    }
  }

  .main-content {
    min-height: 500px;
  }

  .side-bar {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .schedule-card,
    .todo-card,
    .notice-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .schedule-list {
      .schedule-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .course-time {
          color: #666;
          white-space: nowrap;
        }

        .course-info {
          flex: 1;

          .course-name {
            font-weight: 500;
          }

          .course-location {
            color: #999;
            font-size: 12px;
            margin-top: 4px;
          }
        }
      }
    }

    .todo-list {
      .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        .todo-deadline {
          color: #999;
          font-size: 12px;
        }
      }
    }

    .notice-list {
      .notice-item {
        padding: 12px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .notice-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .notice-title {
            flex: 1;
            margin-right: 10px;
          }

          .notice-course {
            color: var(--el-color-primary);
            font-size: 12px;
          }
        }

        .notice-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}

// 路由切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
