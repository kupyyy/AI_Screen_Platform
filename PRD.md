# AI大屏低代码平台 - 产品需求文档 (PRD)

## 一、项目概述

### 1.1 项目名称
AI大屏低代码平台 (AI Screen Low-Code Platform)

### 1.2 项目描述
一个基于 DSL 驱动的大屏可视化编辑器，支持拖拽编排、实时预览、动态表单配置，并集成 AI 能力实现组件级修改和整屏流式生成。

### 1.3 技术栈

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 前端框架 | React | 18.x | UI 框架 |
| 类型系统 | TypeScript | 5.x | 类型安全 |
| 构建工具 | Vite | 5.x | 开发/构建 |
| 状态管理 | Zustand | 4.x | 全局状态 |
| 状态中间件 | immer | 10.x | 不可变状态更新 |
| 样式方案 | TailwindCSS | 3.x | 原子化 CSS |
| 图表库 | ECharts | 5.x | 数据可视化 |
| 拖拽库 | @dnd-kit | 6.x | 列表→画布拖拽 |
| 拖拽/缩放 | react-rnd | 10.x | 画布内自由拖拽缩放 |
| 表单库 | form-render | 2.x | 动态表单生成 |
| 后端框架 | Express.js | 4.x | API 服务 |
| 数据库 | MongoDB | 7.x | 数据持久化 |
| AI 框架 | LangChain.js | latest | AI 编排 |
| AI 模型 | DeepSeek (OpenAI 兼容) | - | 大屏/组件生成 |
| 认证方案 | JWT (jsonwebtoken) | 9.x | 用户认证 |
| 密码加密 | bcryptjs | 2.x | 密码哈希 |

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (React + Vite)                 │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 组件面板  │  │ 画布编辑器│  │ 属性面板  │  │ AI面板  │ │
│  │(Component │  │(Canvas   │  │(Property │  │(AI      │ │
│  │  List)    │  │ Editor)  │  │  Panel)  │  │ Panel)  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │      │
│       └──────────────┴──────────────┴──────────────┘      │
│                          │                                │
│                    ┌─────┴─────┐                          │
│                    │  DSL 引擎  │                          │
│                    │ (渲染/编辑) │                          │
│                    └─────┬─────┘                          │
│                          │                                │
│                    ┌─────┴─────┐                          │
│                    │ Zustand    │                          │
│                    │ 状态管理    │                          │
│                    └───────────┘                          │
└─────────────────────────────┬───────────────────────────┘
                              │ HTTP / SSE
┌─────────────────────────────┴───────────────────────────┐
│                    后端 (Express.js)                      │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 项目 API  │  │ 组件 API  │  │ AI 服务   │              │
│  │(CRUD)    │  │(Registry)│  │(LangChain)│              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│       └──────────────┴──────────────┘                    │
│                      │                                   │
│                ┌─────┴─────┐                             │
│                │  MongoDB   │                             │
│                │  数据存储   │                             │
│                └───────────┘                             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 项目目录结构

