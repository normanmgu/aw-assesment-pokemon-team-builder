import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Use to create a team
export async function POST(request: Request) {
  try {
    
    // Determin user authentication state
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", {status: 401})
    }

    const body = await request.json()
    const { name, pokemon } = body;    

    const team = await prisma.team.create({
      data: {
        name,
        userId: session.user.id,
        pokemon: {
          create: pokemon.map((p: any) => ({
            id: p.id,
            name: p.name,
            sprite: p.sprite,
            types: p.types,
          }))
        }
      },
      include: {
        pokemon: true,
      }
    })

    return NextResponse.json(team);

  } catch(error) {
    return new NextResponse("Internal Error", { status: 500})
  }
}

// Used to read all teams
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const teams = await prisma.team.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        pokemon: true,
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}