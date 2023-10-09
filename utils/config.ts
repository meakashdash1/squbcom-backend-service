import * as dotenv from 'dotenv';

dotenv.config();

export interface ConfigParameters {
  PORT: string;
  TABLE_NAMES: TableNames;
  DATABASE_NAME: string;
}

export interface ErrorMessages {
  
}

export interface SuccessMessages {
  
}

export interface TableNames {
 
}

export const NETWORK = "DEV"; // Set a default value if NETWORK is not provided in .env

const CONFIG_PARA: { [key: string]: ConfigParameters } = {
  DEV: {
    PORT: "5002",
    DATABASE_NAME:"SQUBCOM_DEV",
    TABLE_NAMES: {
      
    }
  },
  PROD: {
    PORT: "5001",
    DATABASE_NAME:"SQUBCOM_PROD",
    TABLE_NAMES: {
      
    }
  },
};

export const ERROR_MESSAGES: ErrorMessages = {
 
};

export const SUCCESS_MESSAGES: SuccessMessages = {
  
}

export const PORT_NAME=CONFIG_PARA[NETWORK].PORT;
export const DATABASE_NAME=CONFIG_PARA[NETWORK].DATABASE_NAME;
export const MONGO_URI=process.env.MONGO_URI!;

