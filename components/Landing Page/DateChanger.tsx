"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTodoContext } from "@/context/TodoContext";

const DateChanger = () => {
  // Local state to manage the selected date NEEDED BY DEFAULT BY SHADCN
  const [date, setDate] = React.useState<Date>(new Date());

  // Access the current date from the global context and the function to update it
  const { state, updateCurrentDate } = useTodoContext();

  // Sync the local date state with the global state whenever the global state changes
  React.useEffect(() => {
    setDate(state.currentDate); // Update the local date to match the global state
  }, [state.currentDate]);

  return (
    <Popover>
      {/* PopoverTrigger is the button that opens the date picker */}
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full max-w-[270px] justify-start text-left font-normal",
            !date && "text-muted-foreground" // Add muted style if no date is selected
          )}
        >
          {/* Icon displayed on the button */}
          <CalendarIcon className="mr-2 h-4 w-4" />
          {/* Display the selected date or a placeholder if no date is selected */}
          {date ? format(date, "PPPPPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>

      {/* PopoverContent contains the calendar date picker */}
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single" // Calendar mode for selecting a single date
          selected={date} // The currently selected date
          onDayClick={(day) => {
            setDate(day); // Update the local state with the new date
            updateCurrentDate(day); // Persist the selected date to Firestore and update the global state
          }}
          initialFocus // Automatically focus the calendar when it opens
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateChanger;
