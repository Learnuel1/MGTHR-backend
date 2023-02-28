const { Schema, model } = require("mongoose");

const ManagerSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "employee",
  },
  depatment: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "department",
  },
}, 
 {timestamps: true}
);
const ManagerModel = model("manager", ManagerSchema);
module.exports = ManagerModel;