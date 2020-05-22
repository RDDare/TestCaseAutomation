import tl = require('azure-pipelines-task-lib/task');
import request from 'request-promise-native';

const collectionUrl = process.env['SYSTEM_TEAMFOUNDATIONSERVERURI'];
const teamProject = process.env['SYSTEM_TEAMPROJECT'];
console.log(`Team foundation server uri: ${collectionUrl}`);
console.log(process.env);
const accessToken = tl.getEndpointAuthorization('SystemVssConnection', true)?.parameters.AccessToken;
const apiVersion = '5.1';
run();

async function run() {
    try {
        console.log('--Get process env info--');
        console.log(process.env);
        // await getWorkItemsFromRelease();
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

async function getWorkItemsFromRelease() {
    const releaseId = process.env['RELEASE_RELEASEID'];
    const uri = `${collectionUrl}/${teamProject}/_apis/release/releases/${releaseId}/workitems`;
    console.log(`Collection work items associated with release from ${uri}`);
    const options = createGetRequestOptions(uri);
    const result = await request.get(options);
    console.log(`Collected ${result.count} work items for tagging from release`);
    return result.value;
}

function createGetRequestOptions(uri: string): any {
    return {
        uri: uri,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        json: true,
    };
}

function getPatchRequestOptions(uri: string, newTags: string): any {
    return {
        uri: uri,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json-patch+json',
        },
        body: [
            {
                op: 'add',
                path: '/fields/System.Tags',
                value: newTags,
            },
        ],
        json: true,
    };
}