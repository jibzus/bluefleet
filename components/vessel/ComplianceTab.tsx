"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ComplianceTabProps {
  data: any[];
  onChange: (certs: any[]) => void;
}

export function ComplianceTab({ data, onChange }: ComplianceTabProps) {
  const [certs, setCerts] = useState(data || []);
  const [newCert, setNewCert] = useState({
    kind: "",
    issuer: "",
    number: "",
    issuedAt: "",
    expiresAt: "",
    docUrl: "",
  });

  const handleAddCert = () => {
    if (!newCert.kind.trim()) {
      alert("Please enter certification type");
      return;
    }

    const newCerts = [...certs, { ...newCert, status: "PENDING", hash: "" }];
    setCerts(newCerts);
    onChange(newCerts);
    setNewCert({
      kind: "",
      issuer: "",
      number: "",
      issuedAt: "",
      expiresAt: "",
      docUrl: "",
    });
  };

  const handleRemoveCert = (index: number) => {
    const newCerts = certs.filter((_, i) => i !== index);
    setCerts(newCerts);
    onChange(newCerts);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Compliance Certifications</h2>
        <p className="mb-4 text-sm text-gray-600">
          Add vessel certifications and compliance documents
        </p>

        {/* Add Certification Form */}
        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-3 font-medium">Add Certification</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Type <span className="text-red-600">*</span>
              </label>
              <select
                value={newCert.kind}
                onChange={(e) => setNewCert({ ...newCert, kind: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select type...</option>
                <option value="SOLAS">SOLAS</option>
                <option value="IMO">IMO</option>
                <option value="NIMASA">NIMASA</option>
                <option value="NIPEX">NIPEX</option>
                <option value="Insurance">Insurance</option>
                <option value="Flag State">Flag State</option>
                <option value="Port State">Port State</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Issuer
              </label>
              <Input
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                placeholder="e.g., Lloyd's Register"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Certificate Number
              </label>
              <Input
                value={newCert.number}
                onChange={(e) => setNewCert({ ...newCert, number: e.target.value })}
                placeholder="e.g., CERT-12345"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Issued Date
              </label>
              <Input
                type="date"
                value={newCert.issuedAt}
                onChange={(e) => setNewCert({ ...newCert, issuedAt: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <Input
                type="date"
                value={newCert.expiresAt}
                onChange={(e) => setNewCert({ ...newCert, expiresAt: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Document URL
              </label>
              <Input
                value={newCert.docUrl}
                onChange={(e) => setNewCert({ ...newCert, docUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <Button onClick={handleAddCert} className="mt-4">
            Add Certification
          </Button>
        </div>

        {/* Certifications List */}
        {certs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <div className="mb-2 text-4xl">✅</div>
            <p className="text-gray-600">No certifications added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certs.map((cert, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{cert.kind}</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {cert.issuer && <p>Issuer: {cert.issuer}</p>}
                      {cert.number && <p>Number: {cert.number}</p>}
                      {cert.expiresAt && (
                        <p>Expires: {new Date(cert.expiresAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveCert(index)}
                    className="text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

