import { requestJson } from "@/src/lib/api/client";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export async function changePassword(input: ChangePasswordInput): Promise<{ message: string }> {
  return requestJson<{ message: string }>(
    "settings/password",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    { fallbackMessage: "Unable to update password.", requiresAuth: true }
  );
}
