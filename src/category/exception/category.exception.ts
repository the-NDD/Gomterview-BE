import { createApiResponseOption } from 'src/util/swagger.util';
import { HttpNotFoundException } from '../../util/exception.util';
import { NOT_FOUND } from 'src/constant/constant';

class CategoryNotFoundException extends HttpNotFoundException {
  constructor() {
    super('카테고리가 존재하지 않습니다.', 'C02');
  }

  static response() {
    return createApiResponseOption(NOT_FOUND, 'C02', null);
  }
}

export { CategoryNotFoundException };
