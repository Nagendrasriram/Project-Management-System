import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await DashboardService.getDashboardStats(req.user!.id);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}
