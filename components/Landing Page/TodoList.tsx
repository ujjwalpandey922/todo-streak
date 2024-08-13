"use client";

import React, { useState } from "react";
import { Todo } from "@/models"; // Import the Todo model/interface
import { Button } from "../ui/button"; // Import the Button component
import { calculateStreaks } from "@/utils/streakCalculator"; // Import the streak calculation utility
import { useTodoContext } from "@/context/TodoContext"; // Import the custom hook to access Todo context
import { Edit2Icon } from "lucide-react"; // Import the Edit icon
import { MdDeleteOutline } from "react-icons/md"; // Import the Delete icon
import AddTodo from "./AddTodo"; // Import the AddTodo component
import Modal from "../ui/Modal"; // Import the Modal component
import { format } from "date-fns";

const TodoList = () => {
  // Local state to control the visibility of the edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Local state to keep track of which Todo item is currently selected for editing
  const [selectedTodoId, setSelectedTodoId] = useState("");

  // Access the global Todo state and deleteTodo function from the context
  const { state, deleteTodo } = useTodoContext();

  // Handler function to delete a Todo item by its id
  const handleDeleteTodo = (id: string) => {
    deleteTodo(id); // Call the delete function from the context
  };

  return (
    <div className="flex w-full gap-4 flex-wrap justify-around">
      {/* Loop through each Todo item in the global state */}
      {state.todos.map((todo: Todo) => {
        // Calculate the current and longest streaks for each Todo
        const { currentStreak, longestStreak } = calculateStreaks(
          todo,
          state.currentDate
        );
        return (
          <div
            key={todo.id} // Unique key for each Todo item
            className="flex flex-col gap-10 border border-gray-300 rounded-lg px-4 pt-4 w-full max-w-[49%]"
          >
            {/* Display the Todo title and action buttons */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{todo.title}</h2>
              <div className="flex gap-4">
                {/* Button to open the edit modal */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTodoId(todo.id); // Set the currently selected Todo ID
                    setEditModalOpen(true); // Open the edit modal
                  }}
                >
                  <Edit2Icon />
                </Button>
                {/* Button to delete the Todo */}
                <Button
                  variant="outline"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <MdDeleteOutline size={25} />
                </Button>
              </div>
            </div>

            {/* Display the current and longest streaks for each Todo */}
            <div className="flex gap-4">
              <span className="text-lg">
                Current Streak: <b>{currentStreak} 💪</b>
              </span>
              <span className="text-lg">
                Longest Streak: <b>{longestStreak} 🔥</b>
              </span>
              {/* Optionally, you can display additional information here */}
            </div>

            <footer className="flex gap-2 border-t border-t-white py-4">
              Created On : <span>{format(todo.createdDate, "PPPPPP")}</span>
            </footer>

            {/* Conditionally render the Edit Modal only if it's open and the current Todo is selected */}
            {editModalOpen && todo.id === selectedTodoId && (
              <Modal
                open={editModalOpen} // Control the modal's visibility
                setOpen={setEditModalOpen} // Function to close the modal
                title="Edit Todo" // Modal title
                description="Here you can edit your todo....!!!!!" // Modal description
              >
                <AddTodo
                  type="edit" // Indicate that this is an edit operation
                  todoInfo={todo} // Pass the current Todo information to the form
                  setOpen={setEditModalOpen} // Pass the function to close the modal after editing
                />
              </Modal>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TodoList;
