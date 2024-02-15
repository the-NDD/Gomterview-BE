import { Question } from '../entity/question';
import { CreateQuestionRequest } from '../dto/createQuestionRequest';
import { workbookFixtureWithId } from '../../workbook/fixture/workbook.fixture';
import { CopyQuestionRequest } from '../dto/copyQuestionRequest';
import { UpdateIndexInWorkbookRequest } from '../dto/updateIndexInWorkbookRequest';

export const questionFixture = new Question(
  1,
  'tester',
  workbookFixtureWithId.id,
  null,
  new Date(),
  null,
);

export const questionListFixture = [
  new Question(1, 'tester', workbookFixtureWithId.id, null, new Date(), null),
  new Question(2, 'tester', workbookFixtureWithId.id, null, new Date(), null),
  new Question(3, 'tester', workbookFixtureWithId.id, null, new Date(), null),
  new Question(4, 'tester', workbookFixtureWithId.id, null, new Date(), null),
];

export const createQuestionRequestFixture = new CreateQuestionRequest(
  workbookFixtureWithId.id,
  'tester',
);

export const copyQuestionRequestFixture = new CopyQuestionRequest(
  workbookFixtureWithId.id,
  [1, 2, 3],
);

export const updateIndexInWorkbookRequestFixture =
  new UpdateIndexInWorkbookRequest(workbookFixtureWithId.id, [1, 2, 3]);
