// import * as github from '@actions/github'
import * as core from '@actions/core'
import { AppProps, Errors } from '../../../src/App.types'
import App from '../../../src/App'

export const configMsg = '. Configure Github secrets please'

export const run = (): void => {
    try {
        const errors: string[] = []
        const {
            snowUsername = '',
            snowPassword = '',
            snowSourceInstance = '',
            versionFormat = '',
            appSysID = '',
            appScope = '',
            GITHUB_WORKSPACE = '',
            GITHUB_RUN_NUMBER = '',
        } = process.env

        if (!snowUsername) {
            errors.push(Errors.USERNAME)
        }
        if (!snowPassword) {
            errors.push(Errors.PASSWORD)
        }
        if (!snowSourceInstance) {
            errors.push(Errors.INSTANCE)
        }
        if (!versionFormat) {
            errors.push(Errors.VERSION_FORMAT)
        }
        if (!appSysID) {
            errors.push(Errors.APPSYSID)
        }
        if (!appScope) {
            errors.push(Errors.APPSCOPE)
        }
        if (!GITHUB_WORKSPACE) {
            errors.push(Errors.GITHUB_WORKSPACE)
        }

        if (errors.length) {
            core.setFailed(`${errors.join('. ')}${configMsg}`)
        } else {
            const props: AppProps = {
                versionFormat,
                appSysID,
                snowSourceInstance,
                username: snowUsername,
                password: snowPassword,
                scope: appScope,
                rootFolder: GITHUB_WORKSPACE,
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
