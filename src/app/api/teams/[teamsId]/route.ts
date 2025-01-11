import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// UPDATE team
export async function PUT(
  request: Request,
  context: { params: { teamsId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log("Received update data:", body); // Log the received data

    const { name, pokemon } = body;
    const teamId = context.params.teamsId;

    console.log("Updating team:", teamId);
    console.log("With name:", name);
    console.log("And pokemon:", pokemon);

    // Verify team ownership
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });
    console.log("Found existing team:", existingTeam);

    if (!existingTeam || existingTeam.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const formattedPokemon = pokemon.map((p: any) => {
      // If it's a new pokemon from search
      if (!p.pokemonId && p.id) {
        return {
          pokemonId: p.id,
          name: p.name,
          sprite: p.sprite,
          types: p.types,
        };
      }
      // If it's an existing pokemon
      return {
        pokemonId: p.pokemonId,
        name: p.name,
        sprite: p.sprite,
        types: p.types,
      };
    });
    // Try to update team
    console.log("Attempting to update team...");
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        pokemon: {
          deleteMany: {},  // First delete all existing pokemon
          create: formattedPokemon,  // Then create new ones
        }
      },
      include: {
        pokemon: true,
      },
    });
    console.log("Updated team result:", team);

    return new NextResponse(JSON.stringify(team), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Full update error:', error);
    return new NextResponse(JSON.stringify({ error: "Internal Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// DELETE team
export async function DELETE(
  request: Request,
  { params }: { params: { teamsId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the params
    const teamId = params.teamsId;
    
    // Verify team ownership
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam || existingTeam.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Existing team:", existingTeam);
    const deletedTeam = await prisma.team.delete({
      where: { id: teamId },
    });
    console.log("Deleted team:", deletedTeam);

    // For 204 status, use NextResponse directly without json
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log(error)
    return new NextResponse("Internal Error", { status: 500 });
  }
}