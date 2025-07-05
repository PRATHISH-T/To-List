import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    isComplete: {
        type: Boolean,
        default: false,
        required: true
    },
    dueDate: {  // Add this new field
        type: Date,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const TodoModel = mongoose.model(`todo`, todoSchema);
export default TodoModel;