import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount: { 
    type: Number,
    required: true,
    min: 0.00,
    max: 10000.00,
  },
  currency: {
    type: String,
    required: true,
    enum: ["GBP"],
  },
  type: {
    type: String,
    required: true,
    enum: ["deposit", "withdrawal"],
  },
  reference: {
    type: String,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdTimestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
});

export const TransactionModel = mongoose.model("Transaction", transactionSchema);

export const createTransaction = (values: Record<string, any>) =>
  new TransactionModel(values).save().then(tx => tx.toObject());

export const getTransactionsByAccount = (accountId: string) =>
  TransactionModel.find({ accountId }).then(txs => txs.map(tx => tx.toObject()));

export const getTransactionById = (id: string) => TransactionModel.findById(id);