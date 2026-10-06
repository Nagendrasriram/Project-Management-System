import { prisma } from '../config/prisma';
import { logger } from '../config/logger';

export const logAuditEvent = async (
  userId: string | null | undefined,
  action: string,
  entityType: string,
  entityId: string,
  details?: any
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      },
    });
  } catch (error) {
    // Non-blocking for primary operations
    logger.error(error, `Failed to write audit log for ${action} on ${entityType}:${entityId}`);
  }
};
