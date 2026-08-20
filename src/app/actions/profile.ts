"use server";

import { revalidatePath } from "next/cache";
import { updateCurrentProfile } from "@/lib/data/profile";

export interface UpdateProfileState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const phone = String(formData.get("phone") ?? "");

  try {
    await updateCurrentProfile({ firstName, lastName, phone });
    revalidatePath("/account");
    revalidatePath("/account/settings");
    return { status: "success", message: "Profile updated." };
  } catch {
    return {
      status: "error",
      message: "Unable to save changes. Please try again.",
    };
  }
}
