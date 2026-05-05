import { Router, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import { success, error } from '../utils/response';

const router = Router();

// 所有路由需要认证
router.use(authMiddleware);

// 获取当前用户信息
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return error(res, '用户不存在', 404);
    }
    success(res, user.toJSON());
  } catch (err: any) {
    error(res, err.message);
  }
});

// 更新个人信息
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const { username, avatar } = req.body;
    const updateData: any = {};

    if (username) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    success(res, user.toJSON(), '更新成功');
  } catch (err: any) {
    error(res, err.message);
  }
});

// 修改密码
router.put('/password', async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return error(res, '请填写旧密码和新密码', 400);
    }

    if (newPassword.length < 6) {
      return error(res, '新密码长度至少6位', 400);
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return error(res, '旧密码错误', 400);
    }

    user.password = newPassword;
    await user.save();

    success(res, null, '密码修改成功');
  } catch (err: any) {
    error(res, err.message);
  }
});

export default router;
