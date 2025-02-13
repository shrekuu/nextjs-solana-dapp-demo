import { getSessionData } from "@/app/api/auth/lib";

export default async function Page() {
  const session = await getSessionData();

  return (
    <div>
      <pre>
        <code>{JSON.stringify(session, null, 2)}</code>
      </pre>
    </div>
  );
}
