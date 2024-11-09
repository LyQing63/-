// 用户角色类型
export type UserRole = "student" | "teacher" | "admin";

// 用户状态类型
export type UserStatus = "active" | "disabled";

// 用户基础信息接口
export interface UserBase {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// 学生特有信息接口
export interface StudentInfo extends UserBase {
  role: "student";
  studentId: string;
  department: string;
  major: string;
  class: string;
  grade: string;
  enrollmentYear: string;
}

// 教师特有信息接口
export interface TeacherInfo extends UserBase {
  role: "teacher";
  teacherId: string;
  department: string;
  title: string; // 职称
  researchArea: string; // 研究方向
}

// 管理员特有信息接口
export interface AdminInfo extends UserBase {
  role: "admin";
  adminId: string;
  department: string;
  permissions: string[]; // 权限列表
}

// 用户信息联合类型
export type UserInfo = StudentInfo | TeacherInfo | AdminInfo;

// 登录参数接口
export interface LoginParams {
  username: string;
  password: string;
  userType: UserRole;
  remember?: boolean;
}

// 登录响应接口
export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

// 用户查询参数
export interface UserQueryParams {
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  pageSize?: number;
  current?: number;
}

// 用户列表响应
export interface UserListResponse {
  total: number;
  list: UserInfo[];
}

// 修改密码参数
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 用户注册参数
export interface RegisterParams {
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  // 根据角色可能需要的其他字段
  studentId?: string;
  teacherId?: string;
  department?: string;
  major?: string;
  class?: string;
}
