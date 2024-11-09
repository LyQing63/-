<template>
  <div class="user-manage">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6" v-for="stat in userStats" :key="stat.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :class="stat.color"><component :is="stat.icon" /></el-icon>
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input
            v-model="searchForm.realName"
            placeholder="请输入真实姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择" clearable>
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-cascader
            v-model="searchForm.department"
            :options="departmentOptions"
            :props="{ checkStrictly: true }"
            clearable
            placeholder="请选择"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="left">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
        <el-button @click="handleBatchDelete" :disabled="!selectedUsers.length">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
        <el-button @click="handleBatchEnable" :disabled="!selectedUsers.length">
          <el-icon><Check /></el-icon>批量启用
        </el-button>
        <el-button
          @click="handleBatchDisable"
          :disabled="!selectedUsers.length"
        >
          <el-icon><Close /></el-icon>批量禁用
        </el-button>
      </div>
      <div class="right">
        <el-button-group>
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>导入
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 用户列表 -->
    <el-card class="list-card">
      <el-table
        :data="userList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-form label-position="left" inline class="user-detail">
              <el-form-item label="创建时间">
                <span>{{ row.createTime }}</span>
              </el-form-item>
              <el-form-item label="最后登录">
                <span>{{ row.lastLoginTime }}</span>
              </el-form-item>
              <el-form-item label="登录IP">
                <span>{{ row.lastLoginIp }}</span>
              </el-form-item>
              <el-form-item label="备注">
                <span>{{ row.remark || "无" }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar" />
              <div class="info-content">
                <div class="name">{{ row.realName }}</div>
                <div class="username">{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)" effect="plain">
              {{ getRoleName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="department" label="部门" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="'active'"
              :inactive-value="'disabled'"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="primary" @click="handleResetPwd(row)">
              重置密码
            </el-button>
            <el-button link type="primary" @click="handleAssignRole(row)">
              分配角色
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择">
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-cascader
            v-model="userForm.department"
            :options="departmentOptions"
            :props="{ checkStrictly: true }"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="userForm.status"
            :active-value="'active'"
            :inactive-value="'disabled'"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="userForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="500px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="用户">
          <span
            >{{ currentUser?.realName }}（{{ currentUser?.username }}）</span
          >
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="roleForm.roles">
            <el-checkbox
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.value"
            >
              {{ role.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRoleSubmit"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { FormInstance, FormRules, UploadProps } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";

// 在 script setup 中添加
const userStats = ref([
  {
    title: "总用户数",
    value: 1280,
    icon: "User",
    color: "text-primary",
  },
  {
    title: "教师用户",
    value: 156,
    icon: "School",
    color: "text-success",
  },
  {
    title: "学生用户",
    value: 1089,
    icon: "Reading",
    color: "text-warning",
  },
  {
    title: "新增用户",
    value: 35,
    icon: "UserFilled",
    color: "text-info",
  },
]);

const roleOptions = [
  { label: "管理员", value: "admin" },
  { label: "教师", value: "teacher" },
  { label: "学生", value: "student" },
];

const departmentOptions = [
  {
    value: "cs",
    label: "计算机科学与技术学院",
    children: [
      { value: "se", label: "软件工程系" },
      { value: "cs", label: "计算机科学系" },
      { value: "is", label: "信息安全系" },
    ],
  },
  {
    value: "ee",
    label: "电子工程学院",
    children: [
      { value: "ce", label: "通信工程系" },
      { value: "ee", label: "电子工程系" },
      { value: "ae", label: "自动化系" },
    ],
  },
];

const userList = ref([
  {
    id: 1,
    username: "admin",
    realName: "系统管理员",
    role: "admin",
    department: "信息中心",
    email: "admin@example.com",
    phone: "13800138000",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    status: "active",
    createTime: "2024-01-01 00:00:00",
    lastLoginTime: "2024-03-15 09:30:00",
    lastLoginIp: "192.168.1.1",
    remark: "超级管理员账号",
  },
  {
    id: 2,
    username: "teacher001",
    realName: "张教授",
    role: "teacher",
    department: "计算机科学与技术学院/软件工程系",
    email: "teacher001@example.com",
    phone: "13800138001",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    status: "active",
    createTime: "2024-01-02 10:00:00",
    lastLoginTime: "2024-03-14 14:20:00",
    lastLoginIp: "192.168.1.2",
    remark: "软件工程首席教授",
  },
  {
    id: 3,
    username: "teacher002",
    realName: "李副教授",
    role: "teacher",
    department: "计算机科学与技术学院/计算机科学系",
    email: "teacher002@example.com",
    phone: "13800138002",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    status: "active",
    createTime: "2024-01-03 11:00:00",
    lastLoginTime: "2024-03-15 08:15:00",
    lastLoginIp: "192.168.1.3",
    remark: "计算机科学系副教授",
  },
  {
    id: 4,
    username: "2024001",
    realName: "王小明",
    role: "student",
    department: "计算机科学与技术学院/软件工程系",
    email: "2024001@example.com",
    phone: "13800138003",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    status: "active",
    createTime: "2024-02-28 09:00:00",
    lastLoginTime: "2024-03-15 10:05:00",
    lastLoginIp: "192.168.1.4",
    remark: "2024级软件工程学生",
  },
  {
    id: 5,
    username: "2024002",
    realName: "李小红",
    role: "student",
    department: "计算机科学与技术学院/计算机科学系",
    email: "2024002@example.com",
    phone: "13800138004",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    status: "active",
    createTime: "2024-02-28 09:30:00",
    lastLoginTime: "2024-03-15 09:45:00",
    lastLoginIp: "192.168.1.5",
    remark: "2024级计算机科学学生",
  },
  {
    id: 6,
    username: "teacher003",
    realName: "王讲师",
    role: "teacher",
    department: "电子工程学院/通信工程系",
    email: "teacher003@example.com",
    phone: "13800138005",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    status: "disabled",
    createTime: "2024-01-04 14:00:00",
    lastLoginTime: "2024-03-01 16:30:00",
    lastLoginIp: "192.168.1.6",
    remark: "通信工程系讲师",
  },
  {
    id: 7,
    username: "2024003",
    realName: "张小华",
    role: "student",
    department: "电子工程学院/通信工程系",
    email: "2024003@example.com",
    phone: "13800138006",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    status: "active",
    createTime: "2024-02-28 10:00:00",
    lastLoginTime: "2024-03-15 11:20:00",
    lastLoginIp: "192.168.1.7",
    remark: "2024级通信工程学生",
  },
]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(userList.value.length);

// 搜索表单
const searchForm = ref({
  username: "",
  realName: "",
  role: "",
  department: "",
  status: "",
});

// 用户表单
const userForm = ref({
  username: "",
  realName: "",
  role: "",
  department: "",
  email: "",
  phone: "",
  avatar: "",
  password: "",
  remark: "",
});

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  department: [{ required: true, message: "请选择部门", trigger: "change" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
  ],
};

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const formRef = ref<FormInstance>();

// 角色对话框相关
const roleDialogVisible = ref(false);
const currentUser = ref<any>(null);
const roleForm = ref({
  roles: [],
});

// 获取角色类型
const getRoleType = (role: string) => {
  const map: Record<string, string> = {
    admin: "danger",
    teacher: "warning",
    student: "info",
  };
  return map[role] || "";
};

// 获取角色名称
// 修改后
const getRoleName = (roleValue: string) => {
  const role = roleOptions.find((item) => item.value === roleValue);
  return role?.label || roleValue;
};

// 搜索
const handleSearch = () => {
  // 实现搜索逻辑
};

// 重置
const handleReset = () => {
  searchForm.value = {
    username: "",
    realName: "",
    role: "",
    department: "",
    status: "",
  };
};

// 新增用户
const handleAdd = () => {
  dialogType.value = "add";
  userForm.value = {
    avatar: "",
    username: "",
    realName: "",
    password: "",
    role: "",
    department: "",
    email: "",
    phone: "",
    status: "active",
    remark: "",
  };
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: any) => {
  dialogType.value = "edit";
  userForm.value = { ...row };
  dialogVisible.value = true;
};

// 删除用户
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.realName}（${row.username}）吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // 实现删除逻辑
    ElMessage.success("删除成功");
  } catch {
    // 用户取消操作
  }
};

// 重置密码
const handleResetPwd = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 ${row.realName}（${row.username}）的密码吗？`,
      "重置确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // 实现重置密码逻辑
    ElMessage.success("密码重置成功");
  } catch {
    // 用户取消操作
  }
};

// 分配角色
const handleAssignRole = (row: any) => {
  currentUser.value = row;
  roleForm.value.roles = [row.role];
  roleDialogVisible.value = true;
};

// 提交角色分配
const handleRoleSubmit = () => {
  // 实现角色分配逻辑
  ElMessage.success("角色分配成功");
  roleDialogVisible.value = false;
};

// 状态变更
const handleStatusChange = (row: any, val: string) => {
  // 实现状态变更逻辑
  ElMessage.success(`状态已${val === "active" ? "启用" : "禁用"}`);
};

// 批量操作相关
const selectedUsers = ref<any[]>([]);

const handleSelectionChange = (val: any[]) => {
  selectedUsers.value = val;
};

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      "批量删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // 实现批量删除逻辑
    ElMessage.success("删除成功");
  } catch {
    // 用户取消操作
  }
};

const handleBatchEnable = () => {
  // 实现批量启用逻辑
};

const handleBatchDisable = () => {
  // 实现批量禁用逻辑
};

// 导入导出
const handleImport = () => {
  // 实现导入逻辑
};

const handleExport = () => {
  // 实现导出逻辑
};

// 头像上传
const beforeAvatarUpload: UploadProps["beforeUpload"] = (file) => {
  const isJPG = file.type === "image/jpeg";
  const isPNG = file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error("头像只能是 JPG 或 PNG 格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("头像大小不能超过 2MB!");
    return false;
  }
  return true;
};

const handleAvatarSuccess: UploadProps["onSuccess"] = (
  response,
  uploadFile
) => {
  userForm.value.avatar = URL.createObjectURL(uploadFile.raw!);
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  // 重新加载数据
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  // 重新加载数据
};

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid, fields) => {
    if (valid) {
      // 实现提交逻辑
      ElMessage.success(dialogType.value === "add" ? "添加成功" : "修改成功");
      dialogVisible.value = false;
    } else {
      console.log("error submit!", fields);
    }
  });
};
</script>

<style scoped lang="scss">
.user-manage {
  padding: 20px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .el-icon {
        font-size: 32px;

        &.text-primary {
          color: var(--el-color-primary);
        }
        &.text-success {
          color: var(--el-color-success);
        }
        &.text-warning {
          color: var(--el-color-warning);
        }
        &.text-info {
          color: var(--el-color-info);
        }
      }

      .stat-info {
        .stat-title {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--el-text-color-primary);
        }
      }
    }
  }

  .search-card {
    margin: 20px 0;
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .list-card {
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .info-content {
        .name {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .username {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .user-detail {
      padding: 20px;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
