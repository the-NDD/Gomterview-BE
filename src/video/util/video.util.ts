import { isEmpty } from 'class-validator';
import { DEFAULT_THUMBNAIL } from 'src/constant/constant';

export const parseThumbnail = (thumbnail: string): string => {
  if (thumbnail === DEFAULT_THUMBNAIL || isEmpty(thumbnail)) {
    return '';
  }

  return thumbnail;
};
