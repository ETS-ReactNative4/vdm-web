import { combineReducers } from 'redux'
import datasources from './datasources'
import flows from './flows'
import jobs from './jobs'
import dataElements from './dataElements'
import conformedDataElements from './conformedDataElements'
import conformedDataObjects from './conformedDataObjects'
import acquireCanvas from './acquireCanvas'
import governNewCanvas from './governNewCanvas'

export default combineReducers({
    acquireCanvas,
    governNewCanvas,
    jobs,
    dataElements,
    conformedDataElements,
    conformedDataObjects,
    datasources,
    flows
})