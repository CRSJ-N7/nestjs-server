import { IsDefined, IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @IsDefined({ message: 'Email is required' })
  @IsEmail({}, { message: 'Incorrect Email type' })
  email: string;

  @IsDefined({ message: 'Password is required' })
  @IsString({ message: 'Incorrect password type' })
  password: string;
}
