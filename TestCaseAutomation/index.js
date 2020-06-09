"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var tl = require("azure-pipelines-task-lib/task");
var tfs_api_helper_1 = require("./helpers/tfs-api.helper");
run();
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var buildId, testPlanId, testRuns, _i, testRuns_1, testRun, testResultsWithTestCaseIdArray, testCases, testPlanReference, testPointsFromResults, testPlans, _a, testPlans_1, testPlan, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 14, , 15]);
                    return [4 /*yield*/, tl.getInput("buildId")];
                case 1:
                    buildId = _b.sent();
                    return [4 /*yield*/, tl.getInput("testPlanId")];
                case 2:
                    testPlanId = _b.sent();
                    if (!(buildId !== undefined)) return [3 /*break*/, 13];
                    return [4 /*yield*/, tfs_api_helper_1.getTestRunsRequest(buildId)];
                case 3:
                    testRuns = _b.sent();
                    if (testRuns === undefined) {
                        console.log("Test runs for build " + buildId + " not found");
                        return [2 /*return*/];
                    }
                    _i = 0, testRuns_1 = testRuns;
                    _b.label = 4;
                case 4:
                    if (!(_i < testRuns_1.length)) return [3 /*break*/, 13];
                    testRun = testRuns_1[_i];
                    return [4 /*yield*/, getTestResultsWithTestCaseIdCollection(testRun)];
                case 5:
                    testResultsWithTestCaseIdArray = _b.sent();
                    testCases = testResultsWithTestCaseIdArray
                        .filter(function (x) { return x.testCase !== undefined; })
                        .map(function (x) { return x.testCase; });
                    if (testCases === undefined || testCases.length === 0) {
                        console.log("No scoped test results in test run " + testRun.id);
                        return [3 /*break*/, 12];
                    }
                    if (!(testPlanId !== undefined && testPlanId.length > 0)) return [3 /*break*/, 7];
                    testPlanReference = {
                        id: testPlanId
                    };
                    return [4 /*yield*/, createTestRunWithTetheredResults(testPlanReference, testRun, testResultsWithTestCaseIdArray)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 7: return [4 /*yield*/, tfs_api_helper_1.getTestPointsByTestCasesRequest(testCases)];
                case 8:
                    testPointsFromResults = _b.sent();
                    testPlans = testPointsFromResults
                        .map(function (x) { return x.testPlan; })
                        .filter(function (item, i, array) {
                        return array.findIndex(function (x) { return x.id === item.id; }) === i;
                    });
                    if (!(testPlans !== undefined && testPlans.length > 0)) return [3 /*break*/, 12];
                    _a = 0, testPlans_1 = testPlans;
                    _b.label = 9;
                case 9:
                    if (!(_a < testPlans_1.length)) return [3 /*break*/, 12];
                    testPlan = testPlans_1[_a];
                    return [4 /*yield*/, createTestRunWithTetheredResults(testPlan, testRun, testResultsWithTestCaseIdArray)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11:
                    _a++;
                    return [3 /*break*/, 9];
                case 12:
                    _i++;
                    return [3 /*break*/, 4];
                case 13: return [3 /*break*/, 15];
                case 14:
                    err_1 = _b.sent();
                    tl.setResult(tl.TaskResult.Failed, err_1.message);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
function createTestRunWithTetheredResults(testPlan, testRun, testResultsWithTestCase) {
    return __awaiter(this, void 0, void 0, function () {
        var testPlanFull, testSuites, testPoints, associatedTestRun, testResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tfs_api_helper_1.getTestPlanInfoRequest(testPlan)];
                case 1:
                    testPlanFull = _a.sent();
                    return [4 /*yield*/, tfs_api_helper_1.getTestSuitesForPlanRequest(testPlanFull)];
                case 2:
                    testSuites = _a.sent();
                    return [4 /*yield*/, getTestPoints(testSuites)];
                case 3:
                    testPoints = _a.sent();
                    return [4 /*yield*/, tfs_api_helper_1.createTestRunRequest(testRun, testPoints, testPlanFull)];
                case 4:
                    associatedTestRun = _a.sent();
                    return [4 /*yield*/, tfs_api_helper_1.getTestResultsRequest(associatedTestRun)];
                case 5:
                    testResults = _a.sent();
                    return [4 /*yield*/, updateTestResults(associatedTestRun, testResults, testResultsWithTestCase)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, updateTestRun(associatedTestRun, testRun)];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getTestResultsWithTestCaseIdCollection(testRun) {
    return __awaiter(this, void 0, void 0, function () {
        var testResultsWithTestCase, testResults, _i, testResults_1, testResult, testCaseId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testResultsWithTestCase = new Array();
                    return [4 /*yield*/, tfs_api_helper_1.getTestResultsRequest(testRun)];
                case 1:
                    testResults = _a.sent();
                    if (!(testResults !== undefined)) return [3 /*break*/, 5];
                    _i = 0, testResults_1 = testResults;
                    _a.label = 2;
                case 2:
                    if (!(_i < testResults_1.length)) return [3 /*break*/, 5];
                    testResult = testResults_1[_i];
                    return [4 /*yield*/, parseTestCaseId(testResult.testCaseTitle)];
                case 3:
                    testCaseId = _a.sent();
                    if (testCaseId !== undefined) {
                        testResult.testCase = {
                            id: testCaseId,
                            name: undefined
                        };
                        testResultsWithTestCase.push(testResult);
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Parsed test results: [" + testResultsWithTestCase.map(function (x) { var _a; return (_a = x.testCase) === null || _a === void 0 ? void 0 : _a.id; }).join(", ") + "]");
                    return [2 /*return*/, testResultsWithTestCase];
            }
        });
    });
}
function updateTestResults(testRun, target, source) {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, _i, target_1, targetTestResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (targetTestResult) {
                        var sourceTargetResult = source.find(function (x) { var _a, _b; return ((_a = x.testCase) === null || _a === void 0 ? void 0 : _a.id) === ((_b = targetTestResult.testCase) === null || _b === void 0 ? void 0 : _b.id); });
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
                    };
                    for (_i = 0, target_1 = target; _i < target_1.length; _i++) {
                        targetTestResult = target_1[_i];
                        _loop_1(targetTestResult);
                    }
                    return [4 /*yield*/, tfs_api_helper_1.updateTestResultsRequest(testRun, target)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function updateTestRun(target, source) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    target.state = source.state;
                    return [4 /*yield*/, tfs_api_helper_1.updateTestRunRequest(target)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getTestPoints(testSuites) {
    return __awaiter(this, void 0, void 0, function () {
        var testPoints, _i, testSuites_1, testSuit, testPointsArrayResponse, _a, testPointsArrayResponse_1, testPoint;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    testPoints = new Array();
                    _i = 0, testSuites_1 = testSuites;
                    _b.label = 1;
                case 1:
                    if (!(_i < testSuites_1.length)) return [3 /*break*/, 4];
                    testSuit = testSuites_1[_i];
                    return [4 /*yield*/, tfs_api_helper_1.getTestPointsRequest(testSuit)];
                case 2:
                    testPointsArrayResponse = _b.sent();
                    for (_a = 0, testPointsArrayResponse_1 = testPointsArrayResponse; _a < testPointsArrayResponse_1.length; _a++) {
                        testPoint = testPointsArrayResponse_1[_a];
                        testPoints.push(testPoint);
                    }
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, testPoints];
            }
        });
    });
}
function parseTestCaseId(testCaseTitle) {
    var testCaseId = /_\d{4,6}$/.exec(testCaseTitle);
    if (testCaseId !== null) {
        return testCaseId[0].replace('_', '');
    }
    return undefined;
}
