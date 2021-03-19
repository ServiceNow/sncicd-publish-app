"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import { createTag } from './github'
const App_types_1 = require("./App.types");
//import { getOctokitOptions } from '@actions/github/lib/utils'
class App {
    constructor(props) {
        this.sleepTime = 3000;
        this.errCodeMessages = {
            401: 'The user credentials are incorrect.',
            403: 'Forbidden. The user is not an admin or does not have the CICD role.',
            404: 'Not found. The requested item was not found.',
            405: 'Invalid method. The functionality is disabled.',
            409: 'Conflict. The requested item is not unique.',
            500: 'Internal server error. An unexpected error occurred while processing the request.',
        };
        this.props = props;
        this.user = {
            username: props.username,
            password: props.password,
        };
        this.config = {
            headers: {
                'User-Agent': 'sncicd_extint_github',
                Accept: 'application/json',
            },
            auth: this.user,
        };
    }
    buildParams(options) {
        return (Object.keys(options)
            .filter(key => {
            // @ts-ignore
            return options.hasOwnProperty(key) && options[key];
        })
            // @ts-ignore
            .map(key => `${key}=${encodeURIComponent(options[key])}`)
            .join('&'));
    }
    /**
     * Takes options object, convert it to encoded URI string
     * and append to the request url
     *
     * @param options   Set of options to be appended as params
     *
     * @returns string  Url to API
     */
    buildRequestUrl(options) {
        if (!this.props.snowSourceInstance || (!options.sys_id && !options.scope))
            throw new Error(App_types_1.Errors.INCORRECT_CONFIG);
        const params = this.buildParams(options);
        return `https://${this.props.snowSourceInstance}.service-now.com/api/sn_cicd/app_repo/publish?${params}`;
    }
    /**
     * Checks version
     * Increment version
     * Makes the request to SNow api publish_app
     * Prints the progress
     * @returns         Promise void
     */
    async publishApp() {
        const github = require('@actions/github');
        const core = require('@actions/core');
        const myToken = this.props.token;
        const octokit = github.getOctokit(myToken);
        const { data: pullRequest } = await octokit.pulls.get({
            owner: 'octokit',
            repo: 'rest.js',
            pull_number: 123,
            mediaType: {
                format: 'diff'
            }
        });
        console.log(pullRequest);
        try {
            console.log('App received token as: ' + this.props.token);
            const version = await this.increaseVersion();
            const devNotes = core.getInput('devNotes');
            const params = {};
            if (this.props.appSysID) {
                params.sys_id = this.props.appSysID;
            }
            else {
                params.scope = this.props.scope;
            }
            const options = {
                ...params,
                version,
            };
            const { GITHUB_SHA } = process.env;
            if (!GITHUB_SHA) {
                core.setFailed('Missing GITHUB_SHA.');
                return;
            }
            if (devNotes)
                options.dev_notes = devNotes;
            const url = this.buildRequestUrl(options);
            const response = await axios_1.default.post(url, {}, this.config);
            console.log(`TOken is ${this.props.token}`);
            // await createTag(this.props.token, version, true, 'commit_pipelinetest');
            await this.printStatus(response.data.result);
        }
        catch (error) {
            let message;
            if (error.response && error.response.status) {
                if (this.errCodeMessages[error.response.status]) {
                    message = this.errCodeMessages[error.response.status];
                }
                else {
                    const result = error.response.data.result;
                    message = result.error || result.status_message;
                }
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
     * @returns     Promise void
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
        if (+result.status === App_types_1.ResponseStatus.Pending)
            console.log(result.status_label);
        if (+result.status === App_types_1.ResponseStatus.Running || +result.status === App_types_1.ResponseStatus.Successful)
            console.log(`${result.status_label}: ${result.percent_complete}%`);
        // Recursion to check the status of the request
        if (+result.status < App_types_1.ResponseStatus.Successful) {
            const response = await axios_1.default.get(result.links.progress.url, this.config);
            // Throttling
            await this.sleep(this.sleepTime);
            // Call itself if the request in the running or pending state
            await this.printStatus(response.data.result);
        }
        else {
            // Log the success result, the step of the pipeline is success as well
            if (+result.status === App_types_1.ResponseStatus.Successful) {
                console.log(result.status_message);
                console.log(result.status_detail);
            }
            // Log the failed result, the step throw an error to fail the step
            if (+result.status === App_types_1.ResponseStatus.Failed) {
                throw new Error(result.error || result.status_message);
            }
            // Log the canceled result, the step throw an error to fail the step
            if (+result.status === App_types_1.ResponseStatus.Canceled) {
                throw new Error(App_types_1.Errors.CANCELLED);
            }
        }
    }
    /**
     * Compare versions. Incremented version
     * should be greater that current
     *
     * @param current       Current version of the app converted to [x.x.x]
     * @param newVersion    Incremented version converted to [x.x.x]
     *
     * @returns             Compare result
     */
    checkVersion(current, newVersion) {
        return (newVersion[0] > current[0] ||
            (newVersion[0] === current[0] && newVersion[1] > current[1]) ||
            (newVersion[0] === current[0] && newVersion[1] === current[1] && newVersion[2] > current[2]));
    }
    /**
     * Convert string to array of numbers like [x.x.x]
     *
     * @version Version to split
     *
     * @returns [x,x,x]
     */
    convertVersionToArr(version) {
        return version.split('.').map(v => +v);
    }
    /**
     * Increment the version of the app.
     * It depends on which versionFormat is chosen
     * versionFormat can be set in the workflow file
     * and read in the action.yml file from the input variable
     */
    async increaseVersion() {
        let version;
        const v = (await this.getCurrentAppVersionTableApi(this.props.appSysID)) || '';
        switch (this.props.versionFormat) {
            case App_types_1.VersionFormats.Exact: {
                const input = core.getInput('version');
                if (!input)
                    throw new Error(App_types_1.Errors.MISSING_VERSION);
                this.saveVersions(v, input);
                return input;
            }
            case App_types_1.VersionFormats.Template: {
                const template = core.getInput('versionTemplate');
                if (!template)
                    throw new Error(App_types_1.Errors.MISSING_VERSION_TEMPLATE);
                const current = this.convertVersionToArr(v);
                const newVersion = [template, '.', this.props.githubRunNum].join('');
                if (!this.checkVersion(current, this.convertVersionToArr(newVersion)))
                    throw new Error(App_types_1.Errors.INCORRECT_VERSIONS);
                this.saveVersions(v, newVersion);
                return newVersion;
            }
            case App_types_1.VersionFormats.Detect: {
                if (!this.props.appSysID && !this.props.scope)
                    throw new Error(App_types_1.Errors.DETECT_SYS_ID_SCOPE);
                version = this.getCurrentAppVersionFromRepo();
                break;
            }
            case App_types_1.VersionFormats.AutoDetect: {
                version = v;
                break;
            }
            default: {
                throw new Error(App_types_1.Errors.INCORRECT_VERSION_FORMAT);
            }
        }
        if (version) {
            const rollBack = version;
            //save current version to compare
            //const current: number[] = this.convertVersionToArr(version)
            // log the current version
            console.log('Current version is ' + version);
            // convert the version we got to [x.x.x]
            const versionsArr = version.split('.').map(digit => +digit);
            // increment
            //versionsArr[2]++
            // compare versions
            //if (!this.checkVersion(current, versionsArr)) throw new Error(Errors.INCORRECT_VERSIONS)
            // convert back to string x.x.x
            version = versionsArr.join('.');
            this.saveVersions(rollBack, version);
        }
        else {
            throw new Error('Version not found');
        }
        return version;
    }
    saveVersions(current, incremented) {
        core.setOutput('rollbackVersion', current);
        core.setOutput('newVersion', incremented);
    }
    /**
     * get current app version via now/table rest api
     *
     * @param appSysID
     *
     * @returns {Promise<string|boolean>}
     */
    getCurrentAppVersionTableApi(appSysID) {
        if (appSysID) {
            return axios_1.default
                .get(`https://${this.props.snowSourceInstance}.service-now.com/api/now/table/sys_app/${appSysID}?sysparm_fields=version`, this.config)
                .then((response) => {
                return response.data.result.version || false;
            })
                .catch(e => {
                throw new Error(this.errCodeMessages[e.response.status]);
            });
        }
        else {
            return axios_1.default
                .get(`https://${this.props.snowSourceInstance}.service-now.com/api/now/table/sys_app?sysparm_fields=scope,version`, this.config)
                .then((response) => {
                const result = response.data.result;
                const found = result.find(e => e.scope === this.props.scope);
                return found ? found.version : false;
            })
                .catch(e => {
                throw new Error(this.errCodeMessages[e.response.status]);
            });
        }
    }
    /**
     * Get the version of the app from the current repository.
     * It takes the sus_app_{app_sys_id}_.xml file
     * and parse for version attribute
     */
    getCurrentAppVersionFromRepo() {
        if (this.props.workspace) {
            const projectPath = [this.props.workspace, this.props.appSysID].join('/');
            console.log('Looking in ' + projectPath);
            const match = fs_1.default
                .readFileSync(path_1.default.join(projectPath, 'sys_app_' + this.props.appSysID + '.xml'))
                .toString()
                .match(/<version>([^<]+)<\/version>/);
            if (match) {
                return match[1];
            }
            else {
                throw new Error('Application version not found\n');
            }
        }
        else {
            throw new Error('GITHUB_WORKSPACE env not found\n');
        }
    }
}
exports.default = App;
