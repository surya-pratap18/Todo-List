import mongoose from 'mongoose';
const { Schema } = mongoose;

const tasksSchema = new Schema({
    title: String,
    description: String,
    status: {
        type: String,
        enum: ['pending', 'in progress', 'done'],
        default: 'pending'
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },

    date: { type: Date, default: Date.now },
});

const Tasks = mongoose.model('Tasks', tasksSchema);


export default Tasks;