```
AI_Screen_LowCode_Platform/
├── client/                        # 前端项目
│   ├── src/
│   │   ├── components/            # 通用组件
│   │   │   ├── common/            # 基础 UI 组件
│   │   │   └── business/          # 业务组件
│   │   ├── core/                  # 核心引擎
│   │   │   ├── DSL/               # DSL 定义与解析
│   │   │   ├── RenderEngine/      # 渲染引擎
│   │   │   │   ├── EditRenderer.tsx    # 编辑模式渲染器
│   │   │   │   ├── PreviewRenderer.tsx # 预览模式渲染器
│   │   │   │   └── RendererFactory.ts  # 渲染器工厂
│   │   │   ├── DragSystem/        # 拖拽系统
│   │   │   │   ├── DragOverlay.tsx     # 拖拽预览
│   │   │   │   ├── CanvasDrop.tsx      # 画布放置区
│   │   │   │   └── useDragAlign.ts     # 对齐吸附 Hook
│   │   │   └── FormEngine/        # 表单引擎
│   │   │       ├── FormRenderer.tsx    # 动态表单
│   │   │       └── SchemaRegistry.ts   # Schema 注册表
│   │   ├── components-library/    # 大屏组件库
│   │   │   ├── ChartBar/          # 柱状图
│   │   │   ├── ChartLine/         # 折线图
│   │   │   ├── ChartPie/          # 饼图
│   │   │   ├── Text/              # 文本
│   │   │   ├── Image/             # 图片
│   │   │   ├── Table/             # 表格
│   │   │   └── index.ts           # 组件注册入口
│   │   ├── pages/
│   │   │   ├── Login/             # 登录页
│   │   │   │   └── index.tsx
│   │   │   ├── Register/          # 注册页
│   │   │   │   └── index.tsx
│   │   │   ├── Profile/           # 个人中心
│   │   │   │   └── index.tsx
│   │   │   ├── Editor/            # 编辑器页面
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ComponentPanel.tsx   # 左侧组件面板
│   │   │   │   ├── Canvas.tsx           # 中间画布
│   │   │   │   ├── PropertyPanel.tsx    # 右侧属性面板
│   │   │   │   └── AIPanel.tsx          # AI 助手面板
│   │   │   ├── Preview/           # 预览页面
│   │   │   └── Dashboard/         # 项目管理页
│   │   ├── stores/                # Zustand 状态
│   │   │   ├── editorStore.ts     # 编辑器状态
│   │   │   ├── componentStore.ts  # 组件状态
│   │   │   ├── projectStore.ts    # 项目状态
│   │   │   ├── authStore.ts       # 用户认证状态
│   │   │   └── themeStore.ts      # 主题状态
│   │   ├── hooks/                 # 自定义 Hooks
│   │   │   ├── useScale.ts        # 缩放 Hook
│   │   │   ├── useGrid.ts         # 网格 Hook
│   │   │   └── useSSE.ts          # SSE 流式 Hook
│   │   ├── services/              # API 调用
│   │   ├── types/                 # 类型定义
│   │   │   ├── DSL.ts             # DSL 类型
│   │   │   ├── Component.ts       # 组件类型
│   │   │   └── Project.ts         # 项目类型
│   │   ├── utils/                 # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                        # 后端项目
│   ├── src/
│   │   ├── routes/                # 路由
│   │   │   ├── project.ts         # 项目 CRUD
│   │   │   ├── component.ts       # 组件注册表
│   │   │   ├── ai.ts              # AI 服务
│   │   │   ├── auth.ts            # 认证接口
│   │   │   └── user.ts            # 用户管理
│   │   ├── models/                # 数据模型
│   │   │   ├── Project.ts
│   │   │   ├── Component.ts
│   │   │   └── User.ts
│   │   ├── services/              # 业务逻辑
│   │   │   ├── AIService.ts       # LangChain 服务
│   │   │   └── DSLService.ts      # DSL 处理
│   │   ├── middlewares/           # 中间件
│   │   └── app.ts                 # Express 入口
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                        # 前后端共享类型
│   ├── DSL.ts
│   └── types.ts
│
└── PRD.md                         # 本文档
```

---

## 三、功能模块详细需求

### 模块 1：DSL 渲染引擎

#### 1.1 需求描述
设计一套 JSON DSL 格式，描述大屏的组件树、布局、样式、数据绑定。渲染引擎根据 DSL 在编辑/预览两种模式下渲染组件。

#### 1.2 DSL Schema 定义

```typescript
// 大屏 DSL 根节点
interface ScreenDSL {
  version: "1.0";
  screen: {
    width: number;           // 画布宽度 (固定 1920)
    height: number;          // 画布高度 (固定 1080)
    backgroundColor: string; // 背景色
    backgroundImage?: string; // 背景图
  };
  componentMap: { [id: string]: DSLComponent }; // 扁平 Map 存储所有组件
  rootComponentIds: string[]; // 根层级组件 ID 列表
}

// 组件节点 - 扁平结构，父子关系通过 ID 引用
interface DSLComponent {
  id: string;                // 唯一 ID (uuid)
  type: string;              // 组件类型 (如 "chart-bar", "text", "container")
  name: string;              // 组件显示名称
  parentId: string | null;   // 父组件 ID，null 表示根层级
  childIds: string[];        // 子组件 ID 列表（有序）
  position: {
    x: number;               // X 坐标 (px)
    y: number;               // Y 坐标 (px)
    width: number;            // 宽度
    height: number;           // 高度
    zIndex: number;           // 层级
  };
  props: Record<string, any>; // 组件属性 (由 JSON Schema 定义)
  dataBinding?: {            // 数据绑定 (可选)
    type: "static" | "api" | "websocket";
    config: Record<string, any>;
  };
}
```

