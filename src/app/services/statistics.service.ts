import { Injectable } from '@angular/core';
import { Utils } from '../classes/utils.class';
import { STORAGE_KEY } from '../classes/model/const.class';

export class StatisticsModel {
    // key - game hash
    gamesStatistics: Map<string, GameStatisticsModel> = new Map<string, GameStatisticsModel>();
}

export class GameStatisticsModel {
    stepCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class StatisticsService {

    private static readonly STATISTICS_KEY = "-statistics";
    private data: StatisticsModel = new StatisticsModel();

    constructor() {
        this.load();
    }

    public updateStepCount(hash: string, stepCount: number) {
        let gameStat: GameStatisticsModel | undefined = this.data.gamesStatistics.get(hash);
        if (gameStat === undefined) {
            gameStat = { stepCount: stepCount };
            this.data.gamesStatistics.set(hash, gameStat);
        } else {
            if (gameStat.stepCount === 0 || gameStat.stepCount > stepCount) {
                gameStat.stepCount = stepCount;
            }
        }
        this.save();
    }

    public getGameCount() {
        return this.data.gamesStatistics.size;
    }

    public getStepCount(hash: string): number {
        const gameStat: GameStatisticsModel | undefined = this.data.gamesStatistics.get(hash);
        return gameStat === undefined ? 0 : gameStat.stepCount;
    }

    public save() {
        const dataString = JSON.stringify(Object.fromEntries(this.data.gamesStatistics));
        localStorage.setItem(STORAGE_KEY + StatisticsService.STATISTICS_KEY, dataString);
    }

    public load() {
        const dataString = localStorage.getItem(STORAGE_KEY + StatisticsService.STATISTICS_KEY);
        if (dataString) {
            const object = JSON.parse(dataString);
            this.data.gamesStatistics = new Map<string, GameStatisticsModel>(Object.entries(object));
        }
    }

}
