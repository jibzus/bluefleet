import { z } from "zod";

// Contract Generation Schema
export const contractGenerationSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  version: z.number().min(1).default(1),
});

// Contract Signature Schema
export const contractSignatureSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
  signatureData: z.string().min(1, "Signature is required"), // Base64 encoded signature image
  signerRole: z.enum(["OWNER", "OPERATOR"]),
});

// Contract Status
export type ContractStatus = "DRAFT" | "PENDING_SIGNATURES" | "PARTIALLY_SIGNED" | "FULLY_SIGNED";

// Get contract status based on signers
export function getContractStatus(
  signerIds: string[],
  ownerId: string,
  operatorId: string
): ContractStatus {
  if (signerIds.length === 0) {
    return "PENDING_SIGNATURES";
  }
  
  const ownerSigned = signerIds.includes(ownerId);
  const operatorSigned = signerIds.includes(operatorId);
  
  if (ownerSigned && operatorSigned) {
    return "FULLY_SIGNED";
  }
  
  if (ownerSigned || operatorSigned) {
    return "PARTIALLY_SIGNED";
  }
  
  return "PENDING_SIGNATURES";
}

// Format contract status for display
export function formatContractStatus(status: ContractStatus): {
  label: string;
  color: string;
  description: string;
} {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        color: "gray",
        description: "Contract is being prepared",
      };
    case "PENDING_SIGNATURES":
      return {
        label: "Pending Signatures",
        color: "yellow",
        description: "Waiting for both parties to sign",
      };
    case "PARTIALLY_SIGNED":
      return {
        label: "Partially Signed",
        color: "blue",
        description: "One party has signed",
      };
    case "FULLY_SIGNED":
      return {
        label: "Fully Signed",
        color: "green",
        description: "Both parties have signed",
      };
  }
}

// Generate contract terms from booking
export function generateContractTerms(booking: any, vessel: any): {
  parties: {
    owner: { name: string; email: string; id: string };
    operator: { name: string; email: string; id: string };
  };
  vessel: {
    name: string;
    type: string;
    imoNumber?: string;
    homePort?: string;
  };
  charter: {
    startDate: string;
    endDate: string;
    duration: number;
    purpose: string;
  };
  financial: {
    dailyRate: number;
    currency: string;
    totalAmount: number;
    securityDeposit: number;
    fuelIncluded: boolean;
    crewIncluded: boolean;
  };
  terms: {
    customClauses?: string;
    specialRequirements?: string;
    cargoType?: string;
    route?: string;
  };
} {
  const specs = vessel.specs as any;
  const pricing = specs.pricing || {};
  const bookingTerms = booking.terms as any;
  
  const startDate = new Date(booking.start);
  const endDate = new Date(booking.end);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalAmount = (pricing.dailyRate || 0) * duration;
  
  return {
    parties: {
      owner: {
        name: vessel.owner.name || vessel.owner.email,
        email: vessel.owner.email,
        id: vessel.owner.id,
      },
      operator: {
        name: booking.operator.name || booking.operator.email,
        email: booking.operator.email,
        id: booking.operator.id,
      },
    },
    vessel: {
      name: specs.name || "Unnamed Vessel",
      type: vessel.type,
      imoNumber: specs.imoNumber,
      homePort: vessel.homePort,
    },
    charter: {
      startDate: startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      endDate: endDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      duration,
      purpose: bookingTerms.purpose || "Maritime charter",
    },
    financial: {
      dailyRate: pricing.dailyRate || 0,
      currency: pricing.currency || "USD",
      totalAmount,
      securityDeposit: pricing.securityDeposit || 0,
      fuelIncluded: pricing.fuelIncluded || false,
      crewIncluded: pricing.crewIncluded || false,
    },
    terms: {
      customClauses: bookingTerms.customClauses,
      specialRequirements: bookingTerms.specialRequirements,
      cargoType: bookingTerms.cargoType,
      route: bookingTerms.route,
    },
  };
}

