import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// 定义 Tools
const addComponentTool = tool(
  async ({ componentType, position, props }) => {
    return JSON.stringify({
      action: 'addComponent',
      component: {
        id: uuidv4(),
        type: componentType,
        name: getComponentName(componentType),
        parentId: null,
        childIds: [],
        position: {
          x: position?.x || 100,
          y: position?.y || 100,
          width: position?.width || getDefaultWidth(componentType),
          height: position?.height || getDefaultHeight(componentType),
          zIndex: Date.now(),
        },
        props: props || getDefaultProps(componentType),
      },
    });
  },
  {
    name: 'addComponent',
    description: '向画布添加一个新组件',
    schema: z.object({
      componentType: z.enum(['chart-bar', 'chart-line', 'chart-pie', 'text', 'image', 'table']).describe('组件类型'),
      position: z.object({
        x: z.number().describe('X 坐标'),
        y: z.number().describe('Y 坐标'),
        width: z.number().describe('宽度'),
        height: z.number().describe('高度'),
      }).optional().describe('组件位置和尺寸'),
      props: z.record(z.string(), z.any()).optional().describe('组件属性'),
    }),
  }
);

const modifyComponentTool = tool(
  async ({ componentId, props }) => {
    return JSON.stringify({
      action: 'modifyComponent',
      componentId,
      props,
    });
  },
  {
    name: 'modifyComponent',
    description: '修改已有组件的属性',
    schema: z.object({
      componentId: z.string().describe('要修改的组件 ID'),
      props: z.record(z.string(), z.any()).describe('要修改的属性（合并更新）'),
    }),
  }
);

const removeComponentTool = tool(
  async ({ componentId }) => {
    return JSON.stringify({
      action: 'removeComponent',
      componentId,
    });
  },
  {
    name: 'removeComponent',
    description: '删除指定组件',
    schema: z.object({
      componentId: z.string().describe('要删除的组件 ID'),
    }),
  }
);

// AI 服务类
export class AIService {
  private _llm: ChatOpenAI | null = null;

  private get llm(): ChatOpenAI {
    if (!this._llm) {
      this._llm = new ChatOpenAI({
        modelName: process.env.AI_MODEL_NAME || 'mimo-v2-pro',
        apiKey: process.env.AI_API_KEY,
        configuration: {
          baseURL: process.env.AI_BASE_URL || 'https://api.mimo.ai/v1',
        },
        temperature: 0.7,
        maxTokens: 4096,
      });
    }
    return this._llm;
  }

