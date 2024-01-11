import { HttpException } from '@nestjs/common';
import {
  BAD_REQUEST,
  FORBIDDEN,
  GONE,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from '../constant/constant';
import { LoggerService } from '../config/logger.config';
import { ApiResponseOptions } from '@nestjs/swagger';
import { createApiResponseOption } from './swagger.util';

const errorLogger = new LoggerService('ERROR');

class HttpCustomException extends HttpException {
  apiResponse: ApiResponseOptions;

  constructor(message: string, errorCode: string, status: number) {
    super({ message: message, errorCode: errorCode }, status);
    errorLogger.error(errorCode, super.stack);

    // 이 부분을 이용해서 Swagger의 createApiResponseOption의 반복구조를 지울 수 있을 것 같습니다.
    this.apiResponse = createApiResponseOption(status, errorCode, null);
  }
}

class HttpBadRequestException extends HttpCustomException {
  constructor(message: string, errorCode: string) {
    super(message, errorCode, BAD_REQUEST);
  }
}

class HttpUnauthorizedException extends HttpCustomException {
  constructor(message: string, errorCode: string) {
    super(message, errorCode, UNAUTHORIZED);
  }
}

class HttpForbiddenException extends HttpCustomException {
  constructor(message: string, errorCode: string) {
    super(message, errorCode, FORBIDDEN);
  }
}

class HttpNotFoundException extends HttpCustomException {
  constructor(message: string, errorCode: string) {
    super(message, errorCode, NOT_FOUND);
  }
}

class HttpGoneException extends HttpCustomException {
  constructor(message: string, errorCode: string) {
    super(message, errorCode, GONE);
  }
}

class HttpInternalServerError extends HttpCustomException {
  constructor(message: string, errorCode: string) {
    super(message, errorCode, INTERNAL_SERVER_ERROR);
  }
}

export {
  HttpBadRequestException,
  HttpUnauthorizedException,
  HttpForbiddenException,
  HttpNotFoundException,
  HttpGoneException,
  HttpInternalServerError,
};
