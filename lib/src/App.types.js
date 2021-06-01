"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatus = exports.VersionFormats = exports.Errors = void 0;
var Errors;
(function (Errors) {
    Errors["USERNAME"] = "nowUsername is not set";
    Errors["PASSWORD"] = "nowPassword is not set";
    Errors["INSTANCE"] = "nowSourceInstance is not set";
    Errors["SYSID_OR_SCOPE"] = "Please specify scope or sys_id";
    Errors["VERSION_FORMAT"] = "No version format selected";
    Errors["DETECT_SYS_ID_SCOPE"] = "For templateVersion = detect, appSysID and appScope are required";
    Errors["GITHUB_WORKSPACE"] = "GITHUB_WORKSPACE is missing";
    Errors["INCORRECT_CONFIG"] = "Configuration is incorrect";
    Errors["INCORRECT_VERSION_FORMAT"] = "Incorrect or not selected versionFormat variable";
    Errors["CANCELLED"] = "Canceled";
    Errors["MISSING_VERSION"] = "Version is not set in the workflow";
    Errors["MISSING_VERSION_TEMPLATE"] = "versionTemplate is not set in the workflow";
    Errors["INCORRECT_VERSIONS"] = "Versions are incorrect";
    Errors["NEGATIVE_INCREMENT"] = "Increment should be positive or zero";
    Errors["NO_SYS_ID"] = "sys_id not defined";
    Errors["REMOVE_SCOPE"] = "appScope should not be defined if isAppCustomization=true";
})(Errors = exports.Errors || (exports.Errors = {}));
var VersionFormats;
(function (VersionFormats) {
    VersionFormats["Exact"] = "exact";
    VersionFormats["Detect"] = "detect";
    VersionFormats["AutoDetect"] = "autodetect";
    VersionFormats["Template"] = "template";
})(VersionFormats = exports.VersionFormats || (exports.VersionFormats = {}));
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["Pending"] = 0] = "Pending";
    ResponseStatus[ResponseStatus["Running"] = 1] = "Running";
    ResponseStatus[ResponseStatus["Successful"] = 2] = "Successful";
    ResponseStatus[ResponseStatus["Failed"] = 3] = "Failed";
    ResponseStatus[ResponseStatus["Canceled"] = 4] = "Canceled";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
