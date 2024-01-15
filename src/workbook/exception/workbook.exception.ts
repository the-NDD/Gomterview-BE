import { createApiResponseOption } from 'src/util/swagger.util';
import {
  HttpBadRequestException,
  HttpForbiddenException,
  HttpNotFoundException,
} from '../../util/exception.util';
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND } from 'src/constant/constant';

class WorkbookNotFoundException extends HttpNotFoundException {
  constructor() {
    super('문제집을 찾을 수 없습니다.', 'W01');
  }

  static response() {
    return createApiResponseOption(NOT_FOUND, 'W01', null);
  }
}

class WorkbookForbiddenException extends HttpForbiddenException {
  constructor() {
    super('문제집에 대한 권한이 없습니다.', 'W02');
  }

  static response() {
    return createApiResponseOption(FORBIDDEN, 'W02', null);
  }
}

class NeedToFindByWorkbookIdException extends HttpBadRequestException {
  constructor() {
    super('문제집 id를 입력해주세요.', 'W03');
  }

  static response() {
    return createApiResponseOption(BAD_REQUEST, 'W03', null);
  }
}

export {
  WorkbookNotFoundException,
  WorkbookForbiddenException,
  NeedToFindByWorkbookIdException,
};
