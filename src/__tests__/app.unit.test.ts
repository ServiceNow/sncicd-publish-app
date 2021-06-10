import * as core from '@actions/core'
import axios from 'axios'
import { AppProps, AppVersionResponse, axiosConfig, Errors, requestOptions, RequestResponse } from '../App.types'
import App from '../App'

let props: AppProps
const inputs: any = {
    version: '1.1.1',
    versionTemplate: '1.1',
    incrementBy: '1',
    devNotes: 'dev notes bla bla',
}

describe(`App lib`, () => {
    beforeAll(() => {
        jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
            return inputs[name]
        })
        jest.mock('axios')

        // Mock error/warning/info/debug
        jest.spyOn(core, 'error').mockImplementation(jest.fn())
        jest.spyOn(core, 'warning').mockImplementation(jest.fn())
        jest.spyOn(core, 'info').mockImplementation(jest.fn())
        jest.spyOn(core, 'debug').mockImplementation(jest.fn())
    })

    beforeEach(() => {
        props = {
            appSysID: '123',
            githubRunNum: '2',
            password: 'test',
            workspace: __dirname,
            scope: '',
            nowSourceInstance: 'test',
            username: 'test',
            versionFormat: 'exact',
        }
    })
    it(`builds params`, () => {
        const app = new App(props)
        const options: requestOptions = {
            sys_id: '123456789',
            version: '1.1.1',
            dev_notes: 'some notes',
        }

        expect(app.buildParams(options)).toEqual(
            `sys_id=${options.sys_id}&version=${options.version}&dev_notes=${encodeURIComponent(
                options.dev_notes || '',
            )}`,
        )
    })
    it(`builds request url`, () => {
        const app = new App(props)
        let options: requestOptions = {
            sys_id: '123456789',
            version: '1.1.1',
            dev_notes: 'some notes',
        }
        expect(app.buildRequestUrl(options)).toEqual(
            `https://${props.nowSourceInstance}.service-now.com/api/sn_cicd/app_repo/publish?sys_id=${
                options.sys_id
            }&version=${options.version}&dev_notes=${encodeURIComponent(String(options.dev_notes))}`,
        )
        options.sys_id = undefined

        expect(() => app.buildRequestUrl(options)).toThrow(Errors.INCORRECT_CONFIG)

        options = { scope: 'scope', ...options }

        expect(app.buildRequestUrl(options)).toEqual(
            `https://${props.nowSourceInstance}.service-now.com/api/sn_cicd/app_repo/publish?scope=${
                options.scope
            }&version=${options.version}&dev_notes=${encodeURIComponent(String(options.dev_notes))}`,
        )
    })
    // it(`sleep throttling`, async done => {
    //     props.appSysID = '123'
    //     const app = new App(props)
    //     const time = 2500
    //     setTimeout(() => done(new Error("it didn't resolve or took longer than expected")), time)
    //     await app.sleep(time - 500)
    //     done()
    // })
    it(`converts string version to array of numbers`, () => {
        const app = new App(props)

        expect(app.convertVersionToArr('1.1.1')).toEqual([1, 1, 1])
    })
    describe(`increase version`, () => {
        const setOutputMock = jest.spyOn(core, 'setOutput')
        const get = jest.spyOn(axios, 'get')
        const log = jest.spyOn(global.console, 'log')
        const response: AppVersionResponse = {
            config: {},
            headers: undefined,
            status: 200,
            statusText: '',
            data: {
                result: {
                    version: '1.1.1',
                },
            },
        }
        it(`exact`, async () => {
            get.mockResolvedValue(response)
            const app = new App(props)
            const version = await app.increaseVersion()
            expect(version).toEqual(inputs.version)
            expect(setOutputMock).toHaveBeenCalledWith('rollbackVersion', response.data.result.version)
            expect(setOutputMock).toHaveBeenCalledWith('newVersion', version)
        })
        it(`template`, async () => {
            get.mockResolvedValue(response)
            props.versionFormat = 'template'
            const app = new App(props)
            const version = await app.increaseVersion()
            expect(version).toEqual([inputs.versionTemplate, props.githubRunNum].join('.'))
            expect(setOutputMock).toHaveBeenCalledWith('rollbackVersion', response.data.result.version)
            expect(setOutputMock).toHaveBeenCalledWith('newVersion', version)
        })

        it(`detect`, async () => {
            get.mockResolvedValue(response)
            props.appSysID = 'SYS_ID'
            props.scope = 'scope'
            props.versionFormat = 'detect'
            const app = new App(props)
            const version = await app.increaseVersion()
            expect(version).toEqual('1.1.3')
            expect(log).toHaveBeenCalledWith(`Looking in ${[props.workspace, props.appSysID].join('/')}`)
            expect(setOutputMock).toHaveBeenCalledWith('rollbackVersion', '1.1.2') // version from the file sys_app_SYS_ID.xml
            expect(setOutputMock).toHaveBeenCalledWith('newVersion', version)
        })
    })
    it(`publishApp`, async () => {
        const get = jest.spyOn(axios, 'get')
        const getResponse: AppVersionResponse = {
            config: {},
            headers: undefined,
            status: 200,
            statusText: '',
            data: {
                result: {
                    version: '1.1.1',
                },
            },
        }
        get.mockResolvedValue(getResponse)
        const post = jest.spyOn(axios, 'post')
        const response: RequestResponse = {
            data: {
                result: {
                    links: {
                        progress: {
                            id: 'test',
                            url: 'test',
                        },
                    },
                    status: '0',
                    status_label: '',
                    status_message: '',
                    status_detail: '',
                    error: '',
                    percent_complete: 0,
                },
            },
        }
        post.mockResolvedValue(response)
        const app = new App(props)
        await app.publishApp()
        const config: axiosConfig = {
            auth: {
                username: props.username,
                password: props.password,
            },
            headers: {
                'User-Agent': 'sncicd_extint_github',
                Accept: 'application/json',
            },
        }
        const url = `https://${props.nowSourceInstance}.service-now.com/api/sn_cicd/app_repo/publish?sys_id=${
            props.appSysID
        }&version=${inputs.version}&dev_notes=${encodeURIComponent(String(inputs.devNotes))}`
        expect(post).toHaveBeenCalledWith(url, {}, config)
    })
})
