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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  findAll(@Query('articleId') articleId: string) {
    return this.commentsService.findAll(articleId);
  }

  @Delete(':id')
  @HttpCode(204)
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
    return this.commentsService.remove(id);
  }
}
