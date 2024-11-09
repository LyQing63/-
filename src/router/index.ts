import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/stores/user";

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/login/index.vue"),
    meta: {
      title: "登录",
      noAuth: true,
    },
  },
  {
    path: "/",
    component: () => import("../layouts/BasicLayout.vue"),
    redirect: "/login",
    children: [
      // 学生路由
      {
        path: "/student",
        name: "StudentLayout",
        component: () => import("../layouts/StudentLayout.vue"),
        meta: {
          title: "学生系统",
          role: ["student"],
        },
        children: [
          {
            path: "course-list",
            name: "CourseList",
            component: () => import("../views/student/course-list/index.vue"),
            meta: { title: "课程列表" },
          },
          {
            path: "my-course",
            name: "MyCourse",
            component: () => import("../views/student/my-course/index.vue"),
            meta: { title: "我的课程" },
          },
        ],
      },
      // 教师路由
      {
        path: "/teacher",
        name: "TeacherLayout",
        component: () => import("../layouts/TeacherLayout.vue"),
        meta: {
          title: "教师系统",
          role: ["teacher"],
        },
        children: [
          {
            path: "course-manage",
            name: "CourseManage",
            component: () => import("../views/teacher/courseManage/index.vue"),
            meta: { title: "课程管理" },
          },
          {
            path: "student-list",
            name: "StudentList",
            component: () => import("../views/teacher/sutdent-list/index.vue"),
            meta: { title: "学生名单" },
          },
        ],
      },
      // 管理员路由
      {
        path: "/admin",
        name: "AdminLayout",
        component: () => import("../layouts/AdminLayout.vue"),
        meta: {
          title: "管理系统",
          role: ["admin"],
        },
        children: [
          {
            path: "user-manage",
            name: "UserManage",
            component: () => import("../views/admin/user-manage/index.vue"),
            meta: { title: "用户管理" },
          },
          {
            path: "course-manage",
            name: "AdminCourseManage",
            component: () => import("../views/admin/course-manage/index.vue"),
            meta: { title: "课程管理" },
          },
        ],
      },
    ],
  },
  // 错误页面
  {
    path: "/403",
    name: "403",
    component: () => import("../views/error/403.vue"),
    meta: {
      title: "无权访问",
      noAuth: true,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: () => import("../views/error/404.vue"),
    meta: {
      title: "页面不存在",
      noAuth: true,
    },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 学生选课系统`;

  const userStore = useUserStore();
  const token = localStorage.getItem("token");

  // 不需要登录的页面
  if (to.meta.noAuth) {
    next();
    return;
  }

  // 需要登录但没有token
  if (!token) {
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
    return;
  }

  // 获取用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo();
    } catch (error) {
      next("/login");
      return;
    }
  }

  // 权限验证
  const userRole = userStore.userInfo?.role;
  if (to.meta.role && !to.meta.role.includes(userRole)) {
    next("/403");
    return;
  }

  next();
});

export default router;
