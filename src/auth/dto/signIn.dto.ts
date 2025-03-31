import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Incorrect Email type' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Incorrect password type' })
  password: string;
}
