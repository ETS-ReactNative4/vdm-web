import { combineReducers } from 'redux'
import datasources from './datasources'
import flows from './flows'
import jobs from './jobs'
import dataElements from './dataElements'
import conformedDataElements from './conformedDataElements'
import conformedDataObjects from './conformedDataObjects'
import acquireCanvas from './acquireCanvas'
import governNewCanvas from './governNewCanvas'
import cdoCanvas from './cdoCanvas'

export default combineReducers({
    acquireCanvas,
    governNewCanvas,
    cdoCanvas,
    jobs,
    dataElements,
    conformedDataElements,
    conformedDataObjects,
    datasources,
    flows
})