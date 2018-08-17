const flows = (state = [], action) => {
    switch (action.type) {
        case 'ADD_FLOW':
            return [
                ...state,
                {
                    id: action.id,
                    source: action.source,
                    target: action.target
                }
            ]
        default:
            return state
    }
}

export default flows