import { AxiosResponse } from 'axios'

export type versionType = string

export interface User {
    username: string;
    password: string;
}

export interface AppProps extends User {
    snowSourceInstance: string;
    githubRunNum: string;
    rootFolder: string;
    versionFormat: string;
    appSysID: string;
    scope: string;
    devNotes?: string;
}

export interface RequestBody {
    branch_name: branch_name;
}

export interface requestOptions {
    sys_id: string;
    dev_notes?: string;
    version: versionType;
}

export interface ScopedVersion {
    scope: string;
    version: versionType;
}

export interface ErrorResult {
    status: string;
    status_label: string;
    status_message: string;
    status_detail: string;
    error: string;
}

export interface AppVersionResponse extends AxiosResponse {
    data: {
        result: {
            version: versionType,
        },
    };
}

export type branch_name = string | undefined

export enum Errors {
    USERNAME = 'snowUsername is not set',
    PASSWORD = 'snowPassword is not set',
    INSTANCE = 'snowSourceInstance is not set',
    APPSYSID = 'appSysID is not set',
    APPSCOPE = 'appScope is not set',
    VERSION_FORMAT = 'No version format selected',
    GITHUB_TOKEN = 'GITHUB_TOKEN is missing',
    GITHUB_WORKSPACE = 'GITHUB_WORKSPACE is missing',
    INCORRECT_CONFIG = 'Configuration is incorrect',
    CANCELLED = 'Canceled',
    MISSING_VERSION = 'Version is not set in the workflow',
    MISSING_VERSION_TEMPLATE = 'versionTemplate is not set in the workflow',
    INCORRECT_VERSIONS = 'Versions are incorrect',
}

export interface RequestResponse {
    data: {
        result: RequestResult,
    };
}

export interface RequestResult {
    links: {
        progress: {
            id: string,
            url: string,
        },
    };
    status: string;
    status_label: string;
    status_message: string;
    status_detail: string;
    error: string;
    percent_complete: number;
}

export enum VersionFormats {
    Exact = 'exact',
    Detect = 'detect',
    AutoDetect = 'autodetect',
    Template = 'template',
}

export enum ResponseStatus {
    Pending = 0,
    Running = 1,
    Successful = 2,
    Failed = 3,
    Canceled = 4,
}

export interface axiosConfig {
    headers: {
        Accept: string,
    };
    auth: User;
}
