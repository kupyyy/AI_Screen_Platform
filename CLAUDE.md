# CLAUDE.md

## 项目概述
AI 大屏低代码平台 —— 基于 DSL 驱动的可视化编辑器，支持拖拽编排、实时预览、动态表单配置、AI 流式生成大屏。

## 技术栈

### 前端 (client/)
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型系统 |
| Vite | 5.x | 构建工具 |
| Zustand | 4.x | 状态管理 |
| immer | 10.x | 不可变更新 |
| TailwindCSS | 3.x | 样式方案 |
| ECharts | 5.x | 图表 |
| @dnd-kit | 6.x | 拖拽 |
| react-rnd | 10.x | 拖拽缩放 |
| form-render | 2.x | 动态表单 |
| axios | 1.x | HTTP 请求 |

### 后端 (server/)
| 技术 | 版本 | 说明 |
|------|------|------|
| Express.js | 4.x | Web 框架 |
| MongoDB | 7.x | 数据库 |
| Mongoose | 8.x | ODM |
| JWT | 9.x | 认证 |
| bcryptjs | 2.x | 密码加密 |
| LangChain.js | latest | AI 编排 |

## 命令

### 前端
```bash
cd client
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 (默认 http://localhost:5173)
pnpm build            # 构建生产版本
pnpm preview          # 预览构建结果
pnpm lint             # ESLint 检查
pnpm type-check       # TypeScript 类型检查
```

### 后端
```bash
cd server
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 (默认 http://localhost:3000)
pnpm build            # 编译 TypeScript
pnpm start            # 运行编译后的代码
```

## 项目结构

```
AI_Screen_LowCode_Platform/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── components/        # 通用 UI 组件
│   │   ├── core/              # 核心引擎 (DSL、渲染、拖拽、表单)
│   │   ├── components-library/# 大屏组件库 (chart-bar, text, etc.)
│   │   ├── pages/             # 页面 (Editor, Preview, Login, etc.)
│   │   ├── stores/            # Zustand 状态管理
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── services/          # API 调用层
│   │   ├── types/             # TypeScript 类型定义
│   │   └── utils/             # 工具函数
│   └── public/
├── server/                    # 后端项目
│   └── src/
│       ├── routes/            # 路由
│       ├── models/            # Mongoose 数据模型
│       ├── services/          # 业务逻辑
│       └── middlewares/       # 中间件
├── shared/                    # 前后端共享类型
└── CLAUDE.md
```

## 代码规范

### 命名规范
- **文件/文件夹**: kebab-case（`editor-store.ts`、`chart-bar/`）
- **React 组件**: PascalCase（`ChartBar`、`PropertyPanel`）
- **变量/函数**: camelCase（`addComponent`、`selectedId`）
- **常量**: UPPER_SNAKE_CASE（`JWT_SECRET`、`MAX_HISTORY`）
- **类型/接口**: PascalCase，接口以 `I` 开头或直接命名（`DSLComponent`、`AuthStore`）
- **Zustand Store**: 以 `Store` 结尾（`editorStore`、`authStore`）

### TypeScript 规范
- 禁止使用 `any`，必须定义具体类型
- 优先使用 `interface` 而非 `type`（除非需要联合类型或工具类型）
- Props 必须单独定义接口，不内联
- 函数必须标注返回值类型

```typescript
// ✅ 正确
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  // ...
};

// ❌ 错误
const Button = ({ label, onClick, disabled }: any) => {
  // ...
};
```

### React 规范
- 函数组件 + Hooks，禁止 class 组件
- 组件文件结构：types → hooks → constants → component → export
- 使用 `React.memo` 包裹高频更新的组件
- 使用 `useCallback` / `useMemo` 避免不必要的重渲染

### Zustand + immer 规范
- Store 使用 `create` + `immer` 中间件
- 组件通过 selector 订阅最小粒度的状态
- 修改状态时直接 mutate，immer 自动处理不可变更新

```typescript
// ✅ 正确 - 原子化订阅
const props = useEditorStore((state) => state.componentMap[id].props);

// ❌ 错误 - 订阅整个 store
const store = useEditorStore();
```

### CSS / TailwindCSS 规范
- 优先使用 TailwindCSS 类名
- 复杂样式使用 `@apply` 抽取到 CSS 文件
- 主题相关颜色使用 CSS 变量（`var(--bg-primary)`）
- 避免内联 style，除非是动态计算值

### API 规范
- RESTful 风格
- 统一返回格式：`{ code: number, data: T, message: string }`
- 认证接口：Header `Authorization: Bearer <token>`
- 错误状态码：400 参数错误、401 未认证、403 无权限、404 不存在、500 服务端错误

### 组件库注册规范
每个大屏组件必须包含以下文件：
```
components-library/
└── chart-bar/
    ├── index.tsx          # 组件实现
    ├── meta.ts            # 元数据 (type, name, icon, category)
    ├── schema.ts          # JSON Schema (用于生成表单)
    ├── default-props.ts   # 默认属性
    └── types.ts           # 类型定义
```

## 架构约束

### DSL 结构
- 组件采用**扁平 Map** 存储（`componentMap: { [id]: DSLComponent }`）
- 父子关系通过 `parentId` / `childIds` 引用，禁止嵌套
- 根层级组件维护在 `rootComponentIds` 数组中

### 渲染引擎
- 编辑模式：`withEditMode` HOC 包裹，显示选中框和拖拽手柄
- 预览模式：`withPreviewMode` HOC 包裹，纯净渲染
- 组件注册表：`ComponentRegistry` 单例，`type → ReactComponent` 映射

### 拖拽系统
- 列表 → 画布：使用 @dnd-kit
- 画布内移动/缩放：使用 react-rnd
- 网格吸附：默认 10px 间距
- 对齐基准线：阈值 5px 内触发吸附

### 状态管理
- `editorStore`: 画布状态、组件数据、历史记录
- `authStore`: 用户认证、Token 管理
- `themeStore`: 主题切换（亮色/暗色）
- `projectStore`: 项目 CRUD 状态

### AI 服务
- 仅使用 DeepSeek 模型（OpenAI 兼容接口）
- Agent + Tool Calling 模式
- SSE 流式返回，前端逐步渲染
- AbortController 取消机制

## 画布规格
- 默认尺寸：1920 x 1080
- 缩放范围：25% ~ 400%
- 撤销/重做：50 步历史栈

## 主题系统
- TailwindCSS `class` 策略实现暗色模式
- 主题偏好持久化到 localStorage
- 编辑器和预览页面均支持主题切换

## 注意事项
- 使用 pnpm 作为包管理器，禁止 npm/yarn
- 所有 API 请求通过 services/ 层封装，组件中禁止直接 fetch
- MongoDB 连接字符串从环境变量读取，禁止硬编码
- JWT Secret 从环境变量读取
- 组件 ID 使用 uuid v4 生成
