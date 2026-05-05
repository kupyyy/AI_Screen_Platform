import { Router, Response } from 'express';
import { Project } from '../models/Project';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import { success, error } from '../utils/response';

const router = Router();

// 所有路由需要认证
router.use(authMiddleware);

// 获取项目列表
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .select('-dsl'); // 列表不返回完整 DSL

    success(res, projects);
  } catch (err: any) {
    error(res, err.message);
  }
});

// 获取项目详情
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return error(res, '项目不存在', 404);
    }

    success(res, project);
  } catch (err: any) {
    error(res, err.message);
  }
});

// 创建项目
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, dsl } = req.body;

    if (!name || !dsl) {
      return error(res, '项目名称和 DSL 数据必填', 400);
    }

    const project = new Project({
      userId: req.userId,
      name,
      description: description || '',
      dsl,
    });
    project.markModified('dsl');

    await project.save();
    success(res, project, '创建成功');
  } catch (err: any) {
    error(res, err.message);
  }
});

// 更新项目
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, dsl } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (dsl) {
      updateData.dsl = dsl;
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updateData },
      { new: true }
    );

    if (!project) {
      return error(res, '项目不存在', 404);
    }

    success(res, project, '更新成功');
  } catch (err: any) {
    error(res, err.message);
  }
});

// 删除项目
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return error(res, '项目不存在', 404);
    }

    success(res, null, '删除成功');
  } catch (err: any) {
    error(res, err.message);
  }
});

export default router;
