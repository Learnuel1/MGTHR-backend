const { Schema, model } = require("mongoose");
const { CONSTANTS } = require("../config");

const EmployeeSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: "manager",
  },
  status: {
    type: String,
    required: true,
    enum: CONSTANTS.USER_STATUS,
    default: CONSTANTS.USER_STATUS[1],
  },
},
  {timestamps: true}
);
const EmployeeModel = model("employee", EmployeeSchema);
module.exports = EmployeeModel;