'use client';

import React, { useState } from 'react';
import { Todo } from '@/models';
import { Button } from '../ui/button';
import { calculateStreaks } from '@/utils/streakCalculator';
import { useTodoContext } from '@/context/TodoContext';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import AddTodo from './AddTodo';
import Modal from '../ui/Modal';
import { format } from 'date-fns';

const TodoList = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState('');

  const { state, deleteTodo } = useTodoContext();

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
  };

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {state.todos.map((todo: Todo) => {
        const { currentStreak, longestStreak } = calculateStreaks(
          todo,
          state.currentDate
        );

        return (
          <div
            key={todo.id}
            className="flex flex-col gap-6 border border-gray-300 rounded-lg px-4 pt-4 pb-2 w-full bg-black/40 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl md:text-2xl font-bold break-words">
                {todo.title}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSelectedTodoId(todo.id);
                    setEditModalOpen(true);
                  }}
                >
                  <Edit2Icon size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <MdDeleteOutline size={20} />
                </Button>
              </div>
            </div>

            {/* Streaks */}
            <div className="flex flex-col  gap-2 sm:gap-6">
              <span className="text-base block w-full md:text-lg">
                Current Streak: <b className="ml-2 ">{currentStreak} 💪</b>
              </span>
              <span className="text-base md:text-lg">
                Longest Streak: <b className="ml-2 ">{longestStreak} 🔥</b>
              </span>
            </div>

            {/* Footer */}
            <footer className="flex flex-wrap gap-1 border-t border-t-gray-500 py-2 text-sm sm:text-base">
              <span>Created On:</span>
              <span className="font-medium">
                {format(todo.createdDate, 'PPP')}
              </span>
            </footer>

            {/* Edit Modal */}
            {editModalOpen && todo.id === selectedTodoId && (
              <Modal
                open={editModalOpen}
                setOpen={setEditModalOpen}
                title="Edit Todo"
                description="Here you can edit your todo....!!!!!"
              >
                <AddTodo
                  type="edit"
                  todoInfo={todo}
                  setOpen={setEditModalOpen}
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