// Generate contract HTML template
export function generateContractHTML(contractTerms: ReturnType<typeof generateContractTerms>): string {
  const { parties, vessel, charter, financial, terms } = contractTerms;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Vessel Charter Agreement</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
    }
    h1 {
      text-align: center;
      font-size: 24px;
      margin-bottom: 30px;
      text-transform: uppercase;
    }
    h2 {
      font-size: 18px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #333;
      padding-bottom: 5px;
    }
    .section {
      margin-bottom: 20px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .party {
      flex: 1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .signature-section {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      border-top: 2px solid #333;
      padding-top: 10px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Vessel Charter Agreement</h1>
  
  <div class="section">
    <p><strong>Agreement Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
  
  <div class="parties">
    <div class="party">
      <h3>Owner (Lessor)</h3>
      <p><strong>${parties.owner.name}</strong></p>
      <p>${parties.owner.email}</p>
    </div>
    <div class="party">
      <h3>Operator (Lessee)</h3>
      <p><strong>${parties.operator.name}</strong></p>
      <p>${parties.operator.email}</p>
    </div>
  </div>
  
  <h2>1. Vessel Description</h2>
  <table>
    <tr><th>Vessel Name</th><td>${vessel.name}</td></tr>
    <tr><th>Vessel Type</th><td>${vessel.type}</td></tr>
    ${vessel.imoNumber ? `<tr><th>IMO Number</th><td>${vessel.imoNumber}</td></tr>` : ""}
    ${vessel.homePort ? `<tr><th>Home Port</th><td>${vessel.homePort}</td></tr>` : ""}
  </table>
  
  <h2>2. Charter Period</h2>
  <table>
    <tr><th>Start Date</th><td>${charter.startDate}</td></tr>
    <tr><th>End Date</th><td>${charter.endDate}</td></tr>
    <tr><th>Duration</th><td>${charter.duration} days</td></tr>
    <tr><th>Purpose</th><td>${charter.purpose}</td></tr>
  </table>
  
  <h2>3. Financial Terms</h2>
  <table>
    <tr><th>Daily Rate</th><td>${financial.currency} ${financial.dailyRate.toLocaleString()}</td></tr>
    <tr><th>Total Charter Fee</th><td>${financial.currency} ${financial.totalAmount.toLocaleString()}</td></tr>
    ${financial.securityDeposit > 0 ? `<tr><th>Security Deposit</th><td>${financial.currency} ${financial.securityDeposit.toLocaleString()}</td></tr>` : ""}
    <tr><th>Fuel</th><td>${financial.fuelIncluded ? "Included" : "Not Included"}</td></tr>
    <tr><th>Crew</th><td>${financial.crewIncluded ? "Included" : "Not Included"}</td></tr>
  </table>
  
  ${terms.cargoType || terms.route ? `
  <h2>4. Operational Details</h2>
  <table>
    ${terms.cargoType ? `<tr><th>Cargo Type</th><td>${terms.cargoType}</td></tr>` : ""}
    ${terms.route ? `<tr><th>Route</th><td>${terms.route}</td></tr>` : ""}
  </table>
  ` : ""}
  
  ${terms.specialRequirements ? `
  <h2>5. Special Requirements</h2>
  <p>${terms.specialRequirements}</p>
  ` : ""}
  
  ${terms.customClauses ? `
  <h2>6. Custom Clauses</h2>
  <p>${terms.customClauses}</p>
  ` : ""}
  
  <h2>Standard Terms & Conditions</h2>
  <div class="section">
    <p><strong>7.1 Payment:</strong> The Operator agrees to pay the charter fee into escrow upon signing this agreement. Payment will be released to the Owner upon successful completion of the charter period.</p>
    
    <p><strong>7.2 Delivery & Redelivery:</strong> The vessel shall be delivered to the Operator at the agreed location on the start date and redelivered to the Owner at the agreed location on the end date, in the same condition as received, ordinary wear and tear excepted.</p>
    
    <p><strong>7.3 Insurance:</strong> The Owner shall maintain adequate insurance coverage for the vessel. The Operator shall maintain cargo insurance if applicable.</p>
    
    <p><strong>7.4 Compliance:</strong> Both parties agree to comply with all applicable maritime laws, regulations, and international conventions including but not limited to SOLAS, MARPOL, and local port regulations.</p>
    
    <p><strong>7.5 Cancellation:</strong> Either party may cancel this agreement with written notice. Cancellation fees may apply as per the platform's cancellation policy.</p>
    
    <p><strong>7.6 Dispute Resolution:</strong> Any disputes arising from this agreement shall be resolved through the BlueFleet platform's dispute resolution process.</p>
  </div>
  
  <div class="signature-section">
    <div class="signature-box">
      <p><strong>Owner Signature</strong></p>
      <p>${parties.owner.name}</p>
      <p>Date: _________________</p>
    </div>
    <div class="signature-box">
      <p><strong>Operator Signature</strong></p>
      <p>${parties.operator.name}</p>
      <p>Date: _________________</p>
    </div>
  </div>
  
  <div class="footer">
    <p>This agreement is facilitated by BlueFleet Platform</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `.trim();
}

