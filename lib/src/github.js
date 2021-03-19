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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTag = exports.listTags = exports.getOctokitSingleton = void 0;
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
let octokitSingleton;
function getOctokitSingleton(token) {
    if (octokitSingleton) {
        return octokitSingleton;
    }
    //  const githubToken = core.getInput('github_token');
    octokitSingleton = github_1.getOctokit(token);
    return octokitSingleton;
}
exports.getOctokitSingleton = getOctokitSingleton;
async function listTags(token) {
    const octokit = getOctokitSingleton(token);
    const tags = await octokit.repos.listTags({
        ...github_1.context.repo,
        per_page: 100,
    });
    return tags.data;
}
exports.listTags = listTags;
async function createTag(token, newTag, createAnnotatedTag, GITHUB_SHA) {
    const octokit = getOctokitSingleton(token);
    let annotatedTag = undefined;
    if (createAnnotatedTag) {
        core.debug(`Creating annotated tag.`);
        annotatedTag = await octokit.git.createTag({
            ...github_1.context.repo,
            tag: newTag,
            message: newTag,
            object: GITHUB_SHA,
            type: 'commit',
        });
    }
    core.debug(`Pushing new tag to the repo.`);
    await octokit.git.createRef({
        ...github_1.context.repo,
        ref: `refs/tags/${newTag}`,
        sha: annotatedTag ? annotatedTag.data.sha : GITHUB_SHA,
    });
}
exports.createTag = createTag;
