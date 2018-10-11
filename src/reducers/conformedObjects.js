// Reducer to keep track of conformedObjects within the UI
const conformedObjectsInitialState = {
    currentDataElement: {
        id: '',
        conformedObjectId: 0,
        name: '',
        description: 'default description',
        type: 'Batch',
        layer: 'source-to-raw',
        sources: [],
        targets: []
    },
    conformedObjectList: [
        {
            id: 11,
            name: "Customer",
            description: "Conformed Customer object",
            status: "Approved"
        },
        {
            id: 12,
            name: "Product",
            description: "Conformed Product object",
            status: "Draft"
        }
    ]
}

const conformedObjects = (state = conformedObjectsInitialState, action) => {
    switch (action.type) {
        case 'ADD_CONFORMED_OBJECT':
            action.conformedObject.updateDate = (new Date()).toLocaleString();
            return {
                currentDataElement: action.conformedObject,
                conformedObjectList: [...state.conformedObjectList, action.conformedObject],
            }

        case 'UPDATE_CURRENT_CONFORMED_OBJECT': {
            action.conformedObject.updateDate = (new Date()).toLocaleString();
            var cleaned = state.conformedObjectList.filter(j => j.conformedObjectId != action.conformedObject.conformedObjectId)
            return { ...state, currentDataElement: action.conformedObject, conformedObjectList: cleaned.concat(action.conformedObject) }
        }

        case 'CLEAR_CURRENT_CONFORMED_OBJECT':
            return { ...state, currentDataElement: { name: '' } }

        default:
            return state
    }
}

export default conformedObjects