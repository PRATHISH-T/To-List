import TodoModel from "../model/todo.model.js";

export const createTodo = async (req, res) => {
    const todo = new TodoModel({
        text: req.body.text,
        isComplete: false,
        dueDate: req.body.dueDate || null, // Add dueDate from request
        user: req.user
    });

    try {
        const newTodo = await todo.save();
        res.status(201).json({ 
            message: "Todo created successfully", 
            todo: newTodo 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error in todo creation",
            error: error.message 
        });
    }
};

// Update getTodoList to sort by dueDate
export const getTodoList = async (req, res) => {
    try {
        const todoList = await TodoModel.find({ user: req.user })
                                      .sort({ dueDate: 1 }); // Sort by dueDate (ascending)
        res.status(200).json({ 
            message: "Todo list fetched successfully", 
            todoList 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching todo list",
            error: error.message 
        });
    }
};

// Update updateTodo to handle dueDate
export const updateTodo = async (req, res) => {
    try {
        const updateData = {
            text: req.body.text,
            isComplete: req.body.isComplete,
            ...(req.body.dueDate && { dueDate: req.body.dueDate }) // Update dueDate if provided
        };

        const updatedTodo = await TodoModel.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        
        res.status(200).json({ 
            message: "Todo updated successfully", 
            todo: updatedTodo 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error updating todo",
            error: error.message 
        });
    }
};
export const deleteTodo = async (req, res) => {
    try {
        const todo = await TodoModel.findByIdAndDelete(req.params.id);
        if(!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json({ message: "Todo updated successfully", todo});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in fetching todo list", todo});
    }
};