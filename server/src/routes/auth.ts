import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { success, error } from '../utils/response';

const router = Router();

// 生成 Token
const generateTokens = (userId: string) => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const accessToken = jwt.sign({ userId }, secret, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId }, secret, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

// 注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return error(res, '请填写完整信息', 400);
    }

    if (password.length < 6) {
      return error(res, '密码长度至少6位', 400);
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, '该邮箱已被注册', 400);
    }

    const user = new User({ username, email, password });
    await user.save();

    const tokens = generateTokens(user._id.toString());

    success(res, {
      user: user.toJSON(),
      ...tokens,
    }, '注册成功');
  } catch (err: any) {
    error(res, err.message || '注册失败');
  }
});

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, '请填写邮箱和密码', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return error(res, '邮箱或密码错误', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, '邮箱或密码错误', 401);
    }

    const tokens = generateTokens(user._id.toString());

    success(res, {
      user: user.toJSON(),
      ...tokens,
    }, '登录成功');
  } catch (err: any) {
    error(res, err.message || '登录失败');
  }
});

// 刷新 Token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return error(res, '缺少 refreshToken', 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    const tokens = generateTokens(decoded.userId);

    success(res, tokens, 'Token 刷新成功');
  } catch (err: any) {
    error(res, 'Token 已过期，请重新登录', 401);
  }
});

export default router;
