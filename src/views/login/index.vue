<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">学生选课系统</h2>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-position="top"
      >
        <el-form-item prop="username" label="用户名">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="userType" label="用户类型">
          <el-select
            v-model="formData.userType"
            placeholder="请选择用户类型"
            class="w-full"
          >
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="w-full"
            @click="handleSubmit(formRef)"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

interface FormData {
  username: string;
  password: string;
  userType: string;
}

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = reactive<FormData>({
  username: "",
  password: "",
  userType: "student",
});

const rules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
  ],
  userType: [{ required: true, message: "请选择用户类型", trigger: "change" }],
};

const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        await userStore.login(formData);
        ElMessage.success("登录成功");

        // 根据用户类型跳转
        const routes = {
          student: "/student/course-list",
          teacher: "/teacher/course-manage",
          admin: "/admin/user-manage",
        };
        console.log(formData);
        router.push(routes[formData.userType]);
      } catch (error: any) {
        ElMessage.error(error.message || "登录失败");
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 100%;
  max-width: 400px;

  :deep(.el-card__body) {
    padding: 40px;
  }
}

.login-title {
  text-align: center;
  margin-bottom: 40px;
  color: var(--el-text-color-primary);
  font-weight: bold;
  font-size: 24px;
}

.w-full {
  width: 100%;
}
</style>
