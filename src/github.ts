import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { Await } from './ts';

let octokitSingleton: ReturnType<typeof getOctokit>;

export function getOctokitSingleton(token: string) {
  if (octokitSingleton) {
    return octokitSingleton;
  }
//  const githubToken = core.getInput('github_token');
  octokitSingleton = getOctokit(token);
  return octokitSingleton;
}

export async function listTags(token: string) {
  const octokit = getOctokitSingleton(token);

  const tags = await octokit.repos.listTags({
    ...context.repo,
    per_page: 100,
  });

  return tags.data;
}

export async function createTag(
  token: string,
  newTag: string,
  createAnnotatedTag: boolean,
  GITHUB_SHA: string
) {
  const octokit = getOctokitSingleton(token);
  let annotatedTag:
    | Await<ReturnType<typeof octokit.git.createTag>>
    | undefined = undefined;
  if (createAnnotatedTag) {
    core.debug(`Creating annotated tag.`);
    annotatedTag = await octokit.git.createTag({
      ...context.repo,
      tag: newTag,
      message: newTag,
      object: GITHUB_SHA,
      type: 'commit',
    });
  }

  core.debug(`Pushing new tag to the repo.`);
  await octokit.git.createRef({
    ...context.repo,
    ref: `refs/tags/${newTag}`,
    sha: annotatedTag ? annotatedTag.data.sha : GITHUB_SHA,
  });
}