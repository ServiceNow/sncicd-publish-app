import { AppProps, requestOptions } from '../App.types'
import App from '../App'

let props: AppProps

describe(`App lib`, () => {
    beforeEach(() => {
        props = {
            appSysID: '',
            githubRunNum: '',
            password: '',
            rootFolder: '',
            scope: '',
            snowSourceInstance: '',
            username: '',
            versionFormat: '',
        }
    })
    it(`builds params`, () => {
        const app = new App(props)
        const options: requestOptions = {
            dev_notes: 'some notes',
            sys_id: '123456789',
            version: '1.1.1',
        }

        expect(app.buildParams(options)).toEqual(
            `sys_id=${options.sys_id}&version=${options.version}&dev_notes=${encodeURIComponent(
                options.dev_notes || '',
            )}`,
        )
    })
    it(`builds request url`, () => {})
    it(`sleep throttling`, () => {})
    it(`prints status`, () => {})
    it(`checks version`, () => {})
    it(`checks version`, () => {})
    it(`converts string version to array of numbers`, () => {})
    it(`gets current application version from the Table Api`, () => {})
    it(`gets current application version from the repository file`, () => {})
})
// @ts-ignore-disable
