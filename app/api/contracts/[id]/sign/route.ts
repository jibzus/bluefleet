import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contractSignatureSchema } from "@/lib/validators/contract";

// POST /api/contracts/[id]/sign - Sign contract
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    // Validate request
    const validation = contractSignatureSchema.safeParse({
      ...body,
      contractId: id,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { signatureData, signerRole } = validation.data;

    // Get contract with booking data
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            vessel: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            operator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Check authorization - user must be owner or operator
    const isOwner = contract.booking.vessel.ownerId === user.id;
    const isOperator = contract.booking.operatorId === user.id;

    if (!isOwner && !isOperator) {
      return NextResponse.json(
        { error: "Not authorized to sign this contract" },
        { status: 403 }
      );
    }

    // Verify role matches
    if (isOwner && signerRole !== "OWNER") {
      return NextResponse.json(
        { error: "Role mismatch: you are the owner" },
        { status: 400 }
      );
    }

    if (isOperator && signerRole !== "OPERATOR") {
      return NextResponse.json(
        { error: "Role mismatch: you are the operator" },
        { status: 400 }
      );
    }

    // Check if user already signed
    if (contract.signerIds.includes(user.id)) {
      return NextResponse.json(
        { error: "You have already signed this contract" },
        { status: 400 }
      );
    }

    // Add signature
    const updatedSignerIds = [...contract.signerIds, user.id];
    const isFullySigned =
      updatedSignerIds.includes(contract.booking.vessel.ownerId) &&
      updatedSignerIds.includes(contract.booking.operatorId);

    // Update contract
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        signerIds: updatedSignerIds,
        signedAt: isFullySigned ? new Date() : null,
      },
      include: {
        booking: {
          include: {
            vessel: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            operator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // TODO: Store signature image in blob storage
    // const signatureUrl = await saveSignature(signatureData, `${id}-${user.id}.png`);

    return NextResponse.json({
      contract: updatedContract,
      message: isFullySigned
        ? "Contract fully signed! Proceed to payment."
        : "Signature recorded. Waiting for other party to sign.",
    });
  } catch (error: any) {
    console.error("Error signing contract:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign contract" },
      { status: 500 }
    );
  }
}

