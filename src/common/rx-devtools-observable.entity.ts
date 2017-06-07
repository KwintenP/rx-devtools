export interface RxDevtoolsObservable {
  operators: Array<{ operatorName?: string, operatorId: string, values: Array<{ percentage: number, value: any }> }>;
  obsParents?: string[];
  standalone: boolean;
  name?: string;
};
