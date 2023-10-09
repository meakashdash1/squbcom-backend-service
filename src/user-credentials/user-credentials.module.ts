import { Module } from '@nestjs/common';
import { UserCredentialsController } from './user-credentials.controller';
import { mongoService } from 'src/function/mongodb.service';

@Module({
  controllers: [UserCredentialsController],
  providers: [mongoService]
})
export class UserCredentialsModule {}