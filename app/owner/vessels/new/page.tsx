import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { VesselForm } from "@/components/vessel/VesselForm";

export default async function NewVesselPage() {
  const user = await requireRole(["OWNER", "ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Vessel</h1>
        <p className="mt-2 text-gray-600">
          Create a new vessel listing with complete specifications
        </p>
      </div>

      <VesselForm userId={user.id} />
    </main>
  );
}

