import TodoList from "./TodoList";
import DateChanger from "./DateChanger";
import AddTodo from "./AddTodo";

const LandingPage = () => {
  return (
    <div className="flex flex-col gap-4 mt-8 w-full max-w-4xl rounded-lg border border-blue-500 p-4 z-50 bg-black bg-opacity-50 backdrop-blur-lg">
      {/* HEADER */}
      <header className="flex justify-between w-full">
        <h1 className="text-3xl font-bold underline">Todo Streak App</h1>
        <DateChanger />
      </header>
      {/* ADD TODO INPUT */}
      <AddTodo type="add" />
      {/* TODO LIST DISPLAY*/}
      <TodoList />
    </div>
  );
};

export default LandingPage;
