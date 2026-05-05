// 大屏 DSL 根节点
export interface ScreenDSL {
  version: "1.0";
  screen: {
    width: number;           // 画布宽度 (固定 1920)
    height: number;          // 画布高度 (固定 1080)
    backgroundColor: string; // 背景色
    backgroundImage?: string; // 背景图
  };
  componentMap: Record<string, DSLComponent>; // 扁平 Map 存储所有组件
  rootComponentIds: string[]; // 根层级组件 ID 列表
}

// 组件节点 - 扁平结构，父子关系通过 ID 引用
export interface DSLComponent {
  id: string;                // 唯一 ID (uuid)
  type: string;              // 组件类型 (如 "chart-bar", "text", "container")
  name: string;              // 组件显示名称
  parentId: string | null;   // 父组件 ID，null 表示根层级
  childIds: string[];        // 子组件 ID 列表（有序）
  position: ComponentPosition;
  props: Record<string, any>; // 组件属性 (由 JSON Schema 定义)
  dataBinding?: DataBinding;  // 数据绑定 (可选)
}

// 组件位置和尺寸
export interface ComponentPosition {
  x: number;               // X 坐标 (px)
  y: number;               // Y 坐标 (px)
  width: number;           // 宽度
  height: number;          // 高度
  zIndex: number;          // 层级
}

// 数据绑定配置
export interface DataBinding {
  type: "static" | "api" | "websocket";
  config: Record<string, any>;
}

// 组件元数据（注册表使用）
export interface ComponentMeta {
  type: string;              // 组件类型标识
  name: string;              // 显示名称
  icon: string;              // 图标
  category: string;          // 分类 (如 "图表", "文字", "装饰")
  defaultProps: Record<string, any>;  // 默认属性
  schema: Record<string, any>;       // JSON Schema (用于生成表单)
  defaultSize: {
    width: number;
    height: number;
  };
}

// 创建默认 DSL
export function createDefaultDSL(): ScreenDSL {
  return {
    version: "1.0",
    screen: {
      width: 1920,
      height: 1080,
      backgroundColor: "#0a0a1a",
    },
    componentMap: {},
    rootComponentIds: [],
  };
}
