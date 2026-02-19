export const UPLOAD_RULES = {
  avatar: {
    maxCount: 1,
    maxSizeMB: 5,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as readonly string[],
    path: './uploads/avatars',
  },
} as const;

export type UploadFieldName = keyof typeof UPLOAD_RULES;
