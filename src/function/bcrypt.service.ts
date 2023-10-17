import * as bcrypt from 'bcryptjs'
import {Injectable} from '@nestjs/common'

@Injectable()
export class BcryptService{
    hashPassword(password:string):Promise<string>{
        return new Promise((resolve,reject)=>{
            bcrypt.genSalt(10,(error,salt)=>{
                if(error){
                    reject(error)
                }else{
                    bcrypt.hash(password,salt,(error,hash)=>{
                        if(error){
                            reject(error)
                        }
                        resolve(hash)
                    })
                }
            })
        })
    }

    comparePassword(password:string,hashedPassword:string):Promise<boolean>{
        return new Promise((resolve,reject)=>{
            bcrypt.compare(password,hashedPassword,(error,result)=>{
                if(error){
                    reject(error)
                }
                resolve(result)
            })
        })
    }
}

