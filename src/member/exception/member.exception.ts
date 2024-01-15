import { NOT_FOUND } from 'src/constant/constant';
import { HttpNotFoundException } from 'src/util/exception.util';
import { createApiResponseOption } from 'src/util/swagger.util';

export class MemberNotFoundException extends HttpNotFoundException {
  constructor() {
    super('회원을 찾을 수 없습니다.', 'M01');
  }

  static response() {
    return createApiResponseOption(NOT_FOUND, 'M01', null);
  }
}
