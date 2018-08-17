import { combineReducers } from 'redux'
import datasources from './datasources'
import flows from './flows'
import acquireNodes from './acquireNodesReducer'

export default combineReducers({
    datasources,
    flows,
    acquireNodes
})