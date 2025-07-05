import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Home() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [editedTodoText, setEditedTodoText] = useState("");
  const [editedDueDate, setEditedDueDate] = useState(null);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await axios.get("http://localhost:4001/todo/fetch", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTodos(res.data.todoList);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch todos");
      }
    };

    fetchTodos();
  }, [navigate]);

  const createTodo = async () => {
    try {
      if (!newTodo) return;

      const res = await axios.post(
        "http://localhost:4001/todo/create",
        {
          text: newTodo,
          dueDate: dueDate ? dueDate.toISOString() : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTodos([...todos, res.data.todo]);
      setNewTodo("");
      setDueDate(null);
    } catch (err) {
      setError(err.response?.data?.message || "Create failed");
    }
  };

  const updateTodoStatus = async (id) => {
    try {
      const todo = todos.find((t) => t._id === id);
      const res = await axios.put(
        `http://localhost:4001/todo/update/${id}`,
        { ...todo, isComplete: !todo.isComplete },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTodos(todos.map((t) => (t._id === id ? res.data.todo : t)));
    } catch (err) {
      setError(err.response?.data?.message || "Update status failed");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:4001/todo/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const updateTodo = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:4001/todo/update/${id}`,
        {
          text: editedTodoText,
          dueDate: editedDueDate ? editedDueDate.toISOString() : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTodos(todos.map((t) => (t._id === id ? res.data.todo : t)));
      setEditingTodoId(null);
      setEditedTodoText("");
      setEditedDueDate(null);
    } catch (err) {
      setError(err.response?.data?.message || "Edit failed");
    }
  };

  const logout = async () => {
    try {
      await axios.get("http://localhost:4001/user/logout");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      setError("Logout failed");
    }
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDueStyle = (dateString) => {
    if (!dateString) return {};
    const now = new Date();
    const due = new Date(dateString);
    const diff = due - now;
    if (diff < 0) return { color: "red" };
    if (diff < 86400000) return { color: "orange" };
    return { color: "green" };
  };

  const remaining = todos.filter((t) => !t.isComplete).length;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-5">
      <h1 className="text-2xl font-bold text-center mb-4">Todo Manager</h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Add a todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          placeholderText="Due Date"
          className="p-2 border rounded"
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMM d, yyyy h:mm aa"
          minDate={new Date()}
        />
        <button
          onClick={createTodo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="p-3 bg-gray-100 rounded flex flex-col sm:flex-row justify-between"
          >
            <div className="flex items-start gap-2 flex-grow">
              <input
                type="checkbox"
                checked={todo.isComplete}
                onChange={() => updateTodoStatus(todo._id)}
              />
              {editingTodoId === todo._id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editedTodoText}
                    onChange={(e) => setEditedTodoText(e.target.value)}
                    className="p-1 border rounded"
                  />
                  <DatePicker
                    selected={editedDueDate}
                    onChange={(date) => setEditedDueDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    className="p-1 border rounded"
                  />
                </div>
              ) : (
                <div>
                  <span
                    className={`block ${
                      todo.isComplete ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.text}
                  </span>
                  {todo.dueDate && (
                    <span style={getDueStyle(todo.dueDate)} className="text-sm">
                      Due: {formatDueDate(todo.dueDate)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-2">
              {editingTodoId === todo._id ? (
                <button
                  onClick={() => updateTodo(todo._id)}
                  className="text-green-600"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingTodoId(todo._id);
                    setEditedTodoText(todo.text);
                    setEditedDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
                  }}
                  className="text-yellow-600"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => deleteTodo(todo._id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">{remaining} tasks remaining</p>
        <button
          onClick={logout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}

export default Home;
