"use client";
import { useState, useEffect } from "react";
import { Todo } from "@/models";
import { useTodoContext } from "@/context/TodoContext";
import { getDatesBetween } from "@/utils/getDaysInbetween";

export const useTodoForm = (type: string, todoInfo?: Todo) => {
  const [todo, setTodo] = useState<Todo>({
    id: "",
    createdDate: new Date(),
    title: "",
    completedDates: [],
    settings: {
      trackingType: "daily",
      weeklyTarget: 1,
      scheduledDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
    },
  });
  const [updatedDays, setUpdatedDays] = useState([] as Date[]);
  const { state, addTodo, updateTodo } = useTodoContext();

  useEffect(() => {
    if (type === "edit" && todoInfo) {
      setTodo({ ...todoInfo });
    }
  }, [type, todoInfo]);

  useEffect(() => {
    if (type === "edit" && todo.id) {
      const updatedDays = getDatesBetween(
        todo.createdDate,
        state.currentDate,
        todo.settings.scheduledDays,
        todo.settings.trackingType
      );
      setUpdatedDays(updatedDays);
    }
  }, [todo, state.currentDate]);

  const handleAddOrEditTodo = () => {
    if (todo.title.trim()) {
      const newTodo = {
        ...todo,
        id: Date.now().toString(),
        createdDate: state.currentDate,
        completedDates: [],
      };

      if (type === "add") {
        addTodo(newTodo);
      } else if (type === "edit") {
        updateTodo(todo);
      }

      // Clear the input field after adding or editing
      setTodo({
        id: "",
        createdDate: new Date(),
        title: "",
        completedDates: [],
        settings: {
          trackingType: "daily",
          weeklyTarget: 1,
          scheduledDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          },
        },
      });
    }
  };

  return { todo, setTodo, updatedDays, handleAddOrEditTodo };
};
