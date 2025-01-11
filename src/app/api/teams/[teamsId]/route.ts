import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// UPDATE team
export async function PUT(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, pokemon } = body;

    // Verify team ownership
    const existingTeam = await prisma.team.findUnique({
      where: { id: params.teamId },
    });

    if (!existingTeam || existingTeam.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update team
    const team = await prisma.team.update({
      where: { id: params.teamId },
      data: {
        name,
        pokemon: {
          deleteMany: {},  // Remove existing Pokemon
          create: pokemon.map((p: any) => ({
            pokemonId: p.id,
            name: p.name,
            sprite: p.sprite,
            types: p.types,
          })),
        },
      },
      include: {
        pokemon: true,
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE team
export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify team ownership
    const existingTeam = await prisma.team.findUnique({
      where: { id: params.teamId },
    });

    if (!existingTeam || existingTeam.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.team.delete({
      where: { id: params.teamId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}