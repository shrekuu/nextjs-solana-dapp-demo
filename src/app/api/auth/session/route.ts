import { NextRequest } from "next/server";
import { defaultSession } from "@/store/sessionStore";
import { getSessionData } from "../lib";

/**
* -------------------------------------

get session
GET /api/auth/session

destroy session, aka: log out
GET /api/auth/session?action=logout 

*/

export async function GET(request: NextRequest) {
  const session = await getSessionData();

  const action = new URL(request.url).searchParams.get("action");

  // use is logging out; destroy session
  // session?action=logout
  if (action === "logout") {
    session.destroy();
    return Response.json({ success: true, data: defaultSession });
  }

  // not authenticated
  if (session.authenticated !== true) {
    return Response.json({ success: false, data: defaultSession });
  }

  // return authenticated session
  return Response.json({ success: true, data: session });
}
