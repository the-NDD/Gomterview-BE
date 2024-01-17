import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from '../service/question.service';
import { CreateQuestionRequest } from '../dto/createQuestionRequest';
import { Request, Response } from 'express';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { createApiResponseOption } from '../../util/swagger.util';
import { QuestionResponse } from '../dto/questionResponse';
import { Member } from '../../member/entity/member';
import { CopyQuestionRequest } from '../dto/copyQuestionRequest';
import { WorkbookIdResponse } from '../../workbook/dto/workbookIdResponse';
import { TokenHardGuard } from 'src/token/guard/token.hard.guard';
import {
  BAD_REQUEST,
  FORBIDDEN,
  GONE,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  NO_CONTENT,
  OK,
  UNAUTHORIZED,
} from 'src/constant/constant';
import { UpdateIndexInWorkbookRequest } from '../dto/updateIndexInWorkbookRequest';
import {
  InvalidTokenException,
  ManipulatedTokenNotFiltered,
  TokenExpiredException,
} from 'src/token/exception/token.exception';
import {
  NeedToFindByWorkbookIdException,
  WorkbookForbiddenException,
  WorkbookNotFoundException,
} from 'src/workbook/exception/workbook.exception';

@ApiTags('question')
@Controller('/api/question')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Post()
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiBody({ type: CreateQuestionRequest })
  @ApiOperation({
    summary: '커스텀 질문 저장',
  })
  @ApiResponse(
    createApiResponseOption(201, '커스텀 질문 저장 완료', QuestionResponse),
  )
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  @ApiResponse(InvalidTokenException.response())
  @ApiResponse(TokenExpiredException.response())
  @ApiResponse(WorkbookNotFoundException.response())
  @ApiResponse(WorkbookForbiddenException.response())
  async createCustomQuestion(
    @Body() createQuestionRequest: CreateQuestionRequest,
    @Req() req: Request,
  ) {
    return await this.questionService.createQuestion(
      createQuestionRequest,
      req.user as Member,
    );
  }

  @Post('/copy')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiBody({ type: CopyQuestionRequest })
  @ApiOperation({
    summary: '질문 복제',
  })
  @ApiResponse(createApiResponseOption(201, '질문 복제', WorkbookIdResponse))
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  @ApiResponse(InvalidTokenException.response())
  @ApiResponse(TokenExpiredException.response())
  @ApiResponse(WorkbookNotFoundException.response())
  @ApiResponse(WorkbookForbiddenException.response())
  async copyQuestions(
    @Body() copyQuestionRequest: CopyQuestionRequest,
    @Req() req: Request,
  ) {
    return await this.questionService.copyQuestions(
      copyQuestionRequest,
      req.user as Member,
    );
  }

  @Get(':workbookId')
  @ApiOperation({
    summary: '카테고리별 질문 리스트 조회',
  })
  @ApiResponse(
    createApiResponseOption(200, 'QuestionResponse 리스트', [QuestionResponse]),
  )
  @ApiResponse(createApiResponseOption(BAD_REQUEST, 'W03', null))
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  @ApiResponse(InvalidTokenException.response())
  @ApiResponse(TokenExpiredException.response())
  @ApiResponse(NeedToFindByWorkbookIdException.response())
  async findWorkbookQuestions(@Param('workbookId') workbookId: number) {
    return await this.questionService.findAllByWorkbookId(workbookId);
  }

  @Patch('/index')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: '질문들의 인덱스 조정',
  })
  @ApiResponse(createApiResponseOption(OK, '없음', null))
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  @ApiResponse(InvalidTokenException.response())
  @ApiResponse(TokenExpiredException.response())
  @ApiResponse(WorkbookNotFoundException.response())
  @ApiResponse(WorkbookForbiddenException.response())
  @ApiResponse(NeedToFindByWorkbookIdException.response())
  async updateIndex(
    @Body() updateIndexInWorkbookRequest: UpdateIndexInWorkbookRequest,
    @Req() req: Request,
  ) {
    await this.questionService.updateIndex(
      updateIndexInWorkbookRequest,
      req.user as Member,
    );
  }

  @Delete(':questionId')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: '질문 삭제',
  })
  @ApiResponse(createApiResponseOption(NO_CONTENT, '질문 삭제', null))
  @ApiResponse(createApiResponseOption(NOT_FOUND, 'W01, Q01', null))
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  @ApiResponse(InvalidTokenException.response())
  @ApiResponse(TokenExpiredException.response())
  @ApiResponse(WorkbookForbiddenException.response())
  async deleteQuestionById(
    @Param('questionId') questionId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.questionService.deleteQuestionById(
      questionId,
      req.user as Member,
    );
    res.status(204).send();
  }
}
