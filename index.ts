// import * as github from '@actions/github'
import * as core from '@actions/core'
import { AppProps, Errors } from './src/App.types'
import App from './src/App'

export const configMsg = '. Configure Github secrets please'

export const run = (): void => {
    try {
        const errors: string[] = []
        const {
            nowUsername = '',
            nowPassword = '',
            nowSourceInstance = '',
            appSysID = '',
            appScope = '',
            GITHUB_WORKSPACE = '',
            GITHUB_RUN_NUMBER = '',
        } = process.env

        const versionFormat: string | undefined = core.getInput('versionFormat')
        const isAppCustomization: boolean = core.getInput('isAppCustomization') === 'true' ? true : false;

        if (!nowUsername) {
            errors.push(Errors.USERNAME)
        }
        if (!nowPassword) {
            errors.push(Errors.PASSWORD)
        }
        if (!nowSourceInstance) {
            errors.push(Errors.INSTANCE)
        }
        if (!versionFormat) {
            errors.push(Errors.VERSION_FORMAT)
        }
        if (!appSysID && !appScope) {
            errors.push(Errors.SYSID_OR_SCOPE)
        }
        if (!GITHUB_WORKSPACE) {
            errors.push(Errors.GITHUB_WORKSPACE)
        }
        if (isAppCustomization && !appSysID) {
            errors.push(Errors.NO_SYS_ID)
        }
        if (isAppCustomization && appScope) {
            errors.push(Errors.REMOVE_SCOPE)
        }

        if (errors.length) {
            core.setFailed(`${errors.join('. ')}${configMsg}`)
        } else {
            const props: AppProps = {
                versionFormat,
                appSysID,
                nowSourceInstance,
                username: nowUsername,
                password: nowPassword,
                scope: appScope,
                isAppCustomization,
                workspace: GITHUB_WORKSPACE,
                githubRunNum: GITHUB_RUN_NUMBER,
            }
            const app = new App(props)

            app.publishApp().catch(error => {
                core.setFailed(error.message)
            })
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
