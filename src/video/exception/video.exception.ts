import {
  BAD_REQUEST,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from 'src/constant/constant';
import {
  HttpBadRequestException,
  HttpForbiddenException,
  HttpInternalServerError,
  HttpNotFoundException,
} from 'src/util/exception.util';
import { createApiResponseOption } from 'src/util/swagger.util';

export class IDriveException extends HttpInternalServerError {
  constructor() {
    super('비디오 업로드 API 처리 도중 에러가 발생하였습니다.', 'V01');
  }

  static response() {
    return createApiResponseOption(INTERNAL_SERVER_ERROR, 'V01', null);
  }
}

export class VideoAccessForbiddenException extends HttpForbiddenException {
  constructor() {
    super('해당 비디오에 접근 권한이 없습니다.', 'V02');
  }

  static response() {
    return createApiResponseOption(FORBIDDEN, 'V02', null);
  }
}

export class VideoNotFoundException extends HttpNotFoundException {
  constructor() {
    super('존재하지 않는 비디오입니다.', 'V03');
  }

  static response() {
    return createApiResponseOption(NOT_FOUND, 'V03', null);
  }
}

export class VideoOfWithdrawnMemberException extends HttpNotFoundException {
  constructor() {
    super('탈퇴한 회원의 비디오를 조회할 수 없습니다.', 'V04');
  }

  static response() {
    return createApiResponseOption(NOT_FOUND, 'V04', null);
  }
}

export class RedisDeleteException extends HttpInternalServerError {
  constructor() {
    super('비디오 정보 삭제 중 오류가 발생하였습니다.', 'V05');
  }

  static response() {
    return createApiResponseOption(INTERNAL_SERVER_ERROR, 'V05', null);
  }
}

export class RedisRetrieveException extends HttpInternalServerError {
  constructor() {
    super('비디오 정보를 가져오는 중 오류가 발생하였습니다.', 'V06');
  }

  static response() {
    return createApiResponseOption(INTERNAL_SERVER_ERROR, 'V06', null);
  }
}

export class RedisSaveException extends HttpInternalServerError {
  constructor() {
    super('비디오 정보 저장 중 오류가 발생하였습니다.', 'V07');
  }

  static response() {
    return createApiResponseOption(INTERNAL_SERVER_ERROR, 'V07', null);
  }
}

export class Md5HashException extends HttpInternalServerError {
  constructor() {
    super('해시 생성 중 오류가 발생했습니다.', 'V08');
  }

  static response() {
    return createApiResponseOption(INTERNAL_SERVER_ERROR, 'V08', null);
  }
}

export class VideoNotFoundWithHashException extends HttpNotFoundException {
  constructor() {
    super('해당 해시값으로 등록된 비디오를 조회할 수 없습니다.', 'V09');
  }

  static response() {
    return createApiResponseOption(NOT_FOUND, 'V09', null);
  }
}

export class InvalidHashException extends HttpBadRequestException {
  constructor() {
    super('유효하지 않은 해시값입니다.', 'V10');
  }

  static response() {
    return createApiResponseOption(BAD_REQUEST, 'V10', null);
  }
}

export class VideoLackException extends HttpBadRequestException {
  constructor() {
    super(
      '현재 페이지에 존재하는 비디오와 요청된 비디오의 개수가 다릅니다.',
      'V11',
    );
  }

  static response() {
    return createApiResponseOption(BAD_REQUEST, 'V11', null);
  }
}
