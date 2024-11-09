<template>
  <div class="not-found">
    <div class="content">
      <div class="left">
        <h1>404</h1>
        <h2>抱歉，您访问的页面不存在</h2>
        <p>可能是因为：</p>
        <ul>
          <li>网址输入错误</li>
          <li>页面已被移动或删除</li>
          <li>链接已过期</li>
        </ul>
        <div class="actions">
          <el-button type="primary" @click="$router.push('/')">
            返回首页
          </el-button>
          <el-button @click="$router.back()"> 返回上一页 </el-button>
        </div>
        <div class="timer">
          <p>{{ timer }}秒后自动返回首页</p>
        </div>
      </div>
      <div class="right">
        <el-image :src="notFoundImage" alt="404">
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
import notFoundImage from "@/assets/404.png"; // 需要添加对应的图片资源

const router = useRouter();
const timer = ref(5);
let intervalId: NodeJS.Timer;

onMounted(() => {
  // 倒计时自动跳转
  intervalId = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearInterval(intervalId);
      router.push("/");
    }
  }, 1000);
});

onBeforeUnmount(() => {
  // 组件销毁前清除定时器
  clearInterval(intervalId);
});
</script>

<style scoped lang="scss">
.not-found {
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
        color: var(--el-color-primary);
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
            background-color: var(--el-color-primary);
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
  .not-found {
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
            margin: 0 8px;
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
