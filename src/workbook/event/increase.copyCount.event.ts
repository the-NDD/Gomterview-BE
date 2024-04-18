export class IncreaseCopyCountEvent {
  static readonly MESSAGE = 'workbook.increase.copycount';

  readonly workbookId: number;

  constructor(workbookId: number) {
    this.workbookId = workbookId;
  }

  static of(workbookId: number) {
    return new IncreaseCopyCountEvent(workbookId);
  }
}
