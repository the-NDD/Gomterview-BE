export class DeleteWorkbooksEvent {
  static readonly MESSAGE = 'workbook.delete';

  readonly workbookIds: number[];

  constructor(workbookIds: number[]) {
    this.workbookIds = workbookIds;
  }

  static of(workbookIds: number[]) {
    return new DeleteWorkbooksEvent(workbookIds);
  }
}
