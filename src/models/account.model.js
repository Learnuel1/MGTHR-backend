const { Schema, model } = require("mongoose");
const { CONSTANTS } = require("../config");

const AccountSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: CONSTANTS.USER_TYPES,
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: "employee",
    required: true
  },
  refreshToken: {
    type: [String],
  },
},
{timestamps: true}
);

const AccountModel = model("account", AccountSchema);
module.exports = AccountModel;