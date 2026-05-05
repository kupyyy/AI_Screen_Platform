import type { ComponentMeta } from '@/types';
import type { ComponentType } from 'react';

// 组件注册表单例
class ComponentRegistry {
  private static instance: ComponentRegistry;

  // 组件元数据存储
  private metaMap: Map<string, ComponentMeta> = new Map();

  // 组件实现存储
  private componentMap: Map<string, ComponentType<any>> = new Map();

  private constructor() {}

  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  // 注册组件
  register(meta: ComponentMeta, component: ComponentType<any>): void {
    this.metaMap.set(meta.type, meta);
    this.componentMap.set(meta.type, component);
  }

  // 获取组件元数据
  getMeta(type: string): ComponentMeta | undefined {
    return this.metaMap.get(type);
  }

  // 获取组件实现
  getComponent(type: string): ComponentType<any> | undefined {
    return this.componentMap.get(type);
  }

  // 获取所有组件元数据（按分类）
  getAllMeta(): ComponentMeta[] {
    return Array.from(this.metaMap.values());
  }

  // 按分类获取组件
  getMetaByCategory(category: string): ComponentMeta[] {
    return Array.from(this.metaMap.values()).filter(
      (meta) => meta.category === category
    );
  }

  // 获取所有分类
  getCategories(): string[] {
    const categories = new Set<string>();
    this.metaMap.forEach((meta) => categories.add(meta.category));
    return Array.from(categories);
  }

  // 检查组件是否已注册
  has(type: string): boolean {
    return this.metaMap.has(type);
  }

  // 获取组件默认属性
  getDefaultProps(type: string): Record<string, any> {
    return this.metaMap.get(type)?.defaultProps || {};
  }

  // 获取组件 JSON Schema
  getSchema(type: string): Record<string, any> | undefined {
    return this.metaMap.get(type)?.schema;
  }
}

// 导出单例
export const componentRegistry = ComponentRegistry.getInstance();
