import { applyDecorators, UseInterceptors } from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

import { multerConfig } from '../../config/multer.config';
import { UPLOAD_RULES, UploadFieldName } from '../../utils/upload.rules';

type UploadOptions = {
  fieldName: UploadFieldName;
  maxSizeMB?: number;
  maxCount?: number;
};

type MultiUploadOptions = {
  fields: {
    fieldName: UploadFieldName;
    maxCount?: number;
    maxSizeMB?: number;
  }[];
};

export function UploadFile(options: UploadOptions) {
  const rule = UPLOAD_RULES[options.fieldName];

  const limits = {
    fileSize: (options.maxSizeMB ?? rule.maxSizeMB) * 1024 * 1024,
  };

  const interceptor =
    (options.maxCount ?? rule.maxCount) > 1
      ? FilesInterceptor(options.fieldName, options.maxCount ?? rule.maxCount, {
          ...multerConfig,
          limits,
        })
      : FileInterceptor(options.fieldName, {
          ...multerConfig,
          limits,
        });

  return applyDecorators(UseInterceptors(interceptor));
}

export function UploadFiles(options: MultiUploadOptions) {
  const fields = options.fields.map((field) => {
    const rule = UPLOAD_RULES[field.fieldName];
    return {
      name: field.fieldName,
      maxCount: field.maxCount ?? rule.maxCount,
    };
  });

  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(fields, {
        ...multerConfig,
      }),
    ),
  );
}
