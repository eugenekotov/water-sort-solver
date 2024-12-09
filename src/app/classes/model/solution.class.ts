export class Step {
  iFrom: number;
  iTo: number;
}

export class Solution {

  steps: Step[] = [];

  constructor() {
    this.steps.push({ iFrom: 5, iTo: 4 });
    this.steps.push({ iFrom: 5, iTo: 6 });
    this.steps.push({ iFrom: 5, iTo: 10 });
    this.steps.push({ iFrom: 5, iTo: 1 });
  }

}
