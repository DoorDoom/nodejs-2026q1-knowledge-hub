import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user with login, password, and optional role',
  })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all registered users',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a single user by UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID (v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
  ) {
    return this.usersService.findOne({ id });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update user password',
    description: 'Updates the password of a user by UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID (v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID or validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.update({ where: { id }, data: updatePasswordDto });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user by UUID',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID (v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'User successfully deleted' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
  ) {
    return this.usersService.delete({ id });
  }
}
