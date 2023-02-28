const { hashSync } = require("bcryptjs");
const { CONSTANTS } = require("../config");
const logger = require("../logger");
const AccountModel = require("../models/account.model");
const EmployeeModel = require("../models/employee.model");
const { ERROR_FIELD } = require("../utils/actions");
const { APIError } = require("../utils/apiError");
const { isValidEmail } = require("../utils/validation");
const buildResponse = require("../utils/responsBuilder");
const DepartmentModel = require("../models/department.model");
const ManagerModel = require("../models/manager.model");
exports.defaultAccount = async (req, res, next) => {
  try{
    const {firstName, lastName, telephone, email} = req.body;
    if(!firstName) return next(APIError.badRequest("Firstname is required"));
    if(!lastName) return next(APIError.badRequest("Lasttname is required"));
    if(!telephone) return next(APIError.badRequest("Telephone number is required"));
    if(!email) return next(APIError.badRequest("Email is required"));
    //validate email
    if(!isValidEmail(email)) return next(APIError.badRequest(`${ERROR_FIELD.INVALID_EMAIL}`));
    //check if email already exist for am employee
    const mailExist = await EmployeeModel.findOne({email}).exec();
    if(mailExist) return next(APIError.badRequest(`${email} is not available`));
    //checke if default supper accound already exist
    const superAccount = await AccountModel.findOne({role:CONSTANTS.USER_TYPES[3]});
    if(superAccount) return next(APIError.customError("Default account already exist", 403));
    //encrypt password
    const hashedPasword = hashSync(CONSTANTS.USER_PASSWORD[0],10);
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

exports.createAccount = async (req, res, next) => {
  try{
    if(!req.userRole) return next(APIError.unauthenticated());
    const {firstName, lastName, telephone, email} = req.body;
    if(!firstName) return next(APIError.badRequest("Firstname is required"));
    if(!lastName) return next(APIError.badRequest("Lasttname is required"));
    if(!telephone) return next(APIError.badRequest("Telephone number is required"));
    if(!email) return next(APIError.badRequest("Email is required"));
    //validate email
    if(!isValidEmail(email)) return next(APIError.badRequest(`${ERROR_FIELD.INVALID_EMAIL}`));
    //check if email already exist for am employee
    const mailExist = await EmployeeModel.findOne({email}).exec();
    if(mailExist) return next(APIError.badRequest(`${email} is not available`));
    //checke if default supper accound already exist
    //encrypt password
    const hashedPasword = hashSync(CONSTANTS.USER_PASSWORD[0],10);
    const user ={firstName, lastName, telephone,email, role: CONSTANTS.USER_TYPES[0], status: CONSTANTS.USER_STATUS[1], password:hashedPasword}
    //create employee
    const employee = await EmployeeModel.create({...user});
    //create account
    user.employee = employee._id;
    user.username=email;
    await AccountModel.create({...user});
    logger.info("User account created successfully", {meta: "account-service"})
    res.status(201).json({success: true, msg: "Account created successfully"});
  }catch(error) {
    next(error);
  }
}
exports.updateAccount = async (req, res, next) => {
  try{
    if(!req.userId) return next(APIError.unauthenticated());
    const details = {};
    for(const key in req.body){
      if(key !=="employeeId")
          details[key] == req.body[key];
    }
    if(!details.employeeId) return next(APIError.badRequest("Employee ID is required"));
    //validate email
    if(details.email)
      if(!isValidEmail(details.email)) return next(APIError.badRequest(`${ERROR_FIELD.INVALID_EMAIL}`));
    //check if email already exist for am employee
    const mailExist = await EmployeeModel.findOne({email:details.email}).exec();
    if(mailExist.length>=2) return next(APIError.badRequest(`${details.email} is not available`)); 
     const employee = await EmployeeModel.findOneAndUpdate({_id: details.employeeId},{...details},{returnOriginal:false});
    res.status(200).json({success: true, msg: "Account updated successfully"});
  }catch(error) {
    next(error);
  }
}
exports.getAccount = async (req, res, next ) => {
  try{
    if(!req.userId) return next(APIError.unauthenticated());
    const account = await AccountModel.findOne({_id:req.userId}).populate("employee").exec();
    if(!account) return next(APIError.customError(ERROR_FIELD.NOT_FOUND,404));
    const data = buildResponse.buildAccount(account.toObject());
    const response = buildResponse.commonReponse("Found", data, "account");
    res.status(200).json(response)
  }catch(error) {
    next(error);
  }
}
exports.getAccounts = async (req, res, next) => {
  try {
    if(!req.userId) return next(APIError.unauthenticated());
    if(req.userRole !== CONSTANTS.USER_TYPES[2] || req.userRole !== CONSTANTS.USER_TYPES[3]) return next(APIError.unauthorized());
    let accounts = await AccountModel.findOne({_id:req.userId}).populate("employee");
    console.log(accounts);
    if(req.userRole === CONSTANTS.USER_TYPES[1])
    accounts = accounts.filter(ac => ac.role !== CONSTANTS.USER_TYPES[2] || ac.role !== CONSTANTS.USER_TYPES[3]);
    if(!accounts) return next(APIError.customError(ERROR_FIELD.NOT_FOUND,404));
    const data = buildResponse.buildUser(accounts);
    const response = buildResponse.commonReponse("Found", data, "account");
    res.status(200).json(response)
  } catch (error) {
    next(error);
  }
}
exports.createDepartment = async (req, res, next ) => {
  try {
    if(!req.userRole) return next(APIError.unauthenticated());
    const {name} = req.body;
    if(!name) return next(APIError.badRequest("Department name is required"));
    const dept = await DepartmentModel.create({name, status:CONSTANTS.USER_STATUS[1]});
    res.status(201).json({success:true, msg: "Department created successfully"});
  } catch (error) {
    next(error)
  }
}
exports.getDepartment = async (res, req, next ) => {
  try {
    if(!req.userRole) return next(APIError.unauthenticated());
    const dept = await DepartmentModel.find({}).exec();
    if(!dept) return next(APIError.customError(ERROR_FIELD.NOT_FOUND,404));
    const response = buildResponse.commonReponse("Found", dept, "department");
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
exports.assignDepartment = async (req, res, next ) => {
  try {
    if(!req.userRole) return next(APIError.unauthenticated());
    const {department, employeeId} = req.body;
    if(employeeId) return next(APIError.badRequest("Employee ID is required"));
    if(!department) return next(APIError.badRequest("Department name is required"));
    const deptExist = await DepartmentModel.findOne({name: department}).exec();
    if(!deptExist) return next(APIError.customError("Department does not exist",400));
    const employeeExist = await EmployeeModel.findOne({_id:employeeId}).exec();
    if(!employeeExist) return next(APIError.customError("Employee dose not exist",400));
    employeeExist.department.push({name:deptExist.name, status:deptExist.status});
    res.status(200).json({success: true, msg: "Department assigned successfully"});
  } catch (error) {
    next(error);
  }
}
exports.createManager = async (req, res, next ) => {
  try {
    if(!req.userRole) return next(APIError.unauthenticated());
    const {employeeId, department} = req.body;
    if(employeeId) return next(APIError.badRequest("Employee ID is required"));
    if(!department) return next(APIError.badRequest("Department name is required"));
    const deptExist = await DepartmentModel.findOne({name: department}).exec();
    if(!deptExist) return next(APIError.customError("Department does not exist",400));
    const employeeExist = await EmployeeModel.findOne({_id:employeeId}).exec();
    if(!employeeExist) return next(APIError.customError("Employee dose not exist",400));
    const manager = await ManagerModel.create({employee:employeeId, depatment: deptExist._id});
    console.log(manager)
  res.status(200).json({success:true, msg: "Manager created successfully"});
  } catch (error) {
    next(error);
  }
}