<template>
  <div class="admin-layout">
    <!-- 顶部统计卡片 -->
    <div class="stats-bar">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in statsData" :key="stat.title">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
                <el-icon><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-change" :class="stat.trend">
                  <el-icon>
                    <CaretTop v-if="stat.trend === 'up'" />
                    <CaretBottom v-else />
                  </el-icon>
                  {{ stat.change }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <el-row :gutter="20">
        <!-- 左侧内容区 -->
        <el-col :span="16">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-col>

        <!-- 右侧信息栏 -->
        <el-col :span="8">
          <!-- 系统状态 -->
          <el-card class="system-card">
            <template #header>
              <div class="card-header">
                <span>系统状态</span>
                <el-tag type="success">正常运行</el-tag>
              </div>
            </template>
            <div class="system-stats">
              <div
                class="stat-item"
                v-for="item in systemStats"
                :key="item.label"
              >
                <div class="stat-label">{{ item.label }}</div>
                <el-progress
                  :percentage="item.value"
                  :color="item.color"
                  :stroke-width="8"
                  :format="(val) => `${val}%`"
                />
              </div>
            </div>
          </el-card>

          <!-- 最近活动 -->
          <el-card class="activity-card">
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
                <el-button type="primary" link>查看全部</el-button>
              </div>
            </template>
            <div class="activity-list">
              <el-timeline>
                <el-timeline-item
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :type="activity.type"
                  :timestamp="activity.time"
                  size="small"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>

          <!-- 快捷操作 -->
          <el-card class="quick-actions">
            <template #header>
              <div class="card-header">
                <span>快捷操作</span>
              </div>
            </template>
            <div class="action-grid">
              <div
                v-for="action in quickActions"
                :key="action.title"
                class="action-item"
                @click="handleQuickAction(action.key)"
              >
                <el-icon><component :is="action.icon" /></el-icon>
                <span>{{ action.title }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  User,
  Reading,
  School,
  DataLine,
  CaretTop,
  CaretBottom,
  Plus,
  Setting,
  Document,
  Upload,
  Download,
  Refresh,
} from "@element-plus/icons-vue";

const router = useRouter();

// 统计数据
const statsData = ref([
  {
    title: "总用户数",
    value: "1,286",
    change: "12.5",
    trend: "up",
    icon: "User",
    bgColor: "#409EFF",
  },
  {
    title: "课程数量",
    value: "256",
    change: "8.2",
    trend: "up",
    icon: "Reading",
    bgColor: "#67C23A",
  },
  {
    title: "院系数量",
    value: "18",
    change: "0",
    trend: "flat",
    icon: "School",
    bgColor: "#E6A23C",
  },
  {
    title: "活跃度",
    value: "89%",
    change: "5.3",
    trend: "up",
    icon: "DataLine",
    bgColor: "#F56C6C",
  },
]);

// 系统状态
const systemStats = ref([
  { label: "CPU使用率", value: 45, color: "#409EFF" },
  { label: "内存使用率", value: 62, color: "#67C23A" },
  { label: "存储空间", value: 78, color: "#E6A23C" },
  { label: "带宽使用率", value: 35, color: "#F56C6C" },
]);

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    content: "新增用户：张三（学生）",
    time: "10分钟前",
    type: "primary",
  },
  {
    id: 2,
    content: "系统更新：v2.1.0版本发布",
    time: "30分钟前",
    type: "success",
  },
  {
    id: 3,
    content: "警告：检测到异常登录",
    time: "1小时前",
    type: "warning",
  },
  {
    id: 4,
    content: "数据备份完成",
    time: "2小时前",
    type: "info",
  },
]);

// 快捷操作
const quickActions = ref([
  { key: "addUser", title: "添加用户", icon: "Plus" },
  { key: "settings", title: "系统设置", icon: "Setting" },
  { key: "backup", title: "数据备份", icon: "Upload" },
  { key: "restore", title: "数据恢复", icon: "Download" },
  { key: "logs", title: "系统日志", icon: "Document" },
  { key: "refresh", title: "刷新缓存", icon: "Refresh" },
]);

// 处理快捷操作
const handleQuickAction = (key: string) => {
  switch (key) {
    case "addUser":
      router.push("/admin/user/add");
      break;
    case "settings":
      router.push("/admin/settings");
      break;
    case "logs":
      router.push("/admin/logs");
      break;
    // ... 其他操作
  }
};
</script>

<style scoped lang="scss">
.admin-layout {
  padding: 20px;

  .stats-bar {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 24px;
            color: #fff;
          }
        }

        .stat-info {
          flex: 1;

          .stat-title {
            color: #666;
            font-size: 14px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            margin: 4px 0;
          }

          .stat-change {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;

            &.up {
              color: #67c23a;
            }

            &.down {
              color: #f56c6c;
            }

            &.flat {
              color: #909399;
            }
          }
        }
      }
    }
  }

  .main-content {
    .system-card,
    .activity-card,
    .quick-actions {
      margin-bottom: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .system-stats {
      .stat-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .stat-label {
          margin-bottom: 8px;
          color: #666;
        }
      }
    }

    .activity-list {
      .el-timeline {
        padding-top: 8px;
      }
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }

        .el-icon {
          font-size: 24px;
        }

        span {
          font-size: 14px;
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