#### 1.3 渲染引擎设计

| 特性 | 说明 |
|------|------|
| 装饰器模式 | `withEditMode(HOC)` 和 `withPreviewMode(HOC)` 两个高阶组件，分别包裹组件实现编辑态（选中框、拖拽手柄）和预览态（纯净渲染）|
| 组件注册表 | `ComponentRegistry` 单例，注册 `type → ReactComponent` 映射，运行时根据 DSL 的 `type` 字段动态解析 |
| 递归渲染 | 渲染器递归遍历 `components` 树，深度无限制 |
| 热更新 | 编辑器中修改 props 后，仅重新渲染受影响的组件（React.memo + 精确 key）|

#### 1.4 验收标准
- [ ] DSL JSON 可描述任意嵌套深度的组件树
- [ ] 编辑模式下组件可选中、显示边框和拖拽手柄
- [ ] 预览模式下纯净渲染，无编辑态 UI
- [ ] 修改组件 props 后 ≤ 16ms 内完成重新渲染

---

### 模块 2：高性能拖拽系统

#### 2.1 需求描述
实现两层拖拽能力：① 组件列表 → 画布的拖拽放置；② 画布内组件的自由移动和缩放。

#### 2.2 功能清单

| 功能 | 技术方案 | 说明 |
|------|---------|------|
| 列表→画布拖拽 | @dnd-kit | 左侧组件面板中拖拽组件项，放置到画布上，自动生成 DSL 节点 |
| 画布内移动 | react-rnd | 画布内的组件可自由拖拽移动位置 |
| 画布内缩放 | react-rnd | 8 个方向缩放手柄，支持等比缩放 |
| 拖拽预览 | @dnd-kit DragOverlay | 拖拽过程中显示组件缩略预览 |
| 网格吸附 | 自定义逻辑 | 拖拽/缩放时按网格间距（默认 10px）吸附 |
| 基准线对齐 | 自定义逻辑 | 拖拽时与其他组件边缘高亮基准线，松手后自动对齐 |
| 层级管理 | zIndex 控制 | 支持置顶/置底/上移/下移 |

#### 2.3 对齐吸附算法

```
当组件 A 拖拽到位置 (x, y) 时:
1. 遍历画布中所有其他组件的边缘坐标 (left, right, top, bottom, centerX, centerY)
2. 计算 A 的四边 + 中心线与其他组件的距离
3. 若距离 < 阈值 (如 5px)，则吸附到该位置并高亮基准线
4. 同时检查网格吸附点，取最近的吸附结果
```

#### 2.4 验收标准
- [ ] 从组件面板拖拽到画布，松手后组件出现在正确位置
- [ ] 画布内组件可自由拖拽移动
- [ ] 画布内组件支持 8 方向缩放
- [ ] 拖拽时显示网格吸附和基准线
- [ ] 拖拽过程流畅，≥ 60fps

---

### 模块 3：动态表单引擎

#### 3.1 需求描述
基于 form-render + JSON Schema，实现零配置的组件属性编辑表单。每个组件在注册时提供其 props 的 JSON Schema，表单引擎自动生成编辑界面。

#### 3.2 设计方案

```typescript
// 组件元数据注册
interface ComponentMeta {
  type: string;              // 组件类型标识
  name: string;              // 显示名称
  icon: string;              // 图标
  category: string;          // 分类 (如 "图表", "文字", "装饰")
  defaultProps: Record<string, any>;  // 默认属性
  schema: JSONSchema7;       // JSON Schema (用于生成表单)
  component: React.ComponentType; // 实际 React 组件
}

// 注册示例
registerComponent({
  type: "chart-bar",
  name: "柱状图",
  icon: "BarChart",
  category: "图表",
  defaultProps: { title: "", data: [], color: "#1890ff" },
  schema: {
    type: "object",
    properties: {
      title: { type: "string", title: "标题" },
      color: { type: "string", title: "颜色", format: "color" },
      data: {
        type: "array",
        title: "数据",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            value: { type: "number" }
          }
        }
      }
    }
  },
  component: ChartBar
});
```

