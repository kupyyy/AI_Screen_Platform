import { Response } from 'express';

export const success = (res: Response, data: any, message = '成功') => {
  res.json({
    code: 200,
    message,
    data,
  });
};

export const error = (res: Response, message = '服务器错误', status = 500) => {
  res.status(status).json({
    code: status,
    message,
    data: null,
  });
};
