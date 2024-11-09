<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo" />
        <h1>学生选课系统</h1>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :router="true"
        :collapse="isCollapse"
      >
        <template v-if="userStore.userInfo?.role === 'student'">
          <el-menu-item index="/student/course-list">
            <el-icon><List /></el-icon>
            <template #title>课程列表</template>
          </el-menu-item>
          <el-menu-item index="/student/my-course">
            <el-icon><Collection /></el-icon>
            <template #title>我的课程</template>
          </el-menu-item>
          <el-menu-item index="/student/schedule">
            <el-icon><Calendar /></el-icon>
            <template #title>课程表</template>
          </el-menu-item>
          <el-menu-item index="/student/grade">
            <el-icon><Document /></el-icon>
            <template #title>成绩查询</template>
          </el-menu-item>
        </template>
        <template v-if="userStore.userInfo?.role === 'teacher'">
          <el-menu-item index="/teacher/course-manage">
            <el-icon><List /></el-icon>
            <template #title>课程管理</template>
          </el-menu-item>
          <el-menu-item index="/teacher/student-list">
            <el-icon><Collection /></el-icon>
            <template #title>学生名单</template>
          </el-menu-item>
          <el-menu-item index="/student/schedule">
            <el-icon><Calendar /></el-icon>
            <template #title>课程表</template>
          </el-menu-item>
          <el-menu-item index="/student/grade">
            <el-icon><Document /></el-icon>
            <template #title>试卷评分</template>
          </el-menu-item>
        </template>
        <template v-if="userStore.userInfo?.role === 'admin'">
          <el-menu-item index="/admin/user-manage">
            <el-icon><List /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/course-manage">
            <el-icon><Collection /></el-icon>
            <template #title>课程管理</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-tooltip effect="dark" content="全屏" placement="bottom">
            <el-icon class="right-menu-icon" @click="toggleFullScreen">
              <FullScreen />
            </el-icon>
          </el-tooltip>

          <el-dropdown @command="handleCommand">
            <div class="avatar-container">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
              <span class="username">{{ userStore.userInfo?.name }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessageBox } from "element-plus";
import {
  List,
  Collection,
  Calendar,
  Document,
  Fold,
  Expand,
  FullScreen,
  User,
  Lock,
  SwitchButton,
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isCollapse = ref(false);
const activeMenu = computed(() => route.path);

// 切换菜单折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 切换全屏
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case "profile":
      router.push("/profile");
      break;
    case "password":
      router.push("/change-password");
      break;
    case "logout":
      await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      await userStore.logout();
      router.push("/login");
      break;
  }
};
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;

  .aside {
    background-color: #304156;
    transition: width 0.3s;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: #fff;

      img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }

      h1 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
      }
    }

    .el-menu {
      border-right: none;

      &-vertical:not(.el-menu--collapse) {
        width: 220px;
      }
    }
  }

  .main-container {
    .header {
      background-color: #fff;
      border-bottom: 1px solid #dcdfe6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;

      .header-left {
        display: flex;
        align-items: center;

        .collapse-btn {
          font-size: 20px;
          cursor: pointer;
          margin-right: 20px;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;

        .right-menu-icon {
          font-size: 20px;
          cursor: pointer;
          margin-right: 20px;

          &:hover {
            color: var(--el-color-primary);
          }
        }

        .avatar-container {
          display: flex;
          align-items: center;
          cursor: pointer;

          .username {
            margin-left: 8px;
            font-size: 14px;
          }
        }
      }
    }

    .main {
      background-color: #f0f2f5;
      padding: 20px;
    }
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
</style>
