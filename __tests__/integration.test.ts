import * as core from '@actions/core'
import { configMsg, run } from '../index'
import { Errors } from '../src/App.types'

describe('Install app', () => {
    const original = process.env
    const inputs: any = {
        versionFormat: 'test',
    }
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
        return inputs[name]
    })
    const envs = {
        appSysID: '123',
        nowPassword: 'test',
        scope: '',
        nowSourceInstance: 'test',
        nowUsername: 'test',
        GITHUB_WORKSPACE: 'test',
    }
    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
        process.env = { ...original, ...envs }
        jest.spyOn(core, 'setFailed')
    })
    it('fails without creds', () => {
        // simulate the secrets are not set
        process.env = {}
        const errors = [
            Errors.USERNAME,
            Errors.PASSWORD,
            Errors.INSTANCE,
            Errors.SYSID_OR_SCOPE,
            Errors.GITHUB_WORKSPACE,
        ].join('. ')

        run()

        expect(core.setFailed).toHaveBeenCalledWith(`${errors}${configMsg}`)
    })

    it('app_sys_id and not app_scope', () => {
        // simulate the secrets are not set
        process.env = {
            nowSourceInstance: 'test',
            appSysID: '123',
            GITHUB_WORKSPACE: 'test',
        }
        const errors = [Errors.USERNAME, Errors.PASSWORD].join('. ')

        run()

        expect(core.setFailed).toHaveBeenCalledWith(`${errors}${configMsg}`)
    })

    it('isAppCustomization, scope and not app_sys_id', () => {
        // simulate the secrets are not set
        process.env.appSysID = ''
        process.env.appScope = 'abc'
        process.env.isAppCustomization = 'true'

        const errors = [Errors.NO_SYS_ID, Errors.REMOVE_SCOPE].join('. ')

        run()

        expect(core.setFailed).toHaveBeenCalledWith(`${errors}${configMsg}`)
    })

    it('isAppCustomization, app_sys_id, app_scope', () => {
        // simulate the secrets are not set
        process.env.appSysID = '123'
        process.env.appScope = 'abc'
        process.env.isAppCustomization = 'true'

        const errors = [Errors.REMOVE_SCOPE].join('. ')

        run()

        expect(core.setFailed).toHaveBeenCalledWith(`${errors}${configMsg}`)
    })

    it('success with creds', async () => {
        // do not set process env
        // workflow run the tests
        // it will take envs from the workflow
        await run()
        expect(core.setFailed).not.toHaveBeenCalled()
    })
})
