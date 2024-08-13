// SINGLE TODO MODEL
export interface Todo {
  id: string;
  title: string;
  settings: UserSettings;
  createdDate: Date;
  completedDates?: Date[];
}
// Each Todo has a title, settings, createdDate, and completedDates.
export interface UserSettings {
  trackingType: "daily" | "weekly";
  weeklyTarget?: number;
  scheduledDays?: { [key: string]: boolean };
}
// Define the structure of the application state
export interface State {
  todos: Todo[]; // Array of Todo items
  currentDate: Date; // Current selected date
}
export interface TodoContextType {
  state: State; // Application state
  dispatch: React.Dispatch<Action>; // Function to dispatch actions
  addTodo: (todo: Todo) => Promise<void>; // Function to add a new Todo
  updateTodo: (todo: Todo) => Promise<void>; // Function to update an existing Todo
  deleteTodo: (id: string) => Promise<void>; // Function to delete a Todo by its ID
  updateCurrentDate: (date: Date) => Promise<void>; // Function to update the current date
}

export type Action =
  | { type: "ADD_TODO"; payload: Todo }
  | {
      type: "UPDATE_TODO";
      payload: Todo;
    }
  | { type: "DELETE_TODO"; payload: string }
  | { type: "FETCH_TODOS"; payload: Todo[] }
  | { type: "UPDATE_CURRENT_DATE"; payload: Date }
  | { type: "FETCH_CURRENT_DATE"; payload: Date };
