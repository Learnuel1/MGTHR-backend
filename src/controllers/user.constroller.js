const { hashSync } = require("bcryptjs");
const { CONSTANTS } = require("../config");
const logger = require("../logger");
const AccountModel = require("../models/account.model");
const EmployeeModel = require("../models/employee.model");
const { ERROR_FIELD, META } = require("../utils/actions");
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
      details[key] = req.body[key];
    }
    details.id=req.userId;
    //validate email
    if(details.email){
      if(!isValidEmail(details.email)) return next(APIError.badRequest(`${ERROR_FIELD.INVALID_EMAIL}`));
      //check if email already exist for am employee
      const mailExist = await EmployeeModel.findOne({email:details.email}).exec();
      if(mailExist?.length>=2) return next(APIError.badRequest(`${details.email} is not available`)); 
    }
    const findUser = await AccountModel.findOne({_id:details.id}).exec();
    if(!findUser) return next(APIError.customError(ERROR_FIELD.NOT_FOUND,400));
     const employee = await EmployeeModel.findOneAndUpdate({_id: findUser.employee},{...details},{returnOriginal:false});
     if(!employee) return next(APIError.customError(ERROR_FIELD.NOT_FOUND,400));
    logger.info("Account updated successfully",{meta:META.ACCOUNT_SEVICE});
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
    logger.info("Account retrieved successfully",{meta:META.ACCOUNT_SEVICE});
    res.status(200).json(response)
  }catch(error) {
    next(error);
  }
}
exports.getAccounts = async (req, res, next) => {
  try {
    if(!req.userId) return next(APIError.unauthenticated());
    if(req.userRole.toLowerCase() !== CONSTANTS.USER_TYPES[2] && req.userRole.toLowerCase() !== CONSTANTS.USER_TYPES[3])    
      return next(APIError.unauthorized());
    let accounts = await AccountModel.find({}).populate("employee");
    if(req.userRole.toLowerCase() === CONSTANTS.USER_TYPES[1])
       accounts = accounts.filter(ac => ac.role !== CONSTANTS.USER_TYPES[2] || ac.role !== CONSTANTS.USER_TYPES[3]);
    if(!accounts) return next(APIError.customError(ERROR_FIELD.NOT_FOUND,404));
    const data = accounts.map((cur) => { 
    return  buildResponse.buildAccount(cur.toObject());
    })
    const response = buildResponse.commonReponse("Found", data, "account");
    logger.info("Accounts retrieved successfully",{meta:META.ACCOUNT_SEVICE});
    res.status(200).json(response)
  } catch (error) {
    next(error);
  }
}
exports.createDepartment = async (req, res, next ) => {
  try {
    if(!req.userRole) return next(APIError.unauthenticated());
    const {name,manager} = req.body;
    if(!name) return next(APIError.badRequest("Department name is required"));
    if(!manager) return next(APIError.badRequest("Department manager is required"));
   const dept = await DepartmentModel.create({name,status:CONSTANTS.USER_STATUS[1]});
   const deptManager = await ManagerModel.create({
      depatment:dept._id,
      employee:manager
   })
    logger.info("Department created successfully",{meta:META.ACCOUNT_SEVICE});
    res.status(201).json({success:true, msg: "Department created successfully"});
  } catch (error) {
    next(error)
  }
}
exports.updateDepartment = async (req, res, next ) => {
  try {
    if(!req.userRole) return next(APIError.unauthenticated());
    const details= {};
    for(const key in req.body){
      if(key.toLowerCase() !=='deptid')
        details[key] = req.body[key];
    }
    if(!req.body.deptId) return next(APIError.badRequest("Department ID is required"));
    if(details.status){
      if(!CONSTANTS.USER_STATUS.includes(details.status)) return next(APIError.badRequest("Invalid status data"));
    }
    await DepartmentModel.findOneAndUpdate({_id:req.body.deptId},{...details},{returnOriginal: false});
    if(details.manager){
       await ManagerModel.findOneAndUpdate({
        depatment:req.body.deptId,
        employee:details.manager
     })
    }
    logger.info("Department created successfully",{meta:META.ACCOUNT_SEVICE});
    res.status(201).json({success:true, msg: "Department created successfully"});
  } catch (error) {
    next(error)
  }
}
exports.getDepartment = async (req, res, next ) => {
  try {
    if(!req.userRole) return next(APIError.unauthenticated());
    const dept = await DepartmentModel.find({}).exec();
    if(!dept || dept.length === 0) return next(APIError.customError(ERROR_FIELD.NOT_FOUND,404));
    const data = dept.map((cur) => {
      return buildResponse.buildDepartment(cur.toObject());
    })
    const response = buildResponse.commonReponse("Found", data, "department");
    logger.info("Department retrieved successfully",{meta:META.ACCOUNT_SEVICE});
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
    logger.info("Department assiged successfully",{meta:META.ACCOUNT_SEVICE});
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
    logger.info("Manager created successfully",{meta:META.ACCOUNT_SEVICE});
  res.status(200).json({success:true, msg: "Manager created successfully"});
  } catch (error) {
    next(error);
  }
}