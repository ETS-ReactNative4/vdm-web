const canvasInitialState = {
    nodes: [
        { id: 's1', name: 'source1', left: 100, top: 100 },
        { id: 's2', name: 'target1', left: 100, top: 300 }
    ],
    connections: [
        { source: 's1', target: 's2', type: 'basic' }
    ]

}
const acquireCanvas = (state = canvasInitialState, action) => {
    switch (action.type) {
        case 'ADD_NODE':
            return {
                nodes: [...state.nodes, action.node],
            }


        case 'ADD_CONNECTION':
            return {
                connections: [...state.connections, action.connection],
            }

        default:
            return state
    }
}

export default acquireCanvas