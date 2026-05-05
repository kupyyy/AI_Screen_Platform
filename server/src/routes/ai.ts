import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import { aiService } from '../services/AIService';

const router = Router();

// 所有路由需要认证
router.use(authMiddleware);

// 存储进行中的请求，用于取消
const activeRequests = new Map<string, AbortController>();

// SSE 流式生成大屏
router.post('/generate', async (req: AuthRequest, res: Response) => {
  const { prompt, currentDSL } = req.body;
  const requestId = req.headers['x-request-id'] as string || Date.now().toString();

  if (!prompt) {
    res.status(400).json({ code: 400, message: '请输入提示词', data: null });
    return;
  }

  // 设置 SSE 头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Request-Id': requestId,
  });

  // 创建 AbortController（仅用于显式取消）
  const abortController = new AbortController();
  activeRequests.set(requestId, abortController);

  try {
    const generator = aiService.generateScreen(prompt, currentDSL);

    for await (const event of generator) {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);

      if (event.type === 'error' || event.type === 'done' || event.type === 'cancelled') {
        break;
      }
    }
  } catch (error: any) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
  } finally {
    activeRequests.delete(requestId);
    res.end();
  }
});

// SSE 流式修改组件
router.post('/modify', async (req: AuthRequest, res: Response) => {
  const { componentId, componentInfo, prompt } = req.body;
  const requestId = req.headers['x-request-id'] as string || Date.now().toString();

  if (!componentId || !prompt) {
    res.status(400).json({ code: 400, message: '缺少必要参数', data: null });
    return;
  }

  // 设置 SSE 头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Request-Id': requestId,
  });

  // 创建 AbortController（仅用于显式取消）
  const abortController = new AbortController();
  activeRequests.set(requestId, abortController);

  try {
    const generator = aiService.modifyComponent(
      componentId,
      componentInfo,
      prompt,
    );

    for await (const event of generator) {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);

      if (event.type === 'error' || event.type === 'done' || event.type === 'cancelled') {
        break;
      }
    }
  } catch (error: any) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
  } finally {
    activeRequests.delete(requestId);
    res.end();
  }
});

// 取消正在进行的生成
router.post('/cancel/:requestId', async (req: AuthRequest, res: Response) => {
  const requestId = req.params.requestId as string;

  const abortController = activeRequests.get(requestId);
  if (abortController) {
    abortController.abort();
    activeRequests.delete(requestId);
    res.json({ code: 200, message: '已取消', data: null });
  } else {
    res.json({ code: 200, message: '请求不存在或已完成', data: null });
  }
});

export default router;
