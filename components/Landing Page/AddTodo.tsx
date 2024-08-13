"use client";

// Importing necessary UI components and utilities
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/checkbox";
import { format } from "date-fns"; // Utility to format dates
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Todo } from "@/models"; // Type definition for Todo object
import { items } from "@/constants"; // Constants for days of the week or other items
import { useTodoForm } from "@/hooks/useTodoForm"; // Custom hook for managing todo form state

// Define the props for the AddTodo component
type AddTodoProps = {
  todoInfo?: Todo; // Optional todo information for editing
  type: string; // Type of operation, e.g., "add" or "edit"
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>; // Optional function to close the modal
};

// The AddTodo component
const AddTodo: React.FC<AddTodoProps> = ({ todoInfo, type, setOpen }) => {
  // Destructuring the values returned by useTodoForm hook
  const { todo, setTodo, updatedDays, handleAddOrEditTodo } = useTodoForm(
    type,
    todoInfo
  );

  // Handle form submission
  const handleSaveTodo = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior
    handleAddOrEditTodo(); // Call the function to add or edit the todo
    if (setOpen) setOpen(false); // Close the modal if setOpen is provided
  };

  console.log({ todo }); // Log the current state of the todo for debugging

  return (
    <form
      onSubmit={handleSaveTodo}
      className="flex flex-col gap-4 max-w-[75%] w-full mx-auto"
    >
      {/* // TITLE INPUT */}
      <Label htmlFor="title">Enter Your Todo Title</Label>
      <Input
        type="text"
        value={todo.title} // Controlled input value bound to todo.title
        onChange={(e) => setTodo((pre) => ({ ...pre, title: e.target.value }))} // Update title in state
        placeholder="Enter a new todo"
      />

      {/* // TYPE SELECTOR */}
      <Label htmlFor="type">Select Tracking Type</Label>
      <Select
        value={todo?.settings?.trackingType} // Controlled select value bound to trackingType
        onValueChange={(e: "daily" | "weekly") => {
          if (e) {
            setTodo((pre) => ({
              ...pre,
              settings: { ...pre.settings, trackingType: e }, // Update trackingType in state
            }));
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Tracking Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tracking Types</SelectLabel>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* BASED ON TYPE SELECTOR INPUT OR RADIO */}
      {todo?.settings?.trackingType === "weekly" ? (
        <>
          <Label htmlFor="type">Select Your Weekly Target</Label>
          <Input
            type="number"
            value={todo.settings.weeklyTarget} // Controlled input value bound to weeklyTarget
            max={7}
            min={1}
            onChange={(e) =>
              setTodo &&
              setTodo((pre) => ({
                ...pre,
                settings: { ...todo.settings, weeklyTarget: +e.target.value }, // Update weeklyTarget in state
              }))
            }
            placeholder="Weekly Target"
          />
        </>
      ) : (
        <div className="flex gap-6 flex-wrap justify-center">
          {items.map((item) => {
            return (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox
                  id={`days-${todo.id}-${item.id}`} // Unique ID for each day checkbox
                  className="hidden peer"
                  checked={todo?.settings?.scheduledDays?.[item?.id] || false} // Controlled checkbox value bound to scheduledDays
                  onCheckedChange={(checked) => {
                    setTodo((pre) => ({
                      ...pre,
                      settings: {
                        ...todo.settings,
                        scheduledDays: {
                          ...todo.settings.scheduledDays,
                          [item.id as keyof typeof todo.settings.scheduledDays]:
                            checked, // Update scheduledDays in state
                        },
                      },
                    }));
                  }}
                />
                {/* Label for each day checkbox */}
                <Label
                  className={`peer-aria-checked:border-blue-600 peer-aria-checked:text-blue-200  rounded px-4 py-2 text-sm cursor-pointer hover:scale-105 border`}
                  htmlFor={`days-${todo.id}-${item.id}`}
                >
                  {item.label}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {type === "edit" && updatedDays.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-bold text-center">
            Have you completed this task for the following dates?
          </h1>
          <div className="flex gap-4 flex-wrap justify-between">
            {updatedDays?.map((day) => {
              // Convert day to ISO string for comparison
              const dayString = format(new Date(day), "yyyy-MM-dd");

              // Check if the formatted day string is present in completedDates
              const isChecked = todo?.completedDates?.some((completedDate) => {
                const formattedCompletedDate = format(
                  new Date(completedDate),
                  "yyyy-MM-dd"
                );
                return formattedCompletedDate === dayString;
              });

              return (
                <div key={dayString} className="flex items-center">
                  <Checkbox
                    id={`completed-${todo.id}-${dayString}`} // Unique ID for each completed date checkbox
                    checked={isChecked} // Controlled checkbox value bound to completedDates
                    className="hidden peer"
                    onCheckedChange={(checked: boolean) =>
                      setTodo((pre) => {
                        const updatedCompletedDates = checked
                          ? [...pre.completedDates!, day] // Add the actual Date object to completedDates
                          : pre.completedDates!.filter(
                              (completedDate) =>
                                format(
                                  new Date(completedDate),
                                  "yyyy-MM-dd"
                                ) !== dayString
                            ); // Filter out the unchecked date

                        return {
                          ...pre,
                          completedDates: updatedCompletedDates, // Update completedDates in state
                        };
                      })
                    }
                  />
                  {/* Label for each completed date checkbox */}
                  <label
                    htmlFor={`completed-${todo.id}-${dayString}`}
                    className="peer-aria-checked:border-blue-600 peer-aria-checked:text-blue-200 rounded px-4 py-2 text-sm cursor-pointer hover:scale-105 border"
                  >
                    {format(day, "PPPPPP")}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit button for form */}
      <Button type="submit">
        {type === "edit" ? "Edit Todo" : "Add Todo"}
      </Button>
    </form>
  );
};

export default AddTodo; // Export the AddTodo component for use in other parts of the application
