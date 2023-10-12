import { client } from "@/prisma-client";
import { startOfWeek, endOfWeek, endOfDay } from "date-fns";
import { Schedule } from "@/components";

export default async function SchedulePage() {
  const schedule = await client.event.findMany({
    select: {
      start: true,
      end: true,
    },
    where: {
      start: {
        gte: startOfWeek(new Date()),
        lte: endOfDay(endOfWeek(new Date())),
      },
    },
  });

  return <Schedule initialData={schedule} start={new Date()} />;
}
