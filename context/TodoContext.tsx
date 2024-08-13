"use client";

import React, { createContext, useReducer, useContext, useEffect } from "react";
import { Action, State, Todo, TodoContextType } from "@/models"; // Importing Action and Todo types
import {
  addTodoToFirestore,
  deleteTodoFromFirestore,
  getCurrentDateFromFirestore,
  getTodosFromFirestore,
  saveCurrentDateToFirestore,
  updateTodoInFirestore,
} from "@/utils/firebaseFunctions"; // Importing Firestore-related functions

// Initial state with empty Todo list and current date set to today
const initialState: State = {
  todos: [],
  currentDate: new Date(),
};

// Create the TodoContext with default values
const TodoContext = createContext<TodoContextType>({
  state: initialState, // Default state
  dispatch: () => null, // Default dispatch function
  addTodo: async () => {}, // Default addTodo function
  updateTodo: async () => {}, // Default updateTodo function
  deleteTodo: async () => {}, // Default deleteTodo function
  updateCurrentDate: async () => {}, // Default updateCurrentDate function
});

// Reducer function to handle state changes based on dispatched actions
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [...state.todos, action.payload], // Add new Todo to the state
      };

    case "UPDATE_TODO":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id ? action.payload : todo
        ), // Update existing Todo in the state
      };

    case "DELETE_TODO":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload), // Remove Todo from the state
      };

    case "FETCH_TODOS":
      return {
        ...state,
        todos: action.payload, // Fetch and set Todos from Firestore
      };

    case "UPDATE_CURRENT_DATE":
      return {
        ...state,
        currentDate: action.payload, // Update the current date in the state
      };

    default:
      return state; // Return the current state if no action is matched
  }
};

// Provider component to wrap the application and provide context
export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState); // UseReducer hook to manage state with reducer

  // useEffect hook to fetch initial data (current date and Todos) from Firestore when the component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      const currentDate = await getCurrentDateFromFirestore(); // Fetch current date
      dispatch({ type: "UPDATE_CURRENT_DATE", payload: currentDate }); // Update state with fetched date

      const todos = await getTodosFromFirestore(); // Fetch Todos
      dispatch({ type: "FETCH_TODOS", payload: todos }); // Update state with fetched Todos
    };

    fetchInitialData(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs only once

  // Function to add a new Todo to Firestore and update the state
  const addTodo = async (todo: Todo) => {
    const newTodoId = await addTodoToFirestore(todo); // Add Todo to Firestore and get its new ID
    const updatedTodo = { ...todo, id: newTodoId }; // Update Todo with the new ID
    await updateTodoInFirestore(newTodoId, updatedTodo); // Ensure the updated Todo is saved in Firestore
    dispatch({ type: "ADD_TODO", payload: updatedTodo }); // Dispatch action to update state
  };

  // Function to update an existing Todo in Firestore and update the state
  const updateTodo = async (todo: Todo) => {
    await updateTodoInFirestore(todo.id, todo); // Update Todo in Firestore
    dispatch({ type: "UPDATE_TODO", payload: todo }); // Dispatch action to update state
  };

  // Function to delete a Todo from Firestore and update the state
  const deleteTodo = async (id: string) => {
    await deleteTodoFromFirestore(id); // Delete Todo from Firestore
    dispatch({ type: "DELETE_TODO", payload: id }); // Dispatch action to update state
  };

  // Function to update the current date in Firestore and update the state
  const updateCurrentDate = async (date: Date) => {
    await saveCurrentDateToFirestore(date); // Save current date to Firestore
    dispatch({ type: "UPDATE_CURRENT_DATE", payload: date }); // Dispatch action to update state
  };

  // Return the context provider with the state, dispatch, and CRUD functions as the value
  return (
    <TodoContext.Provider
      value={{
        state, // Current application state
        dispatch, // Dispatch function
        addTodo, // Function to add Todo
        updateTodo, // Function to update Todo
        deleteTodo, // Function to delete Todo
        updateCurrentDate, // Function to update the current date
      }}
    >
      {children} {/* Render the children components */}
    </TodoContext.Provider>
  );
};

// Custom hook to access the Todo context easily
export const useTodoContext = () => useContext(TodoContext);