#### 3.3 表单联动

| 能力 | 说明 |
|------|------|
| 实时预览 | 表单修改即时反映到画布组件（受控组件 + Zustand） |
| 字段联动 | 通过 JSON Schema 的 `dependencies` / `if-then` 实现条件显隐 |
| 自定义控件 | 颜色选择器、数据编辑器、图片上传等可通过 form-render 的 `widgets` 扩展 |
| 撤销/重做 | 表单修改纳入编辑器的 undo/redo 栈 |

#### 3.4 验收标准
- [ ] 注册新组件只需提供 JSON Schema，无需手写表单
- [ ] 表单修改实时反映到画布
- [ ] 支持颜色选择器、数组编辑等自定义控件
- [ ] 表单修改支持撤销/重做

---

### 模块 4：画布编排与缩放系统

#### 4.1 需求描述
实现大屏画布的背景网格、响应式缩放、自适应/手动缩放切换。

#### 4.2 功能清单

| 功能 | 说明 |
|------|------|
| 网格点阵背景 | 画布背景显示可调间距的点阵网格，辅助对齐 |
| 响应式缩放 | 使用 ResizeObserver 监听容器变化，自动计算缩放比例 |
| 缩放模式 | 支持"自适应"（fit to container）和"手动缩放"（百分比/滚轮）两种模式无缝切换 |
| 缩放控制 | 工具栏显示缩放百分比，支持 25%~400% 缩放范围 |
| 滚轮缩放 | Ctrl+滚轮缩放画布，普通滚轮平移 |

#### 4.3 缩放 Hook 设计

```typescript
function useScale(containerRef: RefObject<HTMLDivElement>, canvasSize: { width: number; height: number }) {
  // 返回值
  return {
    scale: number,           // 当前缩放比例
    mode: "auto" | "manual", // 缩放模式
    setScale: (s: number) => void, // 手动设置缩放
    setMode: (m: "auto" | "manual") => void,
    transformStyle: CSSProperties, // 应用到画布的 transform 样式
  };
}
```

#### 4.4 验收标准
- [ ] 画布背景显示点阵网格
- [ ] 容器大小变化时画布自适应缩放
- [ ] Ctrl+滚轮可手动缩放
- [ ] 缩放 25%~400% 范围内渲染清晰
- [ ] 编辑模式和预览模式缩放行为一致

---

### 模块 5：AI 流式生成大屏

#### 5.1 需求描述
集成 LangChain.js + DeepSeek，通过 Agent + Tool Calling 模式实现：① AI 修改特定组件；② AI 整屏生成。采用 SSE 流式返回，边生成边预览。

#### 5.2 功能清单

| 功能 | 说明 |
|------|------|
| AI 修改组件 | 选中组件后，输入自然语言指令（如"把标题改成红色"），AI 通过 Tool Calling 修改对应 DSL 节点 |
| AI 生成整屏 | 输入描述（如"生成一个销售数据大屏"），AI 逐步生成组件并流式添加到画布 |
| SSE 流式 | 后端通过 SSE 逐个发送生成的组件 DSL，前端逐步渲染 |
| 取消机制 | 用户可随时点击取消，通过 AbortController 中断请求，避免 token 浪费 |
| 上下文感知 | AI 能感知当前画布已有组件，避免重复生成 |

#### 5.3 AI Agent 设计

```
用户输入: "给这个柱状图加一个标题" 或 "生成一个实时监控大屏"
         │
         ▼
┌─────────────────────────┐
│   LangChain Agent       │
│   (DeepSeek 模型)        │
│                         │
│   Tools:                │
│   - addComponent        │   → 添加组件到 DSL
│   - modifyComponent     │   → 修改已有组件属性
│   - removeComponent     │   → 删除组件
│   - getCanvasContext     │   → 获取当前画布 DSL
│   - setScreenConfig      │   → 设置大屏配置
│                         │
└──────────┬──────────────┘
           │ SSE Stream
           ▼
┌─────────────────────────┐
│   前端 SSE 消费者         │
│                         │
│   - 解析 Tool Call 结果   │
│   - 逐个渲染新组件        │
│   - 更新 Zustand 状态     │
│   - 显示生成进度          │
└─────────────────────────┘
```

