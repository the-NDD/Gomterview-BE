import { createApiResponseOption } from 'src/util/swagger.util';
import {
  HttpForbiddenException,
  HttpNotFoundException,
} from '../../util/exception.util';
import { FORBIDDEN, NOT_FOUND } from 'src/constant/constant';

class QuestionNotFoundException extends HttpNotFoundException {
  constructor() {
    super('해당 질문을 찾을 수 없습니다.', 'Q01');
  }

  static response() {
    return createApiResponseOption(NOT_FOUND, 'Q01', null);
  }
}

class QuestionForbiddenException extends HttpForbiddenException {
  constructor() {
    super('질문에 대한 권한이 없습니다.', 'Q02');
  }

  static response() {
    return createApiResponseOption(FORBIDDEN, 'Q02', null);
  }
}

class QuestionOriginFound extends Error {
  readonly originId: number;

  constructor(originId: number) {
    super();
    this.originId = originId;
  }
}

class QuestionDefaultAnswerExists extends Error {
  readonly answerId: number;

  constructor(answerId: number) {
    super();
    this.answerId = answerId;
  }
}

export {
  QuestionNotFoundException,
  QuestionForbiddenException,
  QuestionOriginFound,
  QuestionDefaultAnswerExists,
};
