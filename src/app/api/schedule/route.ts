import { client } from "@/prisma-client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { endOfHour, startOfWeek, endOfDay, endOfWeek } from "date-fns";

export async function GET() {
  const now = new Date();
  const schedule = await client.event.findMany({
    select: {
      start: true,
      end: true,
    },
    where: {
      start: {
        gte: startOfWeek(now),
        lte: endOfDay(endOfWeek(now)),
      },
    },
  });
  return NextResponse.json(schedule);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.redirect("/api/auth/signin");
  }

  const body = await request.json();
  if (!body.start) {
    return NextResponse.json({ message: "Start is missing" });
  }

  const startTime = new Date(body.start);

  await client.event.create({
    data: {
      userId: session?.user?.id as string,
      start: startTime,
      end: endOfHour(startTime),
    },
  });
  return NextResponse.json({});
}
