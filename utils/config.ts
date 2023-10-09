import * as dotenv from 'dotenv';

dotenv.config();

export interface ConfigParameters {
  PORT: string;
  TABLE_NAMES: TableNames;
  DATABASE_NAME: string;
  TWILIO_ACCOUNT_SID: string,
  TWILIO_AUTH_TOKEN: string,
  TWILIO_SERVICE_SID: string,
  JWT_KEY: any
}

export interface ErrorMessages {
  USER_EXISTS:string,
  OTP_SEND_UNSUCCESSFULL:string,
  MISSING_OTP_PARAMETER:string,
  OTP_VERIFICATION_FAILED: string,
  USER_CREATION_FAILED: string,
  WALLET_CREATION_FAILED: string
}

export interface SuccessMessages {
  OTP_SEND_SUCCESSFULL:string,
  USER_CREATED_SUCCESS: string,
  WALLET_CREATED_SUCCESS: string
}

export interface TableNames {
  USER_CREDENTIALS: string
  WALLET_TABLE: string
}

export const NETWORK = "DEV"; // Set a default value if NETWORK is not provided in .env

const CONFIG_PARA: { [key: string]: ConfigParameters } = {
  DEV: {
    PORT: "5002",
    DATABASE_NAME:"SQUBCOM_DEV",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID!,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,
    TWILIO_SERVICE_SID: process.env.TWILIO_SERVICE_SID!,
    JWT_KEY:process.env.JWT_KEY_DEV!,
    TABLE_NAMES: {
      USER_CREDENTIALS:"USER_CREDENTIALS_DEV",
      WALLET_TABLE:"WALLET_DEV"
    }
  },
  PROD: {
    PORT: "5001",
    DATABASE_NAME:"SQUBCOM_PROD",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID!,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,
    TWILIO_SERVICE_SID: process.env.TWILIO_SERVICE_SID!,
    JWT_KEY:process.env.JWT_KEY_PROD!,
    TABLE_NAMES: {
      USER_CREDENTIALS:"USER_CREDENTIALS_PROD",
      WALLET_TABLE:"WALLET_PROD"
    }
  },
};

export const ERROR_MESSAGES: ErrorMessages = {
  USER_EXISTS:'User Already Exists',
  OTP_SEND_UNSUCCESSFULL:'OTP Send Unsuccessfull',
  MISSING_OTP_PARAMETER:'Missing OTP Parameter',
  OTP_VERIFICATION_FAILED:'OTP Verification Failed',
  USER_CREATION_FAILED: 'User Creation Failed',
  WALLET_CREATION_FAILED: 'Wallet Creation Failed'
};

export const SUCCESS_MESSAGES: SuccessMessages = {
  OTP_SEND_SUCCESSFULL:'OTP Sent Successfully',
  USER_CREATED_SUCCESS:'User Created Successfully',
  WALLET_CREATED_SUCCESS:'Wallet Created Successfully'
}

export const PORT_NAME=CONFIG_PARA[NETWORK].PORT;
export const DATABASE_NAME=CONFIG_PARA[NETWORK].DATABASE_NAME;
export const TABLE_NAMES:TableNames=CONFIG_PARA[NETWORK].TABLE_NAMES;
export const TWILIO_ACCOUNT_SID=CONFIG_PARA[NETWORK].TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN=CONFIG_PARA[NETWORK].TWILIO_AUTH_TOKEN;
export const TWILIO_SERVICE_SID=CONFIG_PARA[NETWORK].TWILIO_SERVICE_SID;
export const JWT_KEY=CONFIG_PARA[NETWORK].JWT_KEY;
export const MONGO_URI=process.env.MONGO_URI!;

