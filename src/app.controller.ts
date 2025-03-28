import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('about')
  getAboutInfo(): string {
    return this.appService.getAboutInfo();
  }

  @Get('documentation')
  @Header('Content-Type', 'text/html')
  getDocs(): string {
    return this.appService.getDocs();
  }
}
