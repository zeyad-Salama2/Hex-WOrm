import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 6;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH, `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirm new password must match.",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
