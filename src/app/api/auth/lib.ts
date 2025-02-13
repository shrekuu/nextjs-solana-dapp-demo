import { TSessionData } from "@/store/sessionStore";
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export const sessionOptions: SessionOptions = {
  password: process.env.APP_KEY!,
  cookieName: process.env.NEXT_PUBLIC_APP_NAME!,
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    // secure: true,
  },
};

export async function getSessionData() {
  return await getIronSession<TSessionData>(await cookies(), sessionOptions);
}
