import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  QueryDocumentSnapshot,
  DocumentData,
  getDoc,
} from "firebase/firestore";
import db from "./firebaseConfig";
import { Todo } from "@/models";

// Firestore collection references
const todosCollection = collection(db, "todos");
const overallDataCollection = collection(db, "overallData");

// Add a new todo
export const addTodoToFirestore = async (todo: Todo) => {
  // Convert Date objects to Firestore-compatible data
  const todoData = {
    ...todo,
    createdDate: todo.createdDate.toISOString(),
    completedDates:
      todo.completedDates?.map((date) => date.toISOString()) || [],
  };
  const docRef = await addDoc(todosCollection, todoData);
  return docRef.id;
};

// Update an existing todo
export const updateTodoInFirestore = async (
  todoId: string,
  updatedTodo: Todo
) => {
  const docRef = doc(todosCollection, todoId);
  const updatedTodoData = {
    ...updatedTodo,
    createdDate: updatedTodo.createdDate.toISOString(),
    completedDates:
      updatedTodo.completedDates?.map((date) => date.toISOString()) || [],
  };
  await updateDoc(docRef, updatedTodoData);
};

// Delete a todo
export const deleteTodoFromFirestore = async (todoId: string) => {
  const docRef = doc(db, "todos", todoId);
  await deleteDoc(docRef);
};

// Get all todos
export const getTodosFromFirestore = async (): Promise<Todo[]> => {
  const querySnapshot = await getDocs(todosCollection);
  const todos: Todo[] = [];
  querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
    const data = doc.data();
    todos.push({
      id: doc.id,
      ...data,
      createdDate: new Date(data.createdDate),
      completedDates:
        data.completedDates?.map((date: string) => new Date(date)) || [],
    } as Todo);
  });
  return todos;
};

// Save or update the current date in Firestore
export const saveCurrentDateToFirestore = async (currentDate: Date) => {
  const currentDateDoc = doc(overallDataCollection, "currentDate");
  await setDoc(currentDateDoc, { date: currentDate });
};

// Get the current date from Firestore
export const getCurrentDateFromFirestore = async (): Promise<Date> => {
  const currentDateDoc = doc(overallDataCollection, "currentDate");
  const docSnapshot = await getDoc(currentDateDoc);
  if (docSnapshot.exists()) {
    const data = docSnapshot.data();
    return new Date(data.date.seconds * 1000);
  }
  return new Date(); // Default to current date if not found
};
