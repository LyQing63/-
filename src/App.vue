<template>
  <el-config-provider :locale="zhCn">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

const userStore = useUserStore();

// 页面加载时检查登录状态
onMounted(async () => {
  const token = localStorage.getItem("token");
  if (token && !userStore.userInfo) {
    try {
      // 如果有token但没有用户信息，则获取用户信息
      // 这里使用模拟数据，实际项目中应该调用API
      const userRole = localStorage.getItem("userRole");
      if (userRole) {
        // 模拟获取用户信息的延迟
        await new Promise((resolve) => setTimeout(resolve, 500));
        // 设置模拟的用户信息
        const mockUserInfo = {
          student: {
            id: 1,
            username: "student",
            name: "张三",
            role: "student",
            studentId: "2024001",
            department: "计算机学院",
            major: "软件工程",
            class: "软工2401",
            avatar:
              "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
          },
          teacher: {
            id: 2,
            username: "teacher",
            name: "李老师",
            role: "teacher",
            teacherId: "T2024001",
            department: "计算机学院",
            title: "副教授",
            avatar:
              "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
          },
          admin: {
            id: 3,
            username: "admin",
            name: "管理员",
            role: "admin",
            adminId: "A2024001",
            department: "教务处",
            avatar:
              "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
          },
        }[userRole];

        if (mockUserInfo) {
          userStore.userInfo = mockUserInfo;
        }
      }
    } catch (error) {
      console.error("获取用户信息失败：", error);
    }
  }
});
</script>

<style lang="scss">
// 重置样式
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #909399;
  border-radius: 4px;

  &:hover {
    background: #606266;
  }
}

// 路由切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// Element Plus 样式覆盖
:root {
  // 主题色
  --el-color-primary: #409eff;

  // 成功色
  --el-color-success: #67c23a;

  // 警告色
  --el-color-warning: #e6a23c;

  // 危险色
  --el-color-danger: #f56c6c;

  // 信息色
  --el-color-info: #909399;
}

// 卡片样式优化
.el-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  &__header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__body {
    padding: 20px;
  }
}

// 按钮样式优化
.el-button {
  border-radius: 4px;

  &--primary {
    --el-button-hover-bg-color: var(--el-color-primary-light-2);
    --el-button-hover-border-color: var(--el-color-primary-light-2);
  }
}

// 表单样式优化
.el-form-item {
  margin-bottom: 24px;

  &__label {
    font-weight: 500;
  }
}

// 输入框样式优化
.el-input {
  --el-input-hover-border-color: var(--el-color-primary-light-2);
  --el-input-focus-border-color: var(--el-color-primary);
}

// 表格样式优化
.el-table {
  --el-table-header-bg-color: #f5f7fa;
  --el-table-row-hover-bg-color: #f5f7fa;

  th {
    font-weight: 500;
  }
}

// 分页样式优化
.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

// 弹窗样式优化
.el-dialog {
  border-radius: 8px;

  &__header {
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__body {
    padding: 24px;
  }

  &__footer {
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
  }
}

// 消息提示样式优化
.el-message {
  min-width: 320px;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