#### 5.4 Tool Calling 定义

```typescript
// addComponent Tool
{
  name: "addComponent",
  description: "向画布添加一个新组件",
  parameters: {
    type: "object",
    properties: {
      componentType: { type: "string", description: "组件类型，如 chart-bar, text, image" },
      position: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" }
        }
      },
      props: { type: "object", description: "组件属性" }
    }
  }
}

// modifyComponent Tool
{
  name: "modifyComponent",
  description: "修改已有组件的属性",
  parameters: {
    type: "object",
    properties: {
      componentId: { type: "string" },
      props: { type: "object", description: "要修改的属性（合并更新）" }
    }
  }
}
```

#### 5.5 SSE 通信协议

```
// 前端 → 后端: POST /api/ai/generate
// Body: { prompt: string, currentDSL?: ScreenDSL, mode: "modify" | "generate" }

// 后端 → 前端: SSE 事件流
event: tool_call
data: { "tool": "addComponent", "args": { ... }, "componentId": "uuid-1" }

event: tool_call
data: { "tool": "addComponent", "args": { ... }, "componentId": "uuid-2" }

event: done
data: { "message": "生成完成，共添加 2 个组件" }

event: error
data: { "message": "生成失败: ..." }
```

#### 5.6 验收标准
- [ ] 选中组件后输入指令，AI 可正确修改该组件属性
- [ ] 输入描述后 AI 可生成完整大屏布局
- [ ] 生成过程 SSE 流式推送，组件逐个出现
- [ ] 点击取消按钮可中断生成，后续不再消耗 token
- [ ] AI 能感知当前画布上下文

---

### 模块 6：后端服务

#### 6.1 需求描述
Express.js 后端，提供项目 CRUD、组件注册表、AI 服务三大模块。

#### 6.2 API 设计

##### 项目管理
| Method | Path | 说明 |
|--------|------|------|
| GET | /api/projects | 获取项目列表 |
| POST | /api/projects | 创建项目 |
| GET | /api/projects/:id | 获取项目详情（含 DSL） |
| PUT | /api/projects/:id | 更新项目（保存 DSL） |
| DELETE | /api/projects/:id | 删除项目 |

##### 组件注册表
| Method | Path | 说明 |
|--------|------|------|
| GET | /api/components | 获取所有注册组件的元数据 |
| GET | /api/components/:type | 获取单个组件的 schema |

##### AI 服务
| Method | Path | 说明 |
|--------|------|------|
| POST | /api/ai/generate | SSE 流式生成大屏 |
| POST | /api/ai/modify | SSE 流式修改组件 |
| POST | /api/ai/cancel/:requestId | 取消正在进行的生成 |

#### 6.3 数据模型 (MongoDB)

```typescript
// Project 文档
interface ProjectDocument {
  _id: ObjectId;
  name: string;
  description?: string;
  dsl: ScreenDSL;            // 完整 DSL
  thumbnail?: string;        // 缩略图 base64
  createdAt: Date;
  updatedAt: Date;
}
```

#### 6.4 验收标准
- [ ] 项目 CRUD 接口正常工作
- [ ] DSL 数据可正确存储和读取
- [ ] AI 接口支持 SSE 流式返回
- [ ] 支持取消正在进行的 AI 请求

---

### 模块 7：用户认证系统

#### 7.1 需求描述
基于 JWT Token 实现用户认证，支持完整的用户管理功能。项目与用户绑定，每个用户只能管理自己的项目。

#### 7.2 功能清单

