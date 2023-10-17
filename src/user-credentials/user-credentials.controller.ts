import { Controller,Post,Body,Headers, UseInterceptors, UploadedFile,UseGuards } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'
import {MongoService} from 'src/function/mongodb.service'
import {BcryptService} from 'src/function/bcrypt.service'
import {VerifyService} from 'src/function/verify.service'
import { JwtMiddleware } from 'src/middlewares/jwt.middleware';
import { S3Service } from "src/function/s3.service";
import { ApiTags, ApiResponse, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_NAMES,ERROR_MESSAGES,SUCCESS_MESSAGES,JWT_KEY,DATABASE_NAME, BUCKET_NAME } from "utils/config";
import { FileInterceptor } from "@nestjs/platform-express";


@ApiTags('User Credentials')
@Controller('user-credentials')
export class UserCredentialsController{
   constructor(
    private readonly mongoService:MongoService,
    private readonly verifyService:VerifyService,
    private readonly bcryptService:BcryptService,
    private readonly s3Service:S3Service
   ){}
   
  @ApiOperation({ summary: 'Send OTP to the user' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Failed to send OTP' })
  @Post('send-otp')
  async sendOTP(@Body() userData: any) {
    try {
      //   const otpResponse=await this.verifyService.sendOTP(userData.phoneNumber);
      if (!true) {
        return {
          statusCode:200,
          message: ERROR_MESSAGES.OTP_SEND_UNSUCCESSFULL,
        };
      }
      return {
        statusCode:200,
        message: SUCCESS_MESSAGES.OTP_SEND_SUCCESSFULL,
      };
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 200, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Missing OTP Parameter' })
  @ApiResponse({ status: 402, description: 'OTP Verification Failed' })
  @ApiResponse({ status: 403, description: 'User Creation Failed' })
  @ApiResponse({ status: 404, description: 'Internal Server Error' })
  @Post()
  async register(@Body() reqBody: any){
    try {
      const {otp,password,confirmPassword,phoneNumber,...userWithoutOTP}=reqBody;
      const isUserExist=await this.mongoService.getItem(TABLE_NAMES.USER_CREDENTIALS,reqBody.phoneNumber)
      if(isUserExist){
        return{
          statusCode:400,
          message:ERROR_MESSAGES.USER_EXISTS
        }
      }
      if(otp.length<6){
        return{
          statusCode:401,
          message:ERROR_MESSAGES.MISSING_OTP_PARAMETER
        }
      }
      const verifyResponse=await this.verifyService.verifyDefault(reqBody.phoneNumber,otp);
      if(verifyResponse===false){
        return{
          statusCode:402,
          message:ERROR_MESSAGES.OTP_VERIFICATION_FAILED
        }
      }
      if(password!==confirmPassword){
        return{
          statusCode:406,
          message:ERROR_MESSAGES.PASSWORD_NOT_MATCHED
        }
      }
      const hashedPassword=await this.bcryptService.hashPassword(password);
      const uid=uuidv4().toString();
      const userItem={
        ...userWithoutOTP,
        password:hashedPassword,
        phoneNumber:phoneNumber,
        status:'pending',
        userType:'user',
        adminId:'',
        timestamp:new Date().toISOString()
      }
      const createUserResponse=await this.mongoService.createItem(TABLE_NAMES.USER_CREDENTIALS,userItem)
      if(!createUserResponse){
        return{
          statusCode:403,
          message:ERROR_MESSAGES.USER_CREATION_FAILED
        }
      }
      const accountNumber=this.generateAccountNumber()
      const walletItem={
        uid,
        balance:0,
        accountNumber
      }
      const createWalletResponse=await this.mongoService.createItem(TABLE_NAMES.WALLET_TABLE,walletItem)
      if(!createUserResponse){
        return{
          statusCode:405,
          message:ERROR_MESSAGES.WALLET_CREATION_FAILED
        }
      }
      const payload={
        userItem
      }
      const token=jwt.sign(payload,JWT_KEY,{expiresIn:'8h'})
      return{
        statusCode:200,
        token,
        userResponse:SUCCESS_MESSAGES.USER_CREATED_SUCCESS,
        walletResponse:SUCCESS_MESSAGES.WALLET_CREATED_SUCCESS
      }
    } catch (error) {
      return{
        statusCode:404,
        message:error.message
      }
    }
  }
  generateAccountNumber():string{
    const length=16;
    let accountNumber='';
    for(let i=0;i<length;i++){
      const digit=Math.floor(Math.random()*10);
      accountNumber+=digit.toString()
    }
    return accountNumber
  }

  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Password does not match' })
  @ApiResponse({ status: 404, description: 'Error during login' })
  @Post('login')
  async login(@Body() reqBody:any){
    try {
      const {phoneNumber,password}=reqBody;
      const userDetails=await this.mongoService.findByUniqueValue(TABLE_NAMES.USER_CREDENTIALS,'phoneNumber',phoneNumber);
      const userPassword=userDetails.password;
      const isCorrect=await this.bcryptService.comparePassword(password,userPassword);
      if(!isCorrect){
        return{
          statusCode:400,
          message:ERROR_MESSAGES.PASSWORD_NOT_MATCHED
        }
      }
      const payload={
        userDetails
      }
      const token=jwt.sign(payload,JWT_KEY,{expiresIn:'8h'});
      return{
        statusCode:200,
        message:SUCCESS_MESSAGES.LOGIN_SUCCESSFULL,
        token
      }
    } catch (error) {
      return{
        statusCode:404,
        message:error.message
      }
    }
  }

  @ApiOperation({ summary: 'Register a new admin' })
  @ApiResponse({ status: 200, description: 'Admin registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Token unavailable' })
  @ApiResponse({ status: 402, description: 'Upload to S3 Failed' })
  @ApiResponse({ status: 404, description: 'Internal Server Error' })
  @Post('admin')
  @UseInterceptors(FileInterceptor('idProof'))
  async adminRegister(@Body() reqBody: any,@UploadedFile() idProof:any,@Headers() headers:any){
    try {
      const token=headers.authorization;
      if(!token){
        return{
          status:400,
          message:ERROR_MESSAGES.TOKEN_UNAVAILABLE
        }
      }
      const decoded=await this.verifyService.verifyToken(token,JWT_KEY);
      const timestamp=new Date().toISOString();
      const newName=`${decoded.userDetails._id}_${timestamp}`;
      const key=`adminIdProof_${newName}`;
      const bucket=`${BUCKET_NAME}`;
      const fileUrl=await this.s3Service.uploadFile(idProof,bucket,'adminIdProof',key);
      if(!fileUrl){
        return{
          statusCode:401,
          message:ERROR_MESSAGES.UPLOAD_S3_FAILED
        }
      }
      const address=JSON.parse(reqBody.address)
      const societyFacilities=JSON.parse(reqBody.societyFacilities)
      const societyServices=JSON.parse(reqBody.societyServices)
      const adminItem={
        ...reqBody,
        fileUrl,
        address,
        societyFacilities,
        societyServices
      }
      const putAdminResponse=await this.mongoService.createItem(TABLE_NAMES.SOCIETY_TABLE,adminItem);
      return{
        statusCode:200,
        message:SUCCESS_MESSAGES.ADMIN_REGISTER_SUCCESSFULL
      }
    } catch (error) {
      return{
        statusCode:404,
        message:error.message
      }
    }
  }

  
}