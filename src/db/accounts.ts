import mongoose from "mongoose";

const accountsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  accountType: { 
    type: String, 
    required: true, 
    enum: ["personal", "business", "savings", "checking"] 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: "GBP" },
  createdAt: { type: Date, default: Date.now }
});

export const AccountsModel = mongoose.model("Account", accountsSchema);

export const getAccounts = () => AccountsModel.find();
export const getAccountById = (id: string) => AccountsModel.findById(id);
export const getAccountByUserId = (userId: string) => AccountsModel.find({ userId }).then(accounts => accounts.map(account => account.toObject()));
export const createAccount = (values: Record<string, any>) => 
  new AccountsModel(values).save().then(account => account.toObject());

export const deleteAccountById = (id: string) => AccountsModel.findByIdAndDelete(id);
export const updateAccountById = (id: string, values: Record<string, any>) => 
  AccountsModel.findByIdAndUpdate(id, values, { new: true }).then(account => account?.toObject());
export const getAccountByUserAndName = (name: string, userId: string) => 
  AccountsModel.findOne({ name, userId }).then(account => account?.toObject());