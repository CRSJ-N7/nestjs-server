import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('about')
  getTestString(): string {
    return this.appService.getTestString();
  }

  @Get('shithole')
  getSomeNewShit(): string {
    return this.appService.getSomeNewShit();
  }
}
