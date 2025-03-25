import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello, this is my NEST server! (c) CRSJ!';
  }
  getTestString(): string {
    return 'Hello, this is some new string!';
  }
  getSomeNewShit(): string {
    return crypto.randomUUID();
  }
}