| 功能 | 说明 |
|------|------|
| 用户注册 | 邮箱 + 用户名 + 密码注册，密码 bcrypt 加密存储 |
| 用户登录 | 邮箱 + 密码登录，返回 JWT Token |
| Token 刷新 | Token 过期前自动刷新，无需重新登录 |
| 个人中心 | 修改头像、修改密码、查看账号信息 |
| 路由守卫 | 未登录用户自动跳转登录页 |
| 项目隔离 | 项目与用户绑定，API 层校验项目归属 |

#### 7.3 认证流程

```
┌──────────┐     POST /api/auth/login      ┌──────────┐
│  前端     │ ──────────────────────────── → │  后端     │
│          │  { email, password }           │          │
│          │                                │ bcrypt   │
│          │ ← ───────────────────────────── │ 验证密码  │
│          │  { accessToken, refreshToken } │          │
│          │                                │          │
│ 存储Token │     请求 API (Header:          │ 验证Token │
│ localStorage│  Authorization: Bearer xxx) │          │
└──────────┘ ──────────────────────────── → └──────────┘
```

#### 7.4 API 设计

##### 认证接口
| Method | Path | 说明 |
|--------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/refresh | 刷新 Token |
| GET | /api/auth/me | 获取当前用户信息 |

##### 用户管理接口
| Method | Path | 说明 |
|--------|------|------|
| PUT | /api/user/profile | 更新个人信息（头像、昵称） |
| PUT | /api/user/password | 修改密码 |
| POST | /api/user/avatar | 上传头像 |

#### 7.5 数据模型 (MongoDB)

```typescript
// User 文档
interface UserDocument {
  _id: ObjectId;
  username: string;          // 用户名
  email: string;             // 邮箱（唯一）
  password: string;          // bcrypt 加密后的密码
  avatar?: string;           // 头像 URL
  createdAt: Date;
  updatedAt: Date;
}

// Project 文档增加 user 关联
interface ProjectDocument {
  _id: ObjectId;
  userId: ObjectId;          // 关联用户（新增）
  name: string;
  description?: string;
  dsl: ScreenDSL;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 7.6 中间件设计

```typescript
// JWT 认证中间件
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "未登录" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Token 已过期" });
  }
}

// 项目归属校验中间件
function projectOwnerMiddleware(req, res, next) {
  const project = await Project.findById(req.params.id);
  if (!project || project.userId.toString() !== req.userId) {
    return res.status(403).json({ message: "无权访问" });
  }
  req.project = project;
  next();
}
```

#### 7.7 验收标准
- [ ] 用户可正常注册和登录
- [ ] 密码 bcrypt 加密存储
- [ ] JWT Token 过期后自动刷新
- [ ] 未登录用户访问编辑器自动跳转登录页
- [ ] 用户只能看到和操作自己的项目
- [ ] 个人中心可修改头像和密码

---

### 模块 8：主题系统

#### 8.1 需求描述
支持编辑器 UI 的亮色/暗色主题切换，用户偏好持久化到 localStorage。

#### 8.2 技术方案

| 方案 | 说明 |
|------|------|
| TailwindCSS dark mode | 使用 `class` 策略，通过切换 `<html>` 的 `dark` class 实现 |
| CSS 变量 | 定义主题色变量（如 `--bg-primary`），主题切换时批量更新 |
| Zustand 持久化 | 主题偏好存储在 Zustand store，通过 `persist` 中间件同步到 localStorage |

#### 8.3 主题配色定义

```typescript
interface ThemeColors {
  // 背景色
  bgPrimary: string;       // 主背景
  bgSecondary: string;     // 次背景（面板）
  bgTertiary: string;      // 三级背景（卡片、输入框）

  // 文字色
  textPrimary: string;     // 主文字
  textSecondary: string;   // 次文字
  textTertiary: string;    // 辅助文字

  // 边框色
  borderPrimary: string;
  borderSecondary: string;

  // 强调色
  accent: string;          // 主色调
  accentHover: string;

  // 状态色
  success: string;
  warning: string;
  error: string;
}

const lightTheme: ThemeColors = {
  bgPrimary: "#ffffff",
  bgSecondary: "#f5f5f5",
  bgTertiary: "#ffffff",
  textPrimary: "#1a1a1a",
  textSecondary: "#666666",
  textTertiary: "#999999",
  borderPrimary: "#e5e5e5",
  borderSecondary: "#d9d9d9",
  accent: "#1890ff",
  accentHover: "#40a9ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
};

