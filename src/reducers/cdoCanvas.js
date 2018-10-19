const cdoCanvasInitialState = {
    nodes: [
        { id: 's1', name: 'source1', left: 100, top: 100 },
        { id: 's2', name: 'target1', left: 100, top: 300 },
        { id: 'hello', name: 'hello', left: 50, top: 500 }
    ],
    connections: [
        { source: 's1', target: 's2', type: 'basic' },
        { source: 's2', target: 'hello', type: 'basic' }
    ]

}
const cdoCanvas = (state = { nodes: [], connections: [] }, action) => {
    switch (action.type) {
        case 'ADD_CDE_NODE':
            state.nodes = [...state.nodes, action.node]
            return state

        case 'ADD_CDE_TO_CDO_CONNECTION':
            state.connections = [...state.connections, action.connection]
            return state

        case 'CLEAR_CDO_CANVAS':
            return { nodes: [], connections: [] };

        default:
            return state
    }
}

export default cdoCanvas