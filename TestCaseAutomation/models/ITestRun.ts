import {IShallowReference} from "./IShallowReference";

export interface ITestRun extends IShallowReference{
    buildConfiguration: IShallowReference,
    completedDate: string,
    owner: any,
    project: IShallowReference,
    revision: number,
    startedDate: string,
    state: string,
}