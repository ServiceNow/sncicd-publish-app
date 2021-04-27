import { AxiosResponse } from 'axios'

export type versionType = string

export interface User {
    username: string;
    password: string;
}

export interface AppProps extends User {
    nowSourceInstance: string;
    githubRunNum: string;
    workspace: string;
    versionFormat: string;
    appSysID: string;
    scope: string;
    devNotes?: string;
    isAppCustomization?: boolean;
}

export interface RequestBody {
    branch_name: branch_name;
}
export interface Params {
    sys_id?: string;
    scope?: string;
}
export interface requestOptions extends Params {
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
    USERNAME = 'nowUsername is not set',
    PASSWORD = 'nowPassword is not set',
    INSTANCE = 'nowSourceInstance is not set',
    SYSID_OR_SCOPE = 'Please specify scope or sys_id',
    VERSION_FORMAT = 'No version format selected',
    DETECT_SYS_ID_SCOPE = 'For templateVersion = detect, appSysID and appScope are required',
    GITHUB_WORKSPACE = 'GITHUB_WORKSPACE is missing',
    INCORRECT_CONFIG = 'Configuration is incorrect',
    INCORRECT_VERSION_FORMAT = 'Incorrect or not selected versionFormat variable',
    CANCELLED = 'Canceled',
    MISSING_VERSION = 'Version is not set in the workflow',
    MISSING_VERSION_TEMPLATE = 'versionTemplate is not set in the workflow',
    INCORRECT_VERSIONS = 'Versions are incorrect',
    NEGATIVE_INCREMENT = 'Increment should be positive or zero',
    NO_SYS_ID = 'sys_id not defined',
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
        'User-Agent': string,
        Accept: string,
    };
    auth: User;
}
