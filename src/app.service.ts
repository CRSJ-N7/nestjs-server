import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello, this is my NEST server! (c) CRSJ!';
  }
  getAboutInfo(): string {
    return 'About information will be added soon';
  }
  getDocs(): string {
    return '<a href="https://www.youtube.com/watch?v=E4WlUXrJgy4">Documentation</a>';
  }
}
