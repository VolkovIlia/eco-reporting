"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { facilities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/session";

interface FacilityFormData {
  name: string;
  address: string;
  nvosCategory: "I" | "II" | "III" | "IV";
  nvosRegNumber?: string;
  okved?: string;
}

function parseFormData(formData: FormData): FacilityFormData {
  return {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    nvosCategory: String(formData.get("nvosCategory") ?? "IV") as "I" | "II" | "III" | "IV",
    nvosRegNumber: String(formData.get("nvosRegNumber") ?? "").trim() || undefined,
    okved: String(formData.get("okved") ?? "").trim() || undefined,
  };
}

export async function createFacility(formData: FormData) {
  const { user } = await requireSession();

  if (!user.orgId) {
    throw new Error("Организация не настроена");
  }

  const data = parseFormData(formData);

  if (!data.name || !data.address) {
    throw new Error("Название и адрес обязательны");
  }

  await db.insert(facilities).values({
    orgId: user.orgId,
    name: data.name,
    address: data.address,
    nvosCategory: data.nvosCategory,
    nvosRegNumber: data.nvosRegNumber,
    okved: data.okved,
  });

  revalidatePath("/dashboard/facilities");
  redirect("/dashboard/facilities");
}

export async function updateFacility(id: number, formData: FormData) {
  const { user } = await requireSession();

  if (!user.orgId) {
    throw new Error("Организация не настроена");
  }

  const data = parseFormData(formData);

  await db
    .update(facilities)
    .set({
      name: data.name,
      address: data.address,
      nvosCategory: data.nvosCategory,
      nvosRegNumber: data.nvosRegNumber,
      okved: data.okved,
      updatedAt: new Date(),
    })
    .where(and(eq(facilities.id, id), eq(facilities.orgId, user.orgId)));

  revalidatePath("/dashboard/facilities");
  redirect("/dashboard/facilities");
}

export async function deleteFacility(id: number) {
  const { user } = await requireSession();

  if (!user.orgId) {
    throw new Error("Организация не настроена");
  }

  await db
    .delete(facilities)
    .where(and(eq(facilities.id, id), eq(facilities.orgId, user.orgId)));

  revalidatePath("/dashboard/facilities");
}
