import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import * as fs from 'fs';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

import { UPLOAD_RULES } from '../utils/upload.rules';

type UploadFieldName = keyof typeof UPLOAD_RULES;

const isUploadField = (field: string): field is UploadFieldName => {
  return field in UPLOAD_RULES;
};

const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const multerConfig = {
  storage: diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ): void => {
      if (!isUploadField(file.fieldname)) {
        return cb(
          new BadRequestException(`Field not allowed → ${file.fieldname}`),
          '',
        );
      }

      const rule = UPLOAD_RULES[file.fieldname];

      ensureDir(rule.path);
      cb(null, rule.path);
    },

    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ): void => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = extname(file.originalname);

      cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
  }),

  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    if (!isUploadField(file.fieldname)) {
      return cb(
        new BadRequestException(`Field not allowed → ${file.fieldname}`),
      );
    }

    const rule = UPLOAD_RULES[file.fieldname];

    if (!rule.mimeTypes.includes(file.mimetype)) {
      return cb(
        new BadRequestException(`Invalid file type for ${file.fieldname}`),
      );
    }

    cb(null, true);
  },
};
