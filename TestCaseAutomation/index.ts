import tl = require('azure-pipelines-task-lib/task');
import {ITestRun} from "./models/ITestRun";
import {ITestResult} from "./models/ITestResult";
import {ITestSuit} from "./models/ITestSuit";
import {ITestPoint} from "./models/ITestPoint";
import {IShallowReference} from "./models/IShallowReference";
import {
    createTestRunRequest,
    getTestPointsByTestCasesRequest,
    getTestPointsRequest,
    getTestResultsRequest,
    getTestRunsRequest,
    getTestSuitesForPlanRequest,
    getTestSuitesRequest,
    updateTestResultsRequest,
    updateTestRunRequest
} from "./helpers/tfs-api.helper";

run();

async function run() {
    try {
        const buildId = await tl.getInput("buildId");

        if (buildId !== undefined) {
            // Get testRuns for buildId
            const testRuns = await getTestRunsRequest(buildId);
            if (testRuns !== undefined) {
                for (const testRun of testRuns) {
                    // Collection of associated testResults
                    const testResultsWithTestCaseIdArray = await getTestResultsWithTestCaseIdCollection(testRun);
                    const testCases = testResultsWithTestCaseIdArray
                        .filter(x => x.testCase !== undefined)
                        .map(x => x.testCase as IShallowReference);

                    if (testCases != undefined && testCases.length > 0) {
                        const testPointsFromResults = await getTestPointsByTestCasesRequest(testCases);

                        const testPlans = testPointsFromResults
                            .map(x => x.testPlan)
                            .filter((item, i, array) => {
                                return array.findIndex(x => x.id === item.id) === i
                            });

                        if (testPlans !== undefined && testPlans.length > 0) {
                            for (const testPlan of testPlans) {
                                const testSuites = await getTestSuitesForPlanRequest(testPlan);
                                const testPoints = await getTestPoints(testSuites);
                                const associatedTestRun = await createTestRunRequest(testRun, testPoints, testPlan);
                                const testResults = await getTestResultsRequest(associatedTestRun);
                                await updateTestResults(associatedTestRun, testResults, testResultsWithTestCaseIdArray);
                                await updateTestRun(associatedTestRun, testRun);
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

async function getTestResultsWithTestCaseIdCollection(testRun: ITestRun): Promise<Array<ITestResult>> {
    const testResultsWithTestCase = new Array<ITestResult>();

    const testResults = await getTestResultsRequest(testRun);
    if (testResults !== undefined) {
        for (let testResult of testResults) {
            const testCaseId = await parseTestCaseId(testResult.testCaseTitle);
            if (testCaseId !== undefined) {
                testResult.testCase = {
                    id: testCaseId,
                    name: undefined
                };

                testResultsWithTestCase.push(testResult);
            }
        }
    }

    console.log(`Parsed test results: [${testResultsWithTestCase.map(x => x.testCase?.id).join(", ")}]`)
    return testResultsWithTestCase;
}

async function updateTestResults(testRun: ITestRun, target: Array<ITestResult>, source: Array<ITestResult>) {
    for (const targetTestResult of target) {
        const sourceTargetResult = source.find(x => x.testCase?.id === targetTestResult.testCase?.id);
        if (sourceTargetResult !== undefined) {
            targetTestResult.startedDate = sourceTargetResult.startedDate;
            targetTestResult.completedDate = sourceTargetResult.completedDate;
            targetTestResult.durationInMs = sourceTargetResult.durationInMs;
            targetTestResult.outcome = sourceTargetResult.outcome;
            targetTestResult.state = sourceTargetResult.state;
            targetTestResult.failureType = sourceTargetResult.failureType;
            targetTestResult.comment = sourceTargetResult.testCaseTitle;
            targetTestResult.errorMessage = sourceTargetResult.errorMessage;
        }
    }

    await updateTestResultsRequest(testRun, target);
}

async function updateTestRun(target: ITestRun, source: ITestRun) {
    target.state = source.state;
    await updateTestRunRequest(target);
}

async function getTestPoints(testSuites: Array<ITestSuit>): Promise<Array<ITestPoint>> {
    const testPoints = new Array<ITestPoint>();
    for (const testSuit of testSuites) {
        const testPointsArrayResponse = await getTestPointsRequest(testSuit);
        for (const testPoint of testPointsArrayResponse) {
            testPoints.push(testPoint);
        }
    }

    return testPoints;
}

function parseTestCaseId(testCaseTitle: string): string | undefined {
    const testCaseId = /\d{4,}/.exec(testCaseTitle);

    if (testCaseId !== null) {
        return testCaseId[0];
    }

    return undefined;
}