const darkTheme: ThemeColors = {
  bgPrimary: "#141414",
  bgSecondary: "#1f1f1f",
  bgTertiary: "#262626",
  textPrimary: "#ffffff",
  textSecondary: "#a6a6a6",
  textTertiary: "#737373",
  borderPrimary: "#303030",
  borderSecondary: "#404040",
  accent: "#1890ff",
  accentHover: "#40a9ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
};
```

#### 8.4 Zustand Store

```typescript
interface ThemeStore {
  theme: "light" | "dark";
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}
```

#### 8.5 验收标准
- [ ] 编辑器右上角有主题切换按钮
- [ ] 点击切换亮色/暗色主题，过渡动画流畅
- [ ] 主题偏好刷新后保持
- [ ] 所有 UI 组件适配两种主题

---

## 四、技术实现要点

### 4.1 状态管理 (Zustand)

```typescript
// zustand + immer 原子化订阅设计

// 组件扁平 Map 结构
interface ComponentMap {
  [id: string]: DSLComponent;
}

interface EditorStore {
  // 画布状态
  mode: "edit" | "preview";
  scale: number;
  scaleMode: "auto" | "manual";
  gridSize: number;
  showGrid: boolean;

  // 组件状态 - 扁平 Map 结构
  componentMap: ComponentMap;       // 所有组件的扁平存储
  rootComponentIds: string[];       // 根层级组件 ID 列表（渲染顺序）
  selectedId: string | null;
  clipboard: DSLComponent | null;

  // 历史记录
  history: ComponentMap[];
  historyIndex: number;

