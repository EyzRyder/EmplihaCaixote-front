import { TestBed } from '@angular/core/testing';
import { WsService } from './ws.service';

class MockWsService {
  onMessage() { return { subscribe: () => {} } as any; }
  onOpen() { return { subscribe: () => {} } as any; }
  connect() {}
}

describe('WsService', () => {
  let service: WsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: WsService, useClass: MockWsService }],
    });
    service = TestBed.inject(WsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
