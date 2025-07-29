import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^01\d{6}$/,
  },
  sortCode: {
    type: String,
    required: true,
    enum: ["10-10-10"],
    default: "10-10-10",
  },
  name: { type: String, required: true },
  accountType: { type: String, required: true, enum: ["personal", "business"] },
  balance: { type: Number, required: true, min: 0.0, max: 10000.0, default: 0.0 },
  currency: { type: String, required: true, enum: ["GBP"], default: "GBP" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdTimestamp: { type: Date, default: Date.now },
  updatedTimestamp: { type: Date, default: Date.now },
});

export const AccountModel = mongoose.model("Account", accountSchema);

export const createAccount = (values: Record<string, any>) =>
  new AccountModel(values).save().then(acc => acc.toObject());

export const getAccounts = (userId: string) =>
  AccountModel.find({ userId }).then(accs => accs.map(acc => acc.toObject()));

export const getAccountByNumber = (accountNumber: string) =>
  AccountModel.findOne({ accountNumber });

export const updateAccountByNumber = (accountNumber: string, values: Record<string, any>) =>
  AccountModel.findOneAndUpdate({ accountNumber }, values, { new: true }).then(acc => acc?.toObject());

export const deleteAccountByNumber = (accountNumber: string) =>
  AccountModel.findOneAndDelete({ accountNumber });