  // Actions
  addComponent: (comp: DSLComponent, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<DSLComponent>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (id: string, position: Partial<Position>) => void;
  moveComponentOrder: (id: string, direction: "up" | "down" | "top" | "bottom") => void;
  undo: () => void;
  redo: () => void;
}

// 使用 zustand + immer 实现原子化订阅
// import { create } from 'zustand';
// import { immer } from 'zustand/middleware/immer';
//
// const useEditorStore = create(
//   immer((set) => ({
//     componentMap: {},
//     rootComponentIds: [],
//     // 修改某个组件时，immer 只替换该节点的引用
//     // 配合 selector 只触发该组件的 re-render
//     updateComponent: (id, updates) =>
//       set((state) => {
//         Object.assign(state.componentMap[id], updates);
//       }),
//   }))
// );
//
// 组件级订阅示例：
// const props = useEditorStore((state) => state.componentMap[id].props);

interface AuthStore {
  // 用户状态
  user: { id: string; username: string; email: string; avatar?: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (data: { username?: string; avatar?: string }) => Promise<void>;
}

interface ThemeStore {
  // 主题状态
  theme: "light" | "dark";
  colors: ThemeColors;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}
```

### 4.2 组件扁平化存储设计

采用 `componentMap`（以 ID 为 key 的扁平 Map）+ `rootComponentIds`（根层级列表）的结构：

**优势：**
| 场景 | 传统嵌套结构 | 扁平 Map 结构 |
|------|-------------|--------------|
| 修改深层组件 | 需遍历树找到节点，更新整条路径 | `componentMap[id]` 直接定位 |
| 更新触发范围 | 树根节点变化，所有子组件 re-render | 仅被修改的组件 re-render |
| 删除组件 | 递归删除子树 | 遍历 `childIds` 级联删除 |
| 序列化/反序列化 | 深拷贝开销大 | 浅拷贝 Map 即可 |

**zustand + immer 原子化订阅：**
```typescript
// 组件订阅自身数据，修改时只有该组件 re-render
const ComponentView = ({ id }: { id: string }) => {
  const props = useEditorStore((state) => state.componentMap[id].props);
  const position = useEditorStore((state) => state.componentMap[id].position);
  // ...渲染
};
```

### 4.3 关键性能指标

| 指标 | 目标值 |
|------|--------|
| 画布渲染 100 个组件 | ≤ 100ms |
| 拖拽帧率 | ≥ 60fps |
| 属性修改到视图更新 | ≤ 16ms |
| AI 首个组件到达时间 | ≤ 2s |
| 页面首屏加载 | ≤ 1.5s |
| 修改深层组件触发 re-render | 仅 1 个组件 |

---

## 五、开发阶段规划

### Phase 1：基础框架搭建
- [ ] 项目初始化（Vite + React + TS + TailwindCSS）
- [ ] 后端初始化（Express + MongoDB）
- [ ] 用户认证系统（JWT + 注册/登录/个人中心）
- [ ] 基础布局（三栏编辑器布局）
- [ ] 主题系统（亮色/暗色切换）
- [ ] Zustand 状态管理搭建
- [ ] DSL 类型定义与基础渲染引擎

### Phase 2：核心编辑能力
- [ ] 组件注册表与组件库（柱状图、折线图、饼图、文本、图片、表格）
- [ ] @dnd-kit 列表→画布拖拽
- [ ] react-rnd 画布内拖拽缩放
- [ ] 动态表单引擎（form-render + JSON Schema）
- [ ] 数据绑定（静态数据 + API 数据源 + WebSocket 实时数据）
- [ ] 撤销/重做

### Phase 3：画布增强
- [ ] 网格点阵背景
- [ ] 对齐基准线与吸附
- [ ] 响应式缩放 Hook
- [ ] 层级管理

### Phase 4：AI 能力集成
- [ ] LangChain.js + DeepSeek 接入
- [ ] Agent + Tool Calling 实现
- [ ] SSE 流式生成
- [ ] 取消机制 (AbortController)
- [ ] AI 修改组件

### Phase 5：后端 & 数据持久化
- [ ] 项目 CRUD API
- [ ] MongoDB 数据模型
- [ ] 项目保存/加载

### Phase 6：优化与完善
- [ ] 性能优化（虚拟化、memo、懒加载）
- [ ] 预览模式与全屏预览
- [ ] 导出功能（导出 DSL JSON）
- [ ] 键盘快捷键

---

## 六、待确认问题

> 请逐条确认或调整，我将根据你的反馈更新 PRD 并开始编码。

1. ~~**AI 模型选择**：DeepSeek 作为默认模型，是否需要支持切换到其他 OpenAI 兼容模型（如 GPT-4o、Claude）？~~ → **已确认：仅使用 DeepSeek，不需要支持模型切换**

2. ~~**组件库范围**：Phase 2 先实现哪些组件？建议：柱状图、折线图、饼图、文本、图片、表格，共 6 个基础组件，是否合适？~~ → **已确认：先实现 6 个基础组件（柱状图、折线图、饼图、文本、图片、表格）**

3. ~~**数据绑定**：是否需要在 Phase 2 就支持 API/WebSocket 数据源绑定，还是先只支持静态数据，数据绑定放到后续版本？~~ → **已确认：Phase 2 即实现数据绑定（静态 + API + WebSocket）**

4. ~~**用户系统**：是否需要登录/权限系统？还是先做单用户本地版本？~~ → **已确认：需要登录系统（JWT Token + 完整用户管理：注册/登录/个人中心/修改密码/头像）**

5. ~~**部署方式**：开发阶段本地运行即可，是否需要考虑 Docker 部署方案？~~ → **已确认：开发阶段本地运行，暂不考虑 Docker**

6. ~~**画布尺寸**：默认画布 1920x1080，是否需要支持其他预设尺寸（如 2560x1440、3840x2160）？~~ → **已确认：固定 1920x1080，不需要其他预设尺寸**

7. ~~**撤销/重做**：历史栈深度默认 50 步，是否合适？~~ → **已确认：默认 50 步**

8. ~~**AI 生成的 token 预算**：是否需要设置单次生成的最大 token 限制？~~ → **已确认：不限制 token 预算**

9. ~~**组件嵌套**：是否需要支持组件嵌套（如容器组件内放子组件），还是所有组件平铺在同一层级？~~ → **已确认：支持嵌套，扁平 Map 结构存储，zustand + immer 原子化订阅**

10. ~~**主题/样式**：编辑器 UI 本身是否需要暗色/亮色主题切换？~~ → **已确认：需要亮色/暗色主题切换**
