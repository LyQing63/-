import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserInfo, LoginParams, UserRole } from "@/types/user";
import { ElMessage } from "element-plus";
import router from "@/router";

// 模拟用户数据
const mockUserData = {
  student: {
    id: 1,
    username: "student",
    name: "张三",
    role: "student" as UserRole,
    studentId: "2024001",
    department: "计算机学院",
    major: "软件工程",
    class: "软工2401",
    email: "student@example.com",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
  teacher: {
    id: 2,
    username: "teacher",
    name: "李老师",
    role: "teacher" as UserRole,
    teacherId: "T2024001",
    department: "计算机学院",
    email: "teacher@example.com",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
  admin: {
    id: 3,
    username: "admin",
    name: "管理员",
    role: "admin" as UserRole,
    email: "admin@example.com",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
};

export const useUserStore = defineStore("user", () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem("token"));
  const userInfo = ref<UserInfo | null>(null);
  const loading = ref(false);

  // 计算属性
  const isLoggedIn = computed(() => !!token.value);
  const userRole = computed(() => userInfo.value?.role);
  const userName = computed(() => userInfo.value?.name);

  // 登录
  const login = async (loginParams: LoginParams) => {
    try {
      loading.value = true;
      // 模拟登录延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟登录验证
      if (loginParams.password !== "123456") {
        throw new Error("密码错误");
      }

      // 获取模拟用户数据
      const mockUser = mockUserData[loginParams.userType];
      if (!mockUser) {
        throw new Error("用户不存在");
      }

      // 生成模拟token
      const mockToken = `mock-token-${Date.now()}`;

      // 保存状态
      token.value = mockToken;
      userInfo.value = mockUser;

      // 持久化存储
      localStorage.setItem("token", mockToken);
      localStorage.setItem("userRole", mockUser.role);

      ElMessage.success("登录成功");

      // 根据角色跳转
      const roleRoutes = {
        student: "/student/course-list",
        teacher: "/teacher/course-manage",
        admin: "/admin/dashboard",
      };
      router.push(roleRoutes[mockUser.role]);
    } catch (error: any) {
      ElMessage.error(error.message || "登录失败");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 登出
  const logout = async () => {
    try {
      loading.value = true;
      // 模拟登出延迟
      await new Promise((resolve) => setTimeout(resolve, 500));
      resetUserInfo();
      ElMessage.success("退出登录成功");
      router.push("/login");
    } catch (error: any) {
      ElMessage.error(error.message || "退出登录失败");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 重置用户信息
  const resetUserInfo = () => {
    token.value = null;
    userInfo.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
  };

  // 检查权限
  const hasPermission = (roles: UserRole | UserRole[]) => {
    const userRole = userInfo.value?.role;
    if (!userRole) return false;
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return roles === userRole;
  };

  return {
    token,
    userInfo,
    loading,
    isLoggedIn,
    userRole,
    userName,
    login,
    logout,
    resetUserInfo,
    hasPermission,
  };
});
