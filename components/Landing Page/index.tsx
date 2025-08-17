import TodoList from './TodoList';
import DateChanger from './DateChanger';
import AddTodo from './AddTodo';

const LandingPage = () => {
  return (
    <div
      className="flex flex-col gap-12 mt-4 w-full max-w-4xl rounded-lg border border-blue-500 p-4 z-50 bg-black bg-opacity-50 backdrop-blur-lg 
      sm:mt-6 sm:p-6 md:mt-8 md:p-8"
    >
      {/* HEADER */}
      <header className="flex flex-col gap-2 items-start sm:flex-row sm:items-center sm:justify-between w-full">
        <h1 className="text-2xl sm:text-3xl font-bold  text-center sm:text-left">
          Todo Streak App
        </h1>
        <DateChanger />
      </header>

      {/* ADD TODO INPUT */}
      <AddTodo type="add" />

      {/* TODO LIST DISPLAY */}
      <TodoList />
    </div>
  );
};

export default LandingPage;
