"use client";

import {
  areIntervalsOverlapping,
  eachHourOfInterval,
  endOfHour,
  getHours,
  isDate,
  setHours,
  startOfWeek,
} from "date-fns";
import {
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
} from "date-fns";
import ScheduleSlot from "./schedule-slot";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface Slot {
  start: Date;
  end: Date;
}

interface ScheduleProps {
  readonly start: Date;
  readonly initialData: Slot[];
}

export default function Schedule({ start, initialData = [] }: ScheduleProps) {
  const queryKey = useMemo(() => ["schedule", start.toUTCString()], [start]);

  const { data } = useQuery<Slot[]>({
    queryKey,
    initialData,
    async queryFn({ signal }) {
      const response = await fetch("/api/schedule", {
        method: "GET",
        signal,
      });
      return response.json();
    },
    select(data) {
      return data?.map(({ start, end }) => ({
        start: isDate(start) ? start : new Date(start),
        end: isDate(end) ? end : new Date(end),
      }));
    },
  });
  console.log(data);
  const startDate = startOfDay(startOfWeek(start));
  const endDate = endOfDay(endOfWeek(start));
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const hours = eachHourOfInterval({
    start: startOfDay(start),
    end: endOfDay(start),
  });

  return (
    <table className="w-full">
      <thead className="border-b-2 border-white text-left">
        <tr>
          {days.map((day) => (
            <th className="p-4" key={day.toUTCString()}>
              {format(day, "eeee")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {hours.map((hour) => {
          return (
            <tr key={hour.toISOString()}>
              {days.flatMap((day) => {
                const slotTime = setHours(day, getHours(hour));
                const isTaken = data?.some(({ start, end }) => {
                  return areIntervalsOverlapping(
                    { start, end },
                    { start: slotTime, end: endOfHour(slotTime) },
                  );
                });
                return (
                  <ScheduleSlot
                    isTaken={isTaken}
                    key={slotTime.toISOString()}
                    start={slotTime}
                    queryKey={queryKey}
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
