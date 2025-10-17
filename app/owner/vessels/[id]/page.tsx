import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VesselForm } from "@/components/vessel/VesselForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function EditVesselPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole(["OWNER", "ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  // Get vessel
  const vessel = await prisma.vessel.findUnique({
    where: { id: params.id },
    include: {
      media: {
        orderBy: { sort: "asc" },
      },
      certs: true,
      availability: true,
    },
  });

  if (!vessel) {
    notFound();
  }

  // Check ownership (unless admin)
  if (user.role !== "ADMIN" && vessel.ownerId !== user.id) {
    redirect("/owner/vessels");
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageHeader
        title="Edit Vessel"
        description="Update your vessel listing information"
        backHref="/owner/vessels"
        backLabel="Back to My Vessels"
        breadcrumbs={[
          { label: "Vessels", href: "/owner/vessels" },
          { label: vessel.slug || "Edit" },
        ]}
      />

      <VesselForm userId={user.id} vessel={vessel} />
    </main>
  );
}
