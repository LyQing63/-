<template>
  <div class="forbidden">
    <div class="content">
      <div class="left">
        <h1>403</h1>
        <h2>抱歉，您没有访问权限</h2>
        <p>可能的原因：</p>
        <ul>
          <li>您的账号权限不足</li>
          <li>您尚未登录系统</li>
          <li>您的账号已被禁用</li>
        </ul>
        <div class="actions">
          <el-button type="primary" @click="$router.push('/')">
            返回首页
          </el-button>
          <el-button @click="$router.back()"> 返回上一页 </el-button>
          <el-button type="success" @click="handleLogin" v-if="!isLogin">
            去登录
          </el-button>
        </div>
        <div class="timer" v-if="isLogin">
          <p>{{ timer }}秒后自动返回首页</p>
        </div>
      </div>
      <div class="right">
        <el-image :src="forbiddenImage" alt="403">
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import forbiddenImage from "@/assets/403.png"; // 需要添加对应的图片资源

const router = useRouter();
const userStore = useUserStore();
const isLogin = ref(userStore.isLogin);
const timer = ref(5);
let intervalId: NodeJS.Timer;

onMounted(() => {
  if (isLogin.value) {
    // 已登录用户倒计时自动跳转
    intervalId = setInterval(() => {
      timer.value--;
      if (timer.value <= 0) {
        clearInterval(intervalId);
        router.push("/");
      }
    }, 1000);
  }
});

onBeforeUnmount(() => {
  // 组件销毁前清除定时器
  clearInterval(intervalId);
});

const handleLogin = () => {
  router.push({
    path: "/login",
    query: {
      redirect: router.currentRoute.value.fullPath,
    },
  });
};
</script>

<style scoped lang="scss">
.forbidden {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color);

  .content {
    display: flex;
    align-items: center;
    gap: 60px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;

    .left {
      flex: 1;

      h1 {
        font-size: 72px;
        font-weight: bold;
        color: var(--el-color-danger);
        margin: 0 0 20px;
        line-height: 1;
      }

      h2 {
        font-size: 24px;
        color: var(--el-text-color-primary);
        margin: 0 0 20px;
      }

      p {
        font-size: 16px;
        color: var(--el-text-color-regular);
        margin: 0 0 10px;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0 0 30px;

        li {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;

          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 8px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--el-color-danger);
          }
        }
      }

      .actions {
        margin-bottom: 20px;

        .el-button {
          margin-right: 16px;
        }
      }

      .timer {
        p {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .right {
      flex: 1;

      .el-image {
        width: 100%;
        max-width: 400px;
      }

      .image-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 400px;
        background: var(--el-fill-color-lighter);
        color: var(--el-text-color-secondary);

        .el-icon {
          font-size: 48px;
        }
      }
    }
  }
}

// 响应式处理
@media screen and (max-width: 768px) {
  .forbidden {
    .content {
      flex-direction: column-reverse;
      gap: 30px;
      padding: 20px;
      text-align: center;

      .left {
        h1 {
          font-size: 48px;
        }

        h2 {
          font-size: 20px;
        }

        ul {
          display: inline-block;
          text-align: left;
        }

        .actions {
          .el-button {
            margin: 0 8px 10px;
          }
        }
      }

      .right {
        .el-image {
          max-width: 300px;
        }

        .image-slot {
          height: 300px;
        }
      }
    }
  }
}
</style>
