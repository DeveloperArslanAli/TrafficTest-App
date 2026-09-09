import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'RoadWise Driver API',
      timestamp: new Date().toISOString(),
    };
  }
}
