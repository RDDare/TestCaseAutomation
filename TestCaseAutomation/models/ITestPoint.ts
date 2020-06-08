import {IShallowReference} from "./IShallowReference";

export interface ITestPoint {
    id: string,
    testCase: IShallowReference,
    outcome: string,
    testPlan: IShallowReference
}