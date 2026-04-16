import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  ParseUUIDPipe,
  BadRequestException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard)
  @Roles(['ADMIN', 'EDITOR'])
  @Post()
  @ApiOperation({
    summary: 'Create comment',
    description:
      'Creates a new comment for a given article. Optionally, an authorId can be provided.',
  })
  @ApiResponse({ status: 201, description: 'Comment successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN', 'EDITOR', 'VIEWER'])
  @Get()
  @ApiOperation({
    summary: 'Get all comments',
    description:
      'Retrieves all comments. Can be filtered by articleId if provided.',
  })
  @ApiQuery({
    name: 'articleId',
    required: false,
    description: 'Filter comments by article UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  findAll(@Query('articleId') articleId: string) {
    return this.commentsService.findAll(articleId);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN', 'EDITOR', 'VIEWER'])
  @Get(':id')
  @ApiOperation({
    summary: 'Get comment by ID',
    description: 'Retrieves a comment by its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment UUID (v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
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
    return this.commentsService.findOne({ id });
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete comment',
    description: 'Deletes a comment by its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Comment UUID (v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Comment successfully deleted' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
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
    return this.commentsService.delete({ id });
  }
}
