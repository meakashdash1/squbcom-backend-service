import { Module } from '@nestjs/common';
import { UserCredentialsController } from './user-credentials.controller';
import { MongoService } from 'src/function/mongodb.service';
import { VerifyService } from 'src/function/verify.service';

@Module({
  controllers: [UserCredentialsController],
  providers: [MongoService,VerifyService]
})
export class UserCredentialsModule {}