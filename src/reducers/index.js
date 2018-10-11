import { combineReducers } from 'redux'
import datasources from './datasources'
import flows from './flows'
import jobs from './jobs'
import dataElements from './dataElements'
import conformedDataElements from './conformedDataElements'
import conformedObjects from './conformedObjects'
import acquireCanvas from './acquireCanvas'

export default combineReducers({
    acquireCanvas,
    jobs,
    dataElements,
    conformedDataElements,
    conformedObjects,
    datasources,
    flows
})