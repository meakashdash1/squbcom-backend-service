import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { UserCredentialsModule } from './user-credentials/user-credentials.module';

@Module({
  imports: [
    UserCredentialsModule,
    ConfigModule.forRoot(),
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
