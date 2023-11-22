import { css } from '@emotion/react';
import Typography from '../foundation/Typography/Typography';

type DescriptionProps = {
  title: string;
  children: React.ReactNode;
};

const Description: React.FC<DescriptionProps> = ({ title, children }) => {
  return (
    <>
      <Typography
        variant="title3"
        component="p"
        css={css`
          margin-bottom: 2rem;
        `}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        css={css`
          line-height: 2rem;
        `}
      >
        {children}
      </Typography>
    </>
  );
};
export default Description;