  // 生成大屏（多轮 tool calling，流式返回事件）
  async *generateScreen(
    prompt: string,
    currentDSL?: any,
  ): AsyncGenerator<{ type: string; data: any }> {
    const componentCount = Object.keys(currentDSL?.componentMap || {}).length;
    const systemMessage = `你是一个大屏可视化设计助手。用户会描述他们想要的大屏，你需要直接调用 addComponent 工具来添加组件。

可用的组件类型：
- chart-bar: 柱状图，适合展示分类数据对比
- chart-line: 折线图，适合展示趋势数据
- chart-pie: 饼图，适合展示占比数据
- text: 文本组件，适合展示标题、说明文字
- image: 图片组件
- table: 表格组件，适合展示详细数据

画布尺寸：1920x1080。当前画布上有 ${componentCount} 个组件。${componentCount === 0 ? '画布为空。' : ''}

重要规则：
1. 每次调用一个 addComponent 工具添加一个组件
2. 如果用户要求生成大屏，请分多次调用 addComponent 添加多个组件（标题、图表等）来组成完整布局
3. 合理安排组件位置，避免重叠。标题放在顶部，图表分布在下方
4. 给组件设置合适的 props（如 title、data 等）
5. 添加完所有组件后，用简短文字说明你添加了哪些组件

请根据用户描述开始添加组件。`;

    const messages: (SystemMessage | HumanMessage | AIMessage | ToolMessage)[] = [
      new SystemMessage(systemMessage),
      new HumanMessage(prompt),
    ];

    const MAX_ITERATIONS = 10;
    let hasYielded = false;

    try {
      const tools = [addComponentTool, modifyComponentTool, removeComponentTool];
      const llmWithTools = this.llm.bindTools(tools);

      for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const response = await llmWithTools.invoke(messages);

        // Extract text content
        if (response.content && typeof response.content === 'string' && response.content.trim()) {
          hasYielded = true;
          yield { type: 'message', data: { content: response.content } };
        }

        // If no tool calls, we're done
        if (!response.tool_calls || response.tool_calls.length === 0) {
          break;
        }

        // Process tool calls
        const toolResults: ToolMessage[] = [];
        for (const toolCall of response.tool_calls) {
          hasYielded = true;
          yield {
            type: 'tool_call',
            data: {
              tool: toolCall.name,
              args: toolCall.args,
              id: toolCall.id,
            },
          };

          // Execute the tool
          const toolDef = tools.find(t => t.name === toolCall.name);
          if (toolDef) {
            try {
              const result = await (toolDef as any).invoke(toolCall.args);
              toolResults.push(new ToolMessage({
                content: String(result),
                tool_call_id: toolCall.id,
              }));
            } catch (toolErr: any) {
              toolResults.push(new ToolMessage({
                content: `Error: ${toolErr.message}`,
                tool_call_id: toolCall.id,
              }));
            }
          }
        }

        // Add AI message and tool results to conversation
        messages.push(response);
        messages.push(...toolResults);
      }

      yield { type: 'done', data: { message: '生成完成' } };
    } catch (error: any) {
      if (hasYielded) {
        yield { type: 'done', data: { message: '生成完成' } };
      } else {
        yield { type: 'error', data: { message: error.message || '生成失败' } };
      }
    }
  }

  // 流式修改组件
  async *modifyComponent(
    componentId: string,
    componentInfo: any,
    prompt: string,
  ): AsyncGenerator<{ type: string; data: any }> {
    const systemMessage = `你是一个大屏组件修改助手。用户想要修改一个组件的属性。

当前组件信息：
- ID: ${componentId}
- 类型: ${componentInfo.type}
- 名称: ${componentInfo.name}
- 当前属性: ${JSON.stringify(componentInfo.props)}

请根据用户描述修改组件属性。`;

    const messages = [
      new SystemMessage(systemMessage),
      new HumanMessage(prompt),
    ];

    let hasYielded = false;

    try {
      const llmWithTools = this.llm.bindTools([modifyComponentTool]);

      const stream = await llmWithTools.stream(messages);

      const IDLE_TIMEOUT = 10000;
      const iterator = stream[Symbol.asyncIterator]();
      let lastYieldTime = Date.now();

      while (true) {
        const result = await Promise.race([
          iterator.next(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('IDLE_TIMEOUT')), IDLE_TIMEOUT)
          ),
        ]);

        if (result.done) break;
        const chunk = result.value;

        if (chunk.tool_calls && chunk.tool_calls.length > 0) {
          hasYielded = true;
          lastYieldTime = Date.now();
          for (const toolCall of chunk.tool_calls) {
            toolCall.args.componentId = componentId;
            yield {
              type: 'tool_call',
              data: {
                tool: toolCall.name,
                args: toolCall.args,
                id: toolCall.id,
              },
            };
          }
        }

        if (chunk.content) {
          hasYielded = true;
          lastYieldTime = Date.now();
          yield {
            type: 'message',
            data: { content: chunk.content },
          };
        }

        if (hasYielded && Date.now() - lastYieldTime > IDLE_TIMEOUT) {
          break;
        }
      }

      yield { type: 'done', data: { message: '修改完成' } };
    } catch (error: any) {
      if (error.message === 'IDLE_TIMEOUT' && hasYielded) {
        yield { type: 'done', data: { message: '修改完成' } };
      } else if (error.message === 'IDLE_TIMEOUT') {
        yield { type: 'error', data: { message: 'AI 未返回有效数据' } };
      } else {
        yield { type: 'error', data: { message: error.message || '修改失败' } };
      }
    }
  }
}

// 辅助函数
function getComponentName(type: string): string {
  const names: Record<string, string> = {
    'chart-bar': '柱状图',
    'chart-line': '折线图',
    'chart-pie': '饼图',
    'text': '文本',
    'image': '图片',
    'table': '表格',
  };
  return names[type] || type;
}

function getDefaultWidth(type: string): number {
  const widths: Record<string, number> = {
    'chart-bar': 400,
    'chart-line': 400,
    'chart-pie': 400,
    'text': 200,
    'image': 200,
    'table': 500,
  };
  return widths[type] || 300;
}

function getDefaultHeight(type: string): number {
  const heights: Record<string, number> = {
    'chart-bar': 300,
    'chart-line': 300,
    'chart-pie': 300,
    'text': 50,
    'image': 200,
    'table': 250,
  };
  return heights[type] || 200;
}

function getDefaultProps(type: string): Record<string, any> {
  const defaults: Record<string, any> = {
    'chart-bar': {
      title: '',
      data: [
        { name: '北京', value: 120 },
        { name: '上海', value: 200 },
        { name: '广州', value: 150 },
      ],
      color: '#1890ff',
      showLabel: true,
      showGrid: true,
    },
    'chart-line': {
      title: '',
      data: [
        { name: '1月', value: 120 },
        { name: '2月', value: 200 },
        { name: '3月', value: 150 },
      ],
      color: '#52c41a',
      smooth: true,
      showArea: true,
    },
    'chart-pie': {
      title: '',
      data: [
        { name: '北京', value: 120 },
        { name: '上海', value: 200 },
        { name: '广州', value: 150 },
      ],
      colors: ['#1890ff', '#52c41a', '#faad14'],
      showLabel: true,
      showLegend: true,
    },
    'text': {
      content: '请输入文本',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#ffffff',
      textAlign: 'left',
    },
    'image': {
      src: '',
      fit: 'contain',
      borderRadius: 0,
      opacity: 1,
    },
    'table': {
      columns: [
        { key: 'name', title: '姓名', width: 120 },
        { key: 'value', title: '数值', width: 100 },
      ],
      data: [],
      headerBgColor: '#1f1f1f',
      headerTextColor: '#ffffff',
      bodyTextColor: '#a6a6a6',
      showBorder: true,
      striped: true,
    },
  };
  return defaults[type] || {};
}

export const aiService = new AIService();
