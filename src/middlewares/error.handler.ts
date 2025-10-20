import { Request, Response, NextFunction } from 'express';
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = Number(err?.status) || 500;
  res.status(status).json({
    type: 'about:blank',
    title: err.name || 'Error',
    status,
    detail: err.message || 'Internal error',
    instance: (req as any).requestId
  });
}
