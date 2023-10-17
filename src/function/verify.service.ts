import {Injectable} from "@nestjs/common"
import {TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,TWILIO_SERVICE_SID} from "../../utils/config"
import * as jwt from 'jsonwebtoken';
const client=require("twilio")(TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN);


@Injectable()
export class VerifyService{

    async sendOTP(phoneNumber:string){
        try {
            const otpResponse=await client.verify
                .v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    to:`+91${phoneNumber}`,
                    channel:"sms",
                });
            return otpResponse;
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async verifyOTP(phoneNumber:string,otp:any){
        try {
            const verifyResponse=client.verify
                .v2.services(TWILIO_SERVICE_SID)
                .verificationChecks.create({
                    to:`+91${phoneNumber}`,
                    code:otp,
                });
            return verifyResponse;
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async verifyDefault(phoneNumber:string,otp:any){
        try {
            if(otp==="123456"){
                return true;
            }else{
                return false;
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    verifyToken(token: string, secret: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }
}