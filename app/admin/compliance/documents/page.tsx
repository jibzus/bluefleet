import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function DocumentHashLogPage() {
  const user = await requireRole(["ADMIN"]);

  if (!user) {
    redirect("/dashboard");
  }

  // Get all document hashes
  const documentHashes = await prisma.documentHash.findMany({
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit for performance
  });

  // Get statistics
  const totalDocuments = await prisma.documentHash.count();
  const uniqueDocuments = await prisma.documentHash.groupBy({
    by: ["documentUrl"],
  });

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <Link
          href="/admin/compliance"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Compliance Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Immutable Document Log</h1>
        <p className="mt-2 text-gray-600">
          SHA-256 hashes of all uploaded documents for integrity verification
        </p>
      </div>

      {/* Info Banner */}
      <Card className="mb-6 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🔒</div>
          <div className="flex-1">
            <h2 className="mb-2 font-semibold text-blue-900">
              Immutable Document Integrity
            </h2>
            <p className="mb-2 text-sm text-blue-800">
              All documents uploaded to BlueFleet are hashed using SHA-256 algorithm.
              These hashes are stored in an append-only log and cannot be modified or
              deleted.
            </p>
            <p className="text-sm text-blue-800">
              This ensures document integrity and provides a verifiable audit trail for
              compliance and regulatory purposes.
            </p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hash Records</p>
              <p className="mt-2 text-3xl font-bold">{totalDocuments}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Documents</p>
              <p className="mt-2 text-3xl font-bold">{uniqueDocuments.length}</p>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hash Algorithm</p>
              <p className="mt-2 text-xl font-bold">SHA-256</p>
            </div>
            <div className="text-4xl">🔐</div>
          </div>
        </Card>
      </div>

      {/* Document Hash Table */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Document Hash Log</h2>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Export CSV
          </button>
        </div>

        {documentHashes.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No document hashes recorded yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-600">
                  <th className="pb-3">Document URL</th>
                  <th className="pb-3">SHA-256 Hash</th>
                  <th className="pb-3">Uploaded By</th>
                  <th className="pb-3">Vessel ID</th>
                  <th className="pb-3">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documentHashes.map((hash) => (
                  <tr key={hash.id} className="text-sm">
                    <td className="py-4">
                      <div className="max-w-xs truncate font-mono text-xs text-gray-600">
                        {hash.documentUrl}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="max-w-md">
                        <code className="block break-all rounded bg-gray-100 px-2 py-1 text-xs font-mono">
                          {hash.hash}
                        </code>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">
                      {hash.uploader.name || hash.uploader.email}
                    </td>
                    <td className="py-4">
                      {hash.vesselId ? (
                        <span className="font-mono text-xs text-gray-600">
                          {hash.vesselId.slice(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-4 text-gray-600">
                      {new Date(hash.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* How It Works */}
      <Card className="mt-6 p-6">
        <h3 className="mb-4 font-semibold">How Document Hashing Works</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-lg">1️⃣</div>
            <div>
              <strong>Upload:</strong> When a document is uploaded, its content is
              processed through the SHA-256 cryptographic hash function.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-lg">2️⃣</div>
            <div>
              <strong>Store:</strong> The resulting 64-character hash is stored in this
              immutable log along with metadata (uploader, timestamp, vessel ID).
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-lg">3️⃣</div>
            <div>
              <strong>Verify:</strong> At any time, the document can be re-hashed and
              compared to the stored hash to verify it hasn't been tampered with.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-lg">4️⃣</div>
            <div>
              <strong>Audit:</strong> The log provides a complete audit trail of all
              documents, who uploaded them, and when.
            </div>
          </div>
        </div>
      </Card>

      {/* Future Enhancement */}
      <Card className="mt-6 border-purple-200 bg-purple-50 p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🔮</div>
          <div className="flex-1">
            <h3 className="mb-2 font-semibold text-purple-900">
              Future Enhancement: Blockchain Anchoring
            </h3>
            <p className="text-sm text-purple-800">
              In a future release, document hashes will be anchored to a public
              blockchain (via daily roll-up) for additional immutability guarantees and
              third-party verification. This will provide cryptographic proof that
              documents existed at a specific point in time.
            </p>
          </div>
        </div>
      </Card>
    </main>
  );
}

