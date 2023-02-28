const { Schema, model } = require("mongoose");
const { CONSTANTS } = require("../config");

const DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  status: {
    type: String,
    enum: CONSTANTS.USER_STATUS,
    required: true,
    default: CONSTANTS.USER_STATUS[1],
  },
},
  {timestamps: true}
);

const DepartmentModel = model("Department", DepartmentSchema);
module.exports = DepartmentModel;