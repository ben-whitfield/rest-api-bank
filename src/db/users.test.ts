import mongoose from "mongoose";
import * as users from "./users";

jest.mock("mongoose", () => {
  const actualMongoose = jest.requireActual("mongoose");
  return {
    ...actualMongoose,
    model: jest.fn(() => ({
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      save: jest.fn(),
    })),
    Schema: actualMongoose.Schema,
  };
});

describe("User DB Functions", () => {
  const mockUser = {
    _id: "user123",
    username: "testuser",
    email: "test@example.com",
    authentication: {
      password: "hashed",
      salt: "salt",
      sessionToken: "token"
    },
    createdAt: new Date(),
    toObject: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getUsers calls UserModel.find", async () => {
    const findMock = jest.fn().mockResolvedValue([mockUser]);
    (users.UserModel.find as jest.Mock) = findMock;
    const result = await users.getUsers();
    expect(findMock).toHaveBeenCalled();
    expect(result).toEqual([mockUser]);
  });

  it("getUserById calls UserModel.findById", async () => {
    const findByIdMock = jest.fn().mockResolvedValue(mockUser);
    (users.UserModel.findById as jest.Mock) = findByIdMock;
    const result = await users.getUserById("user123");
    expect(findByIdMock).toHaveBeenCalledWith("user123");
    expect(result).toEqual(mockUser);
  });

  it("getUserByUsername calls UserModel.findOne", async () => {
    const findOneMock = jest.fn().mockResolvedValue(mockUser);
    (users.UserModel.findOne as jest.Mock) = findOneMock;
    const result = await users.getUserByUsername("testuser");
    expect(findOneMock).toHaveBeenCalledWith({ username: "testuser" });
    expect(result).toEqual(mockUser);
  });

  it("getUserByEmail calls UserModel.findOne", async () => {
    const findOneMock = jest.fn().mockResolvedValue(mockUser);
    (users.UserModel.findOne as jest.Mock) = findOneMock;
    const result = await users.getUserByEmail("test@example.com");
    expect(findOneMock).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(result).toEqual(mockUser);
  });

  it("getUserBySessionToken calls UserModel.findOne", async () => {
    const findOneMock = jest.fn().mockResolvedValue(mockUser);
    (users.UserModel.findOne as jest.Mock) = findOneMock;
    const result = await users.getUserBySessionToken("token");
    expect(findOneMock).toHaveBeenCalledWith({ "authentication.sessionToken": "token" });
    expect(result).toEqual(mockUser);
  });

  it("createUser saves a new user", async () => {
  const saveMock = jest.fn().mockResolvedValue(mockUser);
  const originalUserModel = users.UserModel;
  (users.UserModel as any) = function () {
    return { save: saveMock, toObject: jest.fn().mockReturnValue(mockUser) };
  };
  const result = await users.createUser({ username: "testuser" });
  expect(saveMock).toHaveBeenCalled();
  expect(result).toEqual(mockUser);
  // Restore original UserModel after test
  (users.UserModel as any) = originalUserModel;
});

  it("deleteUserById calls UserModel.findByIdAndDelete", async () => {
    const deleteMock = jest.fn().mockResolvedValue(mockUser);
    (users.UserModel.findByIdAndDelete as jest.Mock) = deleteMock;
    const result = await users.deleteUserById("user123");
    expect(deleteMock).toHaveBeenCalledWith("user123");
    expect(result).toEqual(mockUser);
  });

  it("updateUserById calls UserModel.findByIdAndUpdate", async () => {
    const updateMock = jest.fn().mockResolvedValue(mockUser);
    (users.UserModel.findByIdAndUpdate as jest.Mock) = updateMock;
    const result = await users.updateUserById("user123", { username: "updated" });
    expect(updateMock).toHaveBeenCalledWith("user123", { username: "updated" }, { new: true});
    expect(result).toEqual(mockUser);
  });
});