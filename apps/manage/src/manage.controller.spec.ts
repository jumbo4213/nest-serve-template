import { Test, TestingModule } from '@nestjs/testing';
import { ManageController } from './manage.controller';
import { ManageService } from './manage.service';

describe('ManageController', () => {
  let manageController: ManageController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ManageController],
      providers: [ManageService],
    }).compile();

    manageController = app.get<ManageController>(ManageController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(manageController.getHello()).toBe('Hello World!');
    });
  });
});
