import { createApiResponseOption } from 'src/util/swagger.util';
import {
  HttpForbiddenException,
  HttpNotFoundException,
} from '../../util/exception.util';
import { FORBIDDEN, NOT_FOUND } from 'src/constant/constant';

class AnswerNotFoundException extends HttpNotFoundException {
  constructor() {
    super('해당 답변을 찾을 수 없습니다.', 'A01');
  }

  static response() {
    return createApiResponseOption(NOT_FOUND, 'A01', null);
  }
}

class AnswerForbiddenException extends HttpForbiddenException {
  constructor() {
    super('답변에 대한 권한이 없습니다.', 'A02');
  }

  static response() {
    return createApiResponseOption(FORBIDDEN, 'A02', null);
  }
}

export { AnswerNotFoundException, AnswerForbiddenException };
