import { combineReducers } from 'redux'
import datasources from './datasources'
import flows from './flows'
import acquireNodes from './acquireNodes'
import jobs from './jobs'
import acquireCanvas from './acquireCanvas'

export default combineReducers({
    acquireCanvas,
    jobs,
    datasources,
    flows
})