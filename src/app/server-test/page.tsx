import { testInsert } from "@/lib/actions/testInsert";

export default function ServerTestPage() {
  async function runInsert() {
    "use server";
    await testInsert();
  }

  return (
    <form action={runInsert}>
      <button className="p-3 bg-blue-600 text-white rounded">
        Insert test row
      </button>
    </form>
  );
}
