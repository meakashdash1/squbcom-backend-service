import { Controller,Post,Body } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'
import {MongoService} from 'src/function/mongodb.service'
import {VerifyService} from 'src/function/verify.service'
import { ApiTags, ApiResponse, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_NAMES,ERROR_MESSAGES,SUCCESS_MESSAGES,JWT_KEY,DATABASE_NAME } from "utils/config";

@ApiTags('User Credentials API')
@Controller('user-credentials')
export class UserCredentialsController{
   constructor(
    private readonly mongoService:MongoService,
    private readonly verifyService:VerifyService
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

  @Post()
  async register(@Body() reqBody: any){
    try {
      const {otp,...userWithoutOTP}=reqBody;
      const isUserExist=await this.mongoService.getItem(TABLE_NAMES.USER_CREDENTIALS,reqBody.phoneNumber)
      if(isUserExist){
        return{
          statusCode:400,
          message:ERROR_MESSAGES.USER_EXISTS
        }
      }
      if(otp.length<6){
        return{
          statusCode:400,
          message:ERROR_MESSAGES.MISSING_OTP_PARAMETER
        }
      }
      const verifyResponse=await this.verifyService.verifyDefault(reqBody.phoneNumber,otp);
      if(verifyResponse===false){
        return{
          statusCode:400,
          message:ERROR_MESSAGES.OTP_VERIFICATION_FAILED
        }
      }
      const uid=uuidv4().toString();
      const userItem={
        ...userWithoutOTP,
        status:'pending',
        userType:'user',
        adminId:''
      }
      const createUserResponse=await this.mongoService.createItem(TABLE_NAMES.USER_CREDENTIALS,userItem)
      if(!createUserResponse){
        return{
          statusCode:400,
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
          statusCode:400,
          message:ERROR_MESSAGES.WALLET_CREATION_FAILED
        }
      }
      const payload={
        userItem
      }
      const token=jwt.sign(payload,JWT_KEY,{expiresIn:'8h'})
      return{
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
}