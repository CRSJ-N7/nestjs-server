import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/User';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

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
    const usernameIsAvailable = await this.userRepository.findOne({
      where: { username },
    });
    if (usernameIsAvailable) {
      throw new UsernameTakenException();
    }
    const emailIsAvailable = await this.userRepository.findOne({
      where: { email },
    });
    if (emailIsAvailable) {
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
      throw new UnauthorizedException('Incorrect password');
    }
    const token = this.jwtService.sign({ id: user.id });

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    return { user: safeUser, token };
  }
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
