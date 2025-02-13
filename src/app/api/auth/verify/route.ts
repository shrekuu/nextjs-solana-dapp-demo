import { NextRequest, NextResponse } from "next/server";
import { ed25519 } from "@noble/curves/ed25519";
import { getSessionData } from "../lib";
import bs58 from "bs58";

/**
* -------------------------------------

POST /api/auth/verify

Request body:
{
  "nonce": string,
  "signature": string,
  "message": string,
  "address": string
}

example req body:
{
  "address": "BtBpkfa32rcfd6pEWGAgmaMLFGWSK9Q67evZV8UrcjBu",
  "nonce": "j72DBYLLdI",
  "message": "localhost:8000 wants you to sign in with your Solana account:\nBtBpkfa32rcfd6pEWGAgmaMLFGWSK9Q67evZV8UrcjBu\n\nPlease sign in. \n\nnonce: j72DBYLLdI",
  "signature": "Zem1VwBxESpDLxO2022OyH8akDg1k3utOegKc2PTvdtCnYduagPeIsG3N8nu8KTdsjoQxIk4xFSh+oGb4qK5Bg=="
}

Response body:
{
  "success": boolean,
  "data": {
    "address": string,
    "authenticated": boolean
  }
}

*/

export async function POST(req: NextRequest) {
  try {
    const reqBody = (await req.json()) as { nonce: string; signature: string; message: string; address: string };

    if (!reqBody.nonce || !reqBody.signature || !reqBody.message || !reqBody.address) {
      return NextResponse.json({ success: false, message: "Missing parameters!" }, { status: 400 });
    }

    const session = await getSessionData();

    // get the nonce from the session
    const storedNonce = session.tempNonce;
    const storedAddress = session.tempAddress;

    // verify the nonce
    if (reqBody.nonce !== storedNonce && reqBody.address !== storedAddress) {
      return NextResponse.json({ success: false, message: "Invalid nonce!" }, { status: 400 });
    }

    const uint8ArraySignature = new Uint8Array(Buffer.from(reqBody.signature, "base64"));
    const uint8ArrayMessage = new TextEncoder().encode(reqBody.message);
    const uint8ArrayAddress = bs58.decode(reqBody.address);

    // verify the signature
    const isValid = ed25519.verify(uint8ArraySignature, uint8ArrayMessage, uint8ArrayAddress);

    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid signature!" }, { status: 400 });
    }

    // store the user's address in the session
    session.address = storedAddress;
    session.authenticated = true;
    session.tempNonce = "";
    session.tempAddress = "";
    await session.save();

    // everthing is good, send over user session data
    return NextResponse.json({ success: false, data: session }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}
