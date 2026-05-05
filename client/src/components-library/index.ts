import { componentRegistry } from '@/core/Registry';

// 导入组件实现
import ChartBar from './chart-bar';
import ChartLine from './chart-line';
import ChartPie from './chart-pie';
import Text from './text';
import Image from './image';
import Table from './table';

// 导入元数据
import { chartBarMeta } from './chart-bar/meta';
import { chartLineMeta } from './chart-line/meta';
import { chartPieMeta } from './chart-pie/meta';
import { textMeta } from './text/meta';
import { imageMeta } from './image/meta';
import { tableMeta } from './table/meta';

// 注册所有组件
export function registerAllComponents() {
  componentRegistry.register(chartBarMeta, ChartBar);
  componentRegistry.register(chartLineMeta, ChartLine);
  componentRegistry.register(chartPieMeta, ChartPie);
  componentRegistry.register(textMeta, Text);
  componentRegistry.register(imageMeta, Image);
  componentRegistry.register(tableMeta, Table);
}

// 导出注册表
export { componentRegistry };
