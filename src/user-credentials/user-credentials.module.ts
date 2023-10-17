import { Module,MiddlewareConsumer,NestModule,RequestMethod } from '@nestjs/common';
import { UserCredentialsController } from './user-credentials.controller';
import { MongoService } from 'src/function/mongodb.service';
import { VerifyService } from 'src/function/verify.service';
import {BcryptService} from 'src/function/bcrypt.service'
import { JwtMiddleware } from 'src/middlewares/jwt.middleware';
import { S3Service } from 'src/function/s3.service';

@Module({
  controllers: [UserCredentialsController],
  providers: [MongoService,VerifyService,BcryptService,S3Service]
})
export class UserCredentialsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'user-credentials/admin', method: RequestMethod.POST });
  }
}