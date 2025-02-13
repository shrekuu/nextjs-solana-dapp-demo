import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getSessionData } from "../lib";

// generate a "oBbLoEldZs" like nonce

const generateNonce = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.randomFillSync(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return Response.json({ success: false, message: "Missing address" }, { status: 400 });
  }

  const nonce = generateNonce();

  const session = await getSessionData();

  // store the nonce in the session
  session.tempNonce = nonce;
  session.tempAddress = address;
  await session.save();

  return Response.json({ success: true, data: { nonce } });
}
