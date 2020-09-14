"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// import fs from 'fs'
const app_types_1 = require("./app.types");
class App {
    constructor(props) {
        this.sleepTime = 3000;
        this.messages = {
            incorrectConfig: 'Configuration is incorrect',
            canceledMsg: 'Canceled',
        };
        this.errCodeMessages = {
            401: 'The user credentials are incorrect.',
            403: 'Forbidden. The user is not an admin or does not have the CICD role.',
            404: 'Not found. The requested item was not found.',
            405: 'Invalid method. The functionality is disabled.',
            409: 'Conflict. The requested item is not unique.',
            500: 'Internal server error. An unexpected error occurred while processing the request.',
        };
        this.snowSourceInstance = props.snowSourceInstance;
        this.rootFolder = props.rootFolder;
        this.user = {
            username: props.username,
            password: props.password,
        };
        this.config = {
            headers: { Accept: 'application/json' },
            auth: this.user,
        };
    }
    buildRequestUrl(instance, appSysId) {
        if (!instance || !appSysId)
            throw new Error(this.messages.incorrectConfig);
        return `https://${instance}.service-now.com/api/sn_cicd/app_repo/install?app_sys_id=${appSysId}`;
    }
    /**
     * Makes the request to SNow api publish_app
     *
     * @param appSysId  sys_id of the servicenow app
     *
     * @returns         Promise void
     */
    async publishApp(appSysId) {
        // build the request api url
        const url = this.buildRequestUrl(this.snowSourceInstance, appSysId);
        // set the branch to update on SNow side
        const body = {
        // branch_name: branch,
        };
        try {
            const response = await axios_1.default.post(url, body, this.config);
            await this.printStatus(response.data.result);
        }
        catch (error) {
            let message;
            if (error.code) {
                message = this.errCodeMessages[error.code || error.response.status];
            }
            else {
                message = error.message;
            }
            throw new Error(message);
        }
    }
    /**
     * Some kind of throttling, it used to limit the number of requests
     * in the recursion
     *
     * @param ms    Number of milliseconds to wait
     *
     * @returns      Promise void
     */
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
    /**
     * Print the result of the task.
     * Execution will continue.
     * Task will be working until it get the response with successful or failed or canceled status.
     *
     * @param result    TaskResult enum of Succeeded, SucceededWithIssues, Failed, Cancelled or Skipped.
     *
     * @returns         void
     */
    async printStatus(result) {
        if (+result.status === app_types_1.ResponseStatus.Pending)
            console.log(result.status_label);
        if (+result.status === app_types_1.ResponseStatus.Running)
            console.log(`${result.status_label}: ${result.percent_complete}%`);
        // Recursion to check the status of the request
        if (+result.status < app_types_1.ResponseStatus.Successful) {
            const response = await axios_1.default.get(result.links.progress.url, this.config);
            // Throttling
            await this.sleep(this.sleepTime);
            // Call itself if the request in the running or pending state
            await this.printStatus(response.data.result);
        }
        else {
            console.log(result.status_message);
            console.log(result.status_detail);
            // Log the success result, the step of the pipeline is success as well
            if (+result.status === app_types_1.ResponseStatus.Successful) {
                console.log(result.status_label);
            }
            // Log the failed result, the step throw an error to fail the step
            if (+result.status === app_types_1.ResponseStatus.Failed) {
                throw new Error(result.error);
            }
            // Log the canceled result, the step throw an error to fail the step
            if (+result.status === app_types_1.ResponseStatus.Canceled) {
                throw new Error(this.messages.canceledMsg);
            }
        }
    }
    getAppVersion(sysId, scope) {
        console.log(sysId);
        if (this.rootFolder) {
            console.log('Looking in ' + [this.rootFolder, scope].join('/'));
        }
        else {
            throw new Error('GITHUB_WORKSPACE env not found\n');
        }
    }
}
exports.default = App;
