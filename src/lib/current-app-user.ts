import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export type AppUser = {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
};

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  if (!clerkUser || !email) {
    throw new Error("The signed-in Clerk user does not have a primary email.");
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;

  const { rows } = await db.query<AppUser>(
    `INSERT INTO users (clerk_id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (clerk_id)
     DO UPDATE SET
       email = EXCLUDED.email,
       name = EXCLUDED.name,
       updated_at = NOW()
     RETURNING
       id,
       clerk_id AS "clerkId",
       email,
       name`,
    [userId, email, name],
  );

  return rows[0];
}
