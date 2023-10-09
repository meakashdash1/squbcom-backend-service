import { Test, TestingModule } from '@nestjs/testing';
import { UserCredentialsController } from './user-credentials.controller';

describe('UserCredentialsController', () => {
  let controller: UserCredentialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCredentialsController],
    }).compile();

    controller = module.get<UserCredentialsController>(UserCredentialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});