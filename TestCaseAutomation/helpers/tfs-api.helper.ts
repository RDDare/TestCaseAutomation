import request from "request-promise-native";
import tl = require('azure-pipelines-task-lib/task');
import {ITestSuit} from "../models/ITestSuit";
import {ITfsDto} from "../DTO/ITfsDto";
import {ITestPoint} from "../models/ITestPoint";
import {IShallowReference} from "../models/IShallowReference";
import {ITestRun} from "../models/ITestRun";
import {ITestResult} from "../models/ITestResult";
import moment from "moment";

const accessToken = tl.getEndpointAuthorization('SystemVssConnection', true)?.parameters.AccessToken;
const collectionUrl = process.env['SYSTEM_TEAMFOUNDATIONSERVERURI'];
const teamProject = process.env['SYSTEM_TEAMPROJECT'];

const projectApi = `${collectionUrl}/${teamProject}/_apis`;
const apiVersion = '5.1-preview';

export async function getTestPointsRequest(testSuit: ITestSuit) {
    console.log(`-- Get test points from testSuit '${testSuit.id} - ${testSuit.name}' --`);
    const uri = `${projectApi}/testplan/Plans/${testSuit.plan.id}/Suites/${testSuit.id}/TestPoint`;
    const response = await getRequest<ITfsDto<ITestPoint>>(uri);
    console.log(`Test suit '${testSuit.name}' has ${response.count}`)
    return response.value;
}

export async function getTestPointsByTestCasesRequest(testCases: Array<IShallowReference>): Promise<Array<ITestPoint>> {
    console.log(`-- Get test points from testcases --`);
    const uri = `${projectApi}/test/points`;
    const response = await postRequest<any>(uri, {
        pointsFilter: {
            testcaseIds: testCases.map(x => x.id)
        }
    });

    return response.points as Array<ITestPoint>;
}

export async function getTestSuitesForPlanRequest(testPlan: IShallowReference) {
    console.log(`-- Get test suites for test plan ${testPlan.id} --`);
    const uri = `${projectApi}/testplan/Plans/${testPlan.id}/suites`;
    const response = await getRequest<ITfsDto<ITestSuit>>(uri);
    console.log(`Test suites count: ${response.count}`);
    return response.value;
}

export async function updateTestResultsRequest(testRun: ITestRun, testResults: Array<ITestResult>) {
    console.log(`-- Update test results '${testRun.id} - ${testRun.name}' --`);
    const uri = `${projectApi}/test/Runs/${testRun.id}/results`;
    await postRequest(uri, testResults, true);
    console.log("Test results updated successfully");
}

export async function updateTestRunRequest(testRun: ITestRun) {
    console.log(`-- Update testrun '${testRun.id} - ${testRun.name}' --`);
    const uri = `${projectApi}/test/Runs/${testRun.id}`;
    await postRequest(uri, testRun, true);
    console.log("Test run updated successfully");
}

export async function createTestRunRequest(testRun: ITestRun, testPoints: Array<ITestPoint>, testPlan: IShallowReference) {
    console.log(`-- Create new test run --`);
    const uri = `${projectApi}/test/runs`;
    const response = await postRequest<ITestRun>(uri, {
        name: `${testPlan.name}_${testRun.buildConfiguration.id}`,
        automated: true,
        build: {
            id: testRun.buildConfiguration.id
        },
        completeDate: testRun.completedDate,
        owner: testRun.owner,
        pointIds: testPoints.map(x => x.id),
        state: "InProgress",
        startedDate: testRun.startedDate,
        project: testRun.project,
        revision: testRun.revision,
        plan: {
            id: testPlan.id
        }
    });

    console.log(`Test run '${response.id}-${response.name}' created successfully`);
    return response;
}

export async function getTestRunsRequest(buildId: string): Promise<Array<ITestRun>> {
    const yesterday = moment().subtract(1, 'days').toISOString();
    const tomorrow = moment().toISOString();

    console.log(`-- Get test runs for build ${buildId} --`);
    const uri = `${projectApi}/test/runs?minLastUpdatedDate=${yesterday}&maxLastUpdatedDate=${tomorrow}&buildIds=${buildId}`;
    const response = await getRequest<ITfsDto<ITestRun>>(uri);
    console.log(`Test runs count: ${response.count}`);
    return response.value;
}

export async function getTestResultsRequest(testRun: ITestRun) {
    console.log(`-- Get test results from '${testRun.id} - ${testRun.name}' test run`);
    const url = `${projectApi}/test/runs/${testRun.id}/results`;
    const response = await getRequest<ITfsDto<ITestResult>>(url);
    console.log(`The test run '${testRun.id} - ${testRun.name}' has ${response.count} tests`);
    return response.value;
}

export async function getTestPlanInfoRequest(testPlan: IShallowReference) {
    console.log(`-- Get test plan '${testPlan.id}' info --`);
    const url = `${projectApi}/testplan/plans/${testPlan.id}`;
    const response = await getRequest<IShallowReference>(url);
    console.log(`Received details for test plan '${response.id} - ${response.name}'`);
    return response;
}

async function getRequest<T>(uri: string): Promise<T> {
    return await request.get({
            uri: uri,
            headers: {
                authorization: "Basic " + Buffer.from(`"":${accessToken}`).toString('base64'),
                'content-type': 'application/json',
            },
            json: true,
        }
    ) as T;
}

async function postRequest<T>(uri: string, body: any, patch = false): Promise<T> {
    const options = {
        uri: uri,
        headers: {
            authorization: "Basic " + Buffer.from(`"":${accessToken}`).toString('base64'),
            'content-type': 'application/json',
            accept: `api-version=${apiVersion}`
        },
        body: JSON.stringify(body)
    };

    const response = await (patch ? request.patch(options) : request.post(options));
    return JSON.parse(response) as T;
}