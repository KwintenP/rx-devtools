export enum EVENT_TYPE {
  NEXT, ERROR, COMPLETE
}

export interface RxDevtoolsObservable {
  operators: Array<{
    operatorName?: string,
    operatorId: string,
    values: Array<{ percentage: number, value?: any, type: EVENT_TYPE}>
  }>;
  obsParents?: string[];
  standalone: boolean;
  name?: string;
}
