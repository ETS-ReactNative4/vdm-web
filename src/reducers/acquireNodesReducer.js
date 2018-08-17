const initialState = [];
const acquireNodesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_NODE':
            if (state.find(x => x.id === action.node.id) == null) {
                action.node.className = "source-form"
                return [
                    ...state,
                    action.node
                ]
            }else{
                return state;
            }
        case 'UPDATE_NODE_CLASSNAME':
            const node = state.find(x => x.id === action.node.id)
            if (node) {
                const copy = Object.assign({}, node);
                copy.className = action.node.className;
                return (
                    state.map((node, index) => {
                        if (node.id === action.node.id) {
                          return copy
                        }          
                        return node
                      })
                    )
            }else{
                return state;
            }
        default:
            return state
    }
}


export default acquireNodesReducer