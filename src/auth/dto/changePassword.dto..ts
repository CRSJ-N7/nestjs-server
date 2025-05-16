import {
  IsDefined,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsDefined({ message: 'Current password is required' })
  @IsString()
  currentPassword: string;

  @IsDefined({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, {
    message: 'Password length must not exceed 20 characters.',
  })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/, {
    message:
      'The password must contain numbers, lowercase and uppercase letters.',
  })
  newPassword: string;
}
