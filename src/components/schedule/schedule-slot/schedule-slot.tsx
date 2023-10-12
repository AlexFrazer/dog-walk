"use client";

import Button from "@/components/button/button";
import { Event } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { areIntervalsOverlapping, endOfDay, endOfHour, format } from "date-fns";
import { useCallback } from "react";

interface ScheduleSlotProps {
  start: Date;
  isTaken: boolean;
  queryKey: string[];
}

export default function ScheduleSlot({
  start,
  isTaken,
  queryKey,
}: ScheduleSlotProps) {
  const client = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationKey: ["schedule", start.toUTCString()],
    async mutationFn() {
      return fetch("/api/schedule", {
        method: "POST",
        body: JSON.stringify({
          start,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onMutate() {
      const currentCache =
        client.getQueryData<Pick<Event, "start" | "end">[]>(queryKey) ?? [];
      const updated = currentCache?.push({
        start,
        end: endOfHour(start),
      });
      client.setQueryData(queryKey, updated);
    },
    onSuccess() {
      client.invalidateQueries(queryKey);
    },
    onError() {
      const currentCache =
        client.getQueryData<Pick<Event, "start" | "end">[]>(queryKey) ?? [];
      const index = currentCache.findIndex((item) =>
        areIntervalsOverlapping(item, { start, end: endOfDay(start) }),
      );
      if (index > -1) {
        currentCache.splice(index, 1);
      }
      client.setQueryData(queryKey, currentCache);
    },
  });

  const onClick = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <td className="p-4 border-r-2 border-white">
      <div className="flex justify-between items-center flex-grow flex-shrink-0">
        <time dateTime={start.toUTCString()}>{format(start, "hh:mm")}</time>
        <Button
          size="sm"
          onClick={onClick}
          isLoading={isLoading}
          disabled={isTaken}
          loadingText="Creating reservation..."
        >
          {isTaken ? "Unavailable" : "Reserve"}
        </Button>
      </div>
    </td>
  );
}
