"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UserRoleFormProps {
  userId: string;
  currentRole: string;
}

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
        disabled={loading}
      >
        <option value="OWNER">Owner</option>
        <option value="OPERATOR">Operator</option>
        <option value="ADMIN">Admin</option>
        <option value="REGULATOR">Regulator</option>
      </select>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
          Role updated successfully!
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || role === currentRole}
        className="w-full"
      >
        {loading ? "Updating..." : "Update Role"}
      </Button>
    </form>
  );
}

