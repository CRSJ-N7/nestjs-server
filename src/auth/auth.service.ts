import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
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
  ): Promise<{ user: User; token: string }> {
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
    return { user, token };
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        'Surprise motherfucker. You fucked up somewhere. Email? Password? Thats some confidential shit. Not gonna say, nope.',
      );
    }
    const token = this.jwtService.sign({ id: user.id });
    return { user, token };
  }
  async getUserById(id: number): Promise<User> {
    // Почему здесь не надо писать Promise<Partial<User>>? Я ж ведь не возвращаю в итоге полного юзера
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email'],
    });
    if (!user) {
      throw new NotFoundException('Wtf. User not found');
    }

    return user;
  }
}
