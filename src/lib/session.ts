import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  orgId: number | null;
  role: string;
}

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function requireSession(): Promise<{ user: SessionUser }> {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return { user: session.user as unknown as SessionUser };
}
