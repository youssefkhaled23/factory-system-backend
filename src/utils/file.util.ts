import * as fs from 'fs/promises';
import { Logger } from '@nestjs/common';

type NodeError = {
  code?: string;
};

const isNodeError = (error: unknown): error is NodeError => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

const logger = new Logger('FileDeletion');

export const deleteFile = async (path: string): Promise<void> => {
  if (!path) return;

  try {
    await fs.access(path);
    await fs.unlink(path);

    logger.log(`File deleted → ${path}`);
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      logger.warn(`File not found → ${path}`);
      return;
    }

    logger.error(`Failed to delete file → ${path}`, error);
    throw error;
  }
};
