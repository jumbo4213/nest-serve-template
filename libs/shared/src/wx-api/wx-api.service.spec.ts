import { Test, TestingModule } from '@nestjs/testing';
import { WxApiService } from './wx-api.service';

describe('WxApiService', () => {
  let service: WxApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WxApiService],
    }).compile();

    service = module.get<WxApiService>(WxApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
