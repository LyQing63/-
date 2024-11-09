// 课程类型
export type CourseType = "required" | "elective" | "public";

// 考核方式
export type ExamType = "exam" | "paper" | "design" | "report";

// 课程状态
export type CourseStatus = "not_started" | "in_progress" | "ended";

// 选课状态
export type SelectionStatus = "not_selected" | "selected" | "full" | "conflict";

// 课程基础信息接口
export interface CourseBase {
  id: number;
  name: string;
  code: string;
  type: CourseType;
  credit: number;
  hours: number;
  semester: string;
  description: string;
  prerequisites?: string[];
}

// 课程详细信息接口
export interface CourseInfo extends CourseBase {
  teacher: string;
  teacherId: string;
  teacherAvatar: string;
  department: string;
  capacity: number;
  enrolled: number;
  time: string;
  location: string;
  image: string;
  examType: ExamType;
  status: CourseStatus;
  syllabus?: string;
  materials?: CourseMaterial[];
  schedule?: CourseSchedule[];
}

// 课程资料接口
export interface CourseMaterial {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadTime: string;
  downloads: number;
}

// 课程安排接口
export interface CourseSchedule {
  week: number;
  content: string;
  assignment?: string;
}

// 选课记录接口
export interface CourseSelection {
  id: number;
  studentId: string;
  courseId: number;
  courseName: string;
  teacherName: string;
  selectTime: string;
  status: SelectionStatus;
  score?: number;
  grade?: string;
}

// 课程查询参数接口
export interface CourseQuery {
  keyword?: string;
  type?: CourseType;
  teacher?: string;
  department?: string;
  status?: CourseStatus;
  credit?: number;
  weekday?: number;
  timeSlot?: string;
  pageSize: number;
  current: number;
}

// 课程列表响应接口
export interface CourseListResponse {
  total: number;
  list: CourseInfo[];
}

// 课程统计信息接口
export interface CourseStats {
  totalCourses: number;
  requiredCourses: number;
  electiveCourses: number;
  publicCourses: number;
  averageCredit: number;
  totalStudents: number;
  departments: {
    name: string;
    count: number;
  }[];
}

// 选课冲突检查结果接口
export interface CourseConflictResult {
  hasConflict: boolean;
  conflictType?: "time" | "exam" | "prerequisite";
  conflictCourse?: {
    id: number;
    name: string;
    time: string;
  };
  message?: string;
}

// 课程评价接口
export interface CourseReview {
  id: number;
  courseId: number;
  studentId: string;
  studentName: string;
  rating: number;
  content: string;
  createTime: string;
  likes: number;
  anonymous: boolean;
}

// 课程成绩接口
export interface CourseGrade {
  id: number;
  courseId: number;
  courseName: string;
  studentId: string;
  studentName: string;
  usual: number;
  exam: number;
  total: number;
  grade: string;
  ranking: number;
  semester: string;
  updateTime: string;
}

// 课程时间表接口
export interface CourseTimeTable {
  weekday: number;
  section: number[];
  weeks: number[];
  location: string;
}

// 课程导出选项接口
export interface CourseExportOptions {
  format: "xlsx" | "pdf" | "csv";
  includeFields: string[];
  withGrades?: boolean;
  withStats?: boolean;
}

// 课程导入结果接口
export interface CourseImportResult {
  success: number;
  failed: number;
  errors: {
    row: number;
    message: string;
  }[];
  warnings: {
    row: number;
    message: string;
  }[];
}

// 常量枚举
export const CourseTypeMap = {
  required: "必修课",
  elective: "选修课",
  public: "公共课",
} as const;

export const ExamTypeMap = {
  exam: "考试",
  paper: "论文",
  design: "设计",
  report: "报告",
} as const;

export const CourseStatusMap = {
  not_started: "未开始",
  in_progress: "进行中",
  ended: "已结束",
} as const;

export const SelectionStatusMap = {
  not_selected: "未选",
  selected: "已选",
  full: "已满",
  conflict: "冲突",
} as const;

// 工具类型
export type CourseTypeKey = keyof typeof CourseTypeMap;
export type ExamTypeKey = keyof typeof ExamTypeMap;
export type CourseStatusKey = keyof typeof CourseStatusMap;
export type SelectionStatusKey = keyof typeof SelectionStatusMap;
