import mongoose from 'mongoose';
const { Schema } = mongoose;

const usersSchema = new Schema({
    name: String,
    userName: String,
    password: String,

    date: { type: Date, default: Date.now }
});

const Users = mongoose.model('Users', usersSchema);

export default Users;
