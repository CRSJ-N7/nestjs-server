import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { AuthService, SafeUser } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/updateUser.dto';

interface RequestWithUser extends Request {
  user: SafeUser;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Creates a new user' })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'User email',
    example: 'somefancymail@mail.com',
    type: 'string',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'User password',
    example: 'SomeFancyPassword123',
    type: 'string',
  })
  @ApiQuery({
    name: 'username',
    required: true,
    description: 'User username',
    example: 'SomFancyUserName',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Created',
    examples: {
      example1: {
        summary: 'Example registration response',
        value: {
          user: {
            id: '1',
            email: 'test@mail.com',
            username: 'testuser',
          },
          token: 'eyJhbGciOiJIUz...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflict',
    examples: {
      example1: {
        summary: 'Example registration conflict error',
        value: {
          message: 'Username already exist',
          error: 'ALL ALERT. WE ARE IN THE MIDDLE OF FUCKING CONFLICT HERE',
          statusCode: 409,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
    examples: {
      example1: {
        summary: 'Example registration bad request error',
        value: {
          message: ['Username length must not exceed 20 characters'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  @ApiBody({
    type: SignUpDto,
    examples: {
      example1: {
        summary: 'Example registration payload',
        value: {
          email: 'test@mail.com',
          username: 'testuser',
          password: 's0meFanCyPassword',
        },
      },
    },
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.username,
    );
  }
  @HttpCode(200)
  @Post('sign-in')
  @ApiOperation({ summary: 'Sign-in user' })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email',
    type: 'string',
    example: 'somefancymail@mail.com',
  })
  @ApiQuery({
    name: 'password',
    required: true,
    description: 'Password',
    type: 'string',
    example: 'SomeFancyPassword123',
  })
  @ApiBody({
    type: SignInDto,
    examples: {
      example1: {
        summary: 'Example sign-in payload',
        value: {
          email: 'test@mail.com',
          password: 'SomeFancyPassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    examples: {
      example1: {
        summary: 'Example registration response',
        value: {
          user: {
            id: '1',
            email: 'test@mail.com',
            username: 'testuser',
          },
          token: 'eyJhbGciOiJIUz...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
    examples: {
      example1: {
        summary: 'Example sign-in bad request',
        value: {
          message: ['Password is required'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    examples: {
      example1: {
        summary: 'Example sign-in unauthorized error',
        value: {
          message: 'Incorrect password',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    },
  })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @ApiOperation({ summary: 'Sign-in user' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
    examples: {
      example1: {
        summary: 'Example user not found error',
        value: {
          message: 'User not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Not Found',
    examples: {
      example1: {
        summary: 'Example get user succeed',
        value: {
          id: 12,
          username: 'llll123123l',
          email: '12345@aA1233.com',
        },
      },
    },
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Patch('update')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(req.user.id, updateUserDto);
  }
}
