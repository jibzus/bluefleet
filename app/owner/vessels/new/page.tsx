import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { VesselForm } from "@/components/vessel/VesselForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function NewVesselPage() {
  const user = await requireRole(["OWNER", "ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title="Add New Vessel"
        description="Create a new vessel listing with complete specifications"
        backHref="/owner/vessels"
        backLabel="Back to My Vessels"
        breadcrumbs={[
          { label: "Vessels", href: "/owner/vessels" },
          { label: "New" },
        ]}
      />

      <VesselForm userId={user.id} />
    </main>
  );
}
