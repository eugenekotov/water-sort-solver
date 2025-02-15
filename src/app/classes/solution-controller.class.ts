import { Observable, Subscriber } from "rxjs";
import { Color } from "./model/colors.class";
import { PlayContainer } from "./model/play-container.class";
import { Solution } from "./model/solution-set.class";

export class Step {
  iFrom: number;
  iTo: number;
  color: Color;
  notes: string = "";

  constructor(iFrom: number, iTo: number, color: Color) {
    this.iFrom = iFrom;
    this.iTo = iTo;
    this.color = color;
  }

  public clone(): Step {
    const step = new Step(this.iFrom, this.iTo, this.color);
    step.notes = this.notes;
    return step;
  }

  public equals(step: Step) {
    return this.iFrom === step.iFrom && this.iTo === step.iTo && this.color === step.color;
  }
}

export enum EWorkerResult {
  CANCEL,
  NO_SOLUTION,
  SOLUTION,
  BEST_SOLUTION
}

export class WorkerResult {
  result: EWorkerResult;
  solution: Solution | undefined;
}


export class SolutionController {

  private readonly TIME_LIMIT = 3000;

  private canFinish: boolean = false;

  private observer: Subscriber<WorkerResult>;
  private worker: Worker | undefined;
  private tempResult: WorkerResult | undefined;

  constructor() {
  }

  solve(containers: PlayContainer[]): Observable<WorkerResult> {

    return new Observable<WorkerResult>(observer => {
      this.startTimer();
      this.observer = observer;
      if (typeof Worker !== undefined) {
        this.worker = new Worker(new URL('./web-worker.worker', import.meta.url));
        this.worker.onmessage = ({ data }) => {
          const messageData: WorkerResult = data;
          if (messageData.result === EWorkerResult.SOLUTION) {
            this.tempResult = messageData;
            if (this.canFinish) {
              this.stopByTimer();
            }
          } else {
            this.worker = undefined;
            observer.next(messageData);
            observer.complete();
          }
        };
        this.worker.postMessage(containers);
      } else {
        console.error("Web Workers are not supported in this environment.");
      }
    });
  }

  private startTimer() {
    this.canFinish = false;
    setTimeout(() => {
      this.canFinish = true;
      if (this.tempResult) {
        this.stopByTimer();
      }
    }, this.TIME_LIMIT);
  }

  private stopByTimer() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
      this.tempResult!.result = EWorkerResult.SOLUTION;
      this.observer.next(this.tempResult);
      this.observer.complete();
    }
  }

  cancel() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
      const result: WorkerResult = {
        result: EWorkerResult.CANCEL,
        solution: undefined
      }
      this.observer.next(result);
      this.observer.complete();
    }
  }

}
