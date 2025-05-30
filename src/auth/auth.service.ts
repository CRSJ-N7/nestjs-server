import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/User';
import { UpdateUserDto } from './dto/updateUser.dto';

export class UsernameTakenException extends ConflictException {
  constructor() {
    super({
      message: 'Username already exist',
      error: 'ALL ALERT. WE ARE IN THE MIDDLE OF FUCKING CONFLICT HERE',
      statusCode: 409,
    });
  }
}
export class EmailTakenException extends ConflictException {
  constructor() {
    super('Email already exist');
  }
}
export type SafeUser = Omit<User, 'password'>;
export type UpdatedUser = Omit<SafeUser, 'email' | 'username'>;
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async signUp(
    email: string,
    password: string,
    username: string,
  ): Promise<{ safeUser: SafeUser; token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
      select: ['username', 'email'],
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throw new UsernameTakenException();
      }
      throw new EmailTakenException();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      username,
    });

    const token = this.jwtService.sign({ id: user.id });
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    return { safeUser, token };
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: SafeUser; token: string }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    if (!user) {
      throw new UnauthorizedException('Incorrect email');
    }
    const isPasswordValid = user.password
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect current password');
    }
    const token = this.jwtService.sign({ id: user.id });

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    return { user: safeUser, token };
  }
  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<{ updatedUser: SafeUser }> {
    const existingUser = await this.userRepository.findOneBy({ id: userId });
    if (!existingUser) {
      throw new NotFoundException();
    }
    const allowedKeys = ['username', 'email'];
    const currentKey = Object.keys(updateUserDto).find(
      (key) => updateUserDto[key] !== undefined,
    ) as keyof UpdateUserDto;
    // А вот ещё придумал второй "мегаспособ" получения ключа (но первый мне нравится больше :3):
    // const currentKey = Object.entries(updateUserDto);
    // const getCurrentKey = () => {
    //   if (currentKey[0][1] !== undefined) {
    //     return 'email';
    //   } else {
    //     return 'username';
    //   }
    // };
    // console.info(getCurrentKey());

    if (!allowedKeys.includes(currentKey)) {
      throw new BadRequestException();
    }
    const currentKeyValue = updateUserDto[currentKey];

    const existingUserData = await this.userRepository.findOneBy({
      [currentKey]: currentKeyValue,
    });

    if (existingUserData) {
      switch (currentKey) {
        case 'username':
          throw new UsernameTakenException();
        case 'email':
          throw new EmailTakenException();
        default:
          throw new BadRequestException();
      }
    }

    const updateUser = await this.userRepository.save({
      ...existingUser,
      [currentKey]: currentKeyValue,
    });

    const updatedUser: SafeUser = {
      id: updateUser.id,
      email: updateUser.email,
      username: updateUser.username,
    };

    return { updatedUser };
  }
  async updateUserPassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ user: SafeUser }> {
    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId }) // а почему здесь должно быть именно id: userId, а не просто id? За что вообще отвечает выражение в скобках?
      .getOne();
    if (!existingUser) throw new NotFoundException();

    const isPasswordValid = existingUser.password
      ? await bcrypt.compare(currentPassword, existingUser.password)
      : false;
    console.log(isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.userRepository.save({
      ...existingUser,
      password: hashedPassword,
    });

    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
    };

    return { user: safeUser };
  }
}

// if (updateUserDto.username) {
//   const existingUsername = await this.userRepository.findOneBy({
//     username: updateUserDto.username,
//   });
//   if (existingUsername) {
//     throw new UsernameTakenException();
//   }
//   const updateUser = await this.userRepository.save({
//     ...existingUser,
//     username: updateUserDto.username,
//   });

//   const user: SafeUser = {
//     id: updateUser.id,
//     email: updateUser.email,
//     username: updateUser.username,
//   };
//   return { updatedUser: user };
// }

// if (updateUserDto.email) {
//   const existingEmail = await this.userRepository.findOneBy({
//     email: updateUserDto.email,
//   });
//   if (existingEmail) {
//     throw new EmailTakenException();
//   }
//   const updateUser = await this.userRepository.save({
//     ...existingUser,
//     email: updateUserDto.email,
//   });

//   const user: SafeUser = {
//     id: updateUser.id,
//     email: updateUser.email,
//     username: updateUser.username,
//   };
//   return { updatedUser: user };
// }

//     return {
//       updatedUser: {
//         id: existingUser.id,
//         email: existingUser.email,
//         username: existingUser.username,
//       },
//     };
//   }
// }
