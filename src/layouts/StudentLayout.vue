<template>
  <div class="student-layout">
    <!-- 顶部信息栏 -->
    <div class="info-bar">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>个人信息</span>
            <el-button type="primary" link>编辑</el-button>
          </div>
        </template>
        <div class="info-content">
          <el-avatar :size="64" :src="userStore.userInfo?.avatar" />
          <div class="info-details">
            <h3>{{ userStore.userInfo?.name }}</h3>
            <p>学号：{{ (userStore.userInfo as StudentInfo)?.studentId }}</p>
            <p>班级：{{ (userStore.userInfo as StudentInfo)?.class }}</p>
          </div>
          <div class="study-info">
            <div class="info-item">
              <h4>已修学分</h4>
              <p>68</p>
            </div>
            <div class="info-item">
              <h4>本学期学分</h4>
              <p>24</p>
            </div>
            <div class="info-item">
              <h4>绩点</h4>
              <p>3.8</p>
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

    <!-- 右侧通知栏 -->
    <div class="notice-bar">
      <el-card class="notice-card">
        <template #header>
          <div class="card-header">
            <span>通知公告</span>
            <el-button type="primary" link>更多</el-button>
          </div>
        </template>
        <div class="notice-list">
          <div v-for="notice in notices" :key="notice.id" class="notice-item">
            <span class="notice-title">{{ notice.title }}</span>
            <span class="notice-time">{{ notice.time }}</span>
          </div>
        </div>
      </el-card>

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
              <div class="course-location">{{ course.location }}</div>
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
import type { StudentInfo } from "@/types/user";

const userStore = useUserStore();

// 模拟数据
const notices = ref([
  { id: 1, title: "2024学年第二学期选课通知", time: "2024-03-01" },
  { id: 2, title: "关于期中考试安排的通知", time: "2024-03-05" },
  { id: 3, title: "图书馆开放时间调整通知", time: "2024-03-10" },
]);

const todayCourses = ref([
  {
    id: 1,
    name: "高等数学",
    time: "8:00-9:40",
    location: "教学楼A101",
  },
  {
    id: 2,
    name: "计算机网络",
    time: "10:00-11:40",
    location: "教学楼B203",
  },
  {
    id: 3,
    name: "数据结构",
    time: "14:00-15:40",
    location: "教学楼C305",
  },
]);
</script>

<style scoped lang="scss">
.student-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
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

        .study-info {
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

  .notice-bar {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .notice-card,
    .schedule-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .notice-list {
      .notice-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .notice-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notice-time {
          color: #999;
          font-size: 12px;
          margin-left: 10px;
        }
      }
    }

    .schedule-list {
      .schedule-item {
        display: flex;
        gap: 10px;
        padding: 10px 0;
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
