import { createApiResponseOption } from 'src/util/swagger.util';
import {
  HttpGoneException,
  HttpInternalServerError,
  HttpUnauthorizedException,
} from '../../util/exception.util';
import {
  GONE,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from 'src/constant/constant';

class InvalidTokenException extends HttpUnauthorizedException {
  constructor() {
    super('유효하지 않은 토큰입니다.', 'T01');
  }

  static response() {
    return createApiResponseOption(UNAUTHORIZED, 'T01', null);
  }
}

class TokenExpiredException extends HttpGoneException {
  constructor() {
    super('토큰이 만료되었습니다', 'T02');
  }

  static response() {
    return createApiResponseOption(GONE, 'T02', null);
  }
}

class NeedToLoginException extends HttpUnauthorizedException {
  constructor() {
    super('다시 로그인해주세요.', 'T03');
  }

  static response() {
    return createApiResponseOption(UNAUTHORIZED, 'T03', null);
  }
}

class ManipulatedTokenNotFiltered extends HttpInternalServerError {
  constructor() {
    super('', 'SERVER');
  }

  static response() {
    return createApiResponseOption(INTERNAL_SERVER_ERROR, 'SERVER', null);
  }
}

export {
  InvalidTokenException,
  TokenExpiredException,
  ManipulatedTokenNotFiltered,
  NeedToLoginException,
};
