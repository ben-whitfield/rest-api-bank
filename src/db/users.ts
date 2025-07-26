import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false },
    sessionToken: { type: String, select: false }
  },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model("User", userSchema);

export const getUsers = () => UserModel.find();
export const getUserById = (id: string) => UserModel.findById(id);
export const getUserByUsername = (username: string) => UserModel.findOne({ username });
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUserBySessionToken = (sessionToken: string) => 
  UserModel.findOne({ "authentication.sessionToken": sessionToken });

export const createUser = (values: Record<string, any>) => 
  new UserModel(values).save().then(
    (user) => user.toObject()
  ); 

export const deleteUserById = (id: string) => UserModel.findByIdAndDelete(id);

export const updateUserById = (id: string, values: Record<string, any>) => 
  UserModel.findByIdAndUpdate(id, values, { new: true }).then(
    (user) => user.toObject()
  );