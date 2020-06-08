import {IShallowReference} from "./IShallowReference";

export interface ITestResult {
    id: number,
    testCase: IShallowReference | undefined,
    testCaseTitle: string,
    outcome: string,
    comment: string,
    project: any,
    startedDate: string,
    completedDate: string,
    durationInMs: number,
    state: string,
    failureType: string,
    errorMessage: string
}