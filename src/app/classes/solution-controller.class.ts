import { Observable, Subject, Subscriber } from "rxjs";
import { getLogic1To3 } from "./logic/logic-1to3.class";
import { getLogic2To2 } from "./logic/logic-2to2.class";
import { getLogic3To1 } from "./logic/logic-3to1.class";
import { TLogicFunction } from "./logic/logic-controller.interface";
import { Color } from "./model/colors.class";
import { PlayContainer } from "./model/play-container.class";
import { Solution, SolutionSet } from "./model/solution-set.class";
import { Board } from "./model/board.class";

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
  FIST_SOLUTION,
  BEST_SOLUTION
}

export class WorkerResult {
  result: EWorkerResult;
  solution: Solution | undefined;
}


export class SolutionController {

  private readonly TIME_LIMIT = 2000;

  private canFinish: boolean = false;

  observer: Subscriber<WorkerResult>;
  worker: Worker | undefined;
  result: WorkerResult | undefined;

  constructor() {
    // this.solutionData.logicFunctions.push(getLogic1To3());
    // this.solutionData.logicFunctions.push(getLogic2To2());
    // this.solutionData.logicFunctions.push(getLogic3To1());
  }

  solve(containers: PlayContainer[]): Observable<WorkerResult> {

    return new Observable<WorkerResult>(observer => {
      this.startTimer();
      this.observer = observer;
      if (typeof Worker !== undefined) {
        this.worker = new Worker(new URL('./web-worker.worker', import.meta.url));
        this.worker.onmessage = ({ data }) => {
          this.result = data;
          console.log(data);
          observer.next(data);
          observer.complete();
        };
        this.worker.postMessage(containers);
      } else {
        console.error("Web Workers are not supported in this environment.");
      }
    });
  }

  startTimer() {
    this.canFinish = false;
    setTimeout(() => {
      console.log("Time limit");
      this.canFinish = true;
    }, this.TIME_LIMIT);
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
