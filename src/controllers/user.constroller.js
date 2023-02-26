const { hashSync } = require("bcryptjs");
const { CONSTANTS } = require("../config");
const logger = require("../logger");
const AccountModel = require("../models/account.model");
const EmployeeModel = require("../models/employee.model");
const { ERROR_FIELD } = require("../utils/actions");
const { APIError } = require("../utils/apiError");
const { isValidEmail } = require("../utils/validation");

exports.defaultAccount = async (req, res, next) => {
  try{
    const {firstName, lastName, telephone, email, password} = req.body;
    if(!firstName) return next(APIError.badRequest("Firstname is required"));
    if(!lastName) return next(APIError.badRequest("Lasttname is required"));
    if(!telephone) return next(APIError.badRequest("Telephone number is required"));
    if(!email) return next(APIError.badRequest("Email is required"));
    if(!password) return next(APIError.badRequest("Password is required"));
    //validate email
    if(!isValidEmail(email)) return next(APIError.badRequest(`${ERROR_FIELD.INVALID_EMAIL}`));
    //check if email already exist for am employee
    const mailExist = await EmployeeModel.findOne({email}).exec();
    if(mailExist) return next(APIError.badRequest(`${email} is not available`));
    //checke if default supper accound already exist
    const superAccount = await AccountModel.findOne({role:CONSTANTS.USER_TYPES[3]});
    if(superAccount) return next(APIError.customError("Default account already exist", 403));
    //encrypt password
    const hashedPasword = hashSync(password,10);
    //create employee
    const employee = await EmployeeModel.create({
      firstName,
      lastName,
      telephone,
      email,
    });
    //create account
    await AccountModel.create({
      username: email,
      password: hashedPasword,
      employee: employee._id,
      role: CONSTANTS.USER_TYPES[3]
    });
    logger.info("Default account created successfully", {meta: "account-service"})
    res.status(201).json({success: true, msg: "Account created successfully"});
  }catch(error) {
    next(error);
  }
}