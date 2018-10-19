// Reducer to keep track of conformedDataObjects within the UI
const conformedDataObjectsInitialState = {
    currentConformedDataObject: {
        id: '',
        conformedDataObjectId: 0,
        name: '',
        description: 'default description',
        type: 'Batch',
        layer: 'source-to-raw',
        sources: [],
        targets: []
    },
    conformedDataObjectList: [
        {
            id: 11,
            name: "Customer",
            description: "Conformed Customer object",
            status: "Approved"
        }
    ]
}

const conformedDataObjects = (state = conformedDataObjectsInitialState, action) => {
    switch (action.type) {
        case 'INIT_CONFORMED_DATA_OBJECT_LIST':
        return { ...state, conformedDataObjectList: action.conformedDataObjectList }

        case 'ADD_CONFORMED_DATA_OBJECT':
            action.conformedDataObject.updateDate = (new Date()).toLocaleString();
            return {
                currentDataElement: action.conformedDataObject,
                conformedDataObjectList: [...state.conformedDataObjectList, action.conformedDataObject],
            }

        case 'UPDATE_CURRENT_CONFORMED_DATA_OBJECT': {
            action.conformedDataObject.updateDate = (new Date()).toLocaleString();
            var cleaned = state.conformedDataObjectList.filter(j => j.conformedDataObjectId != action.conformedDataObject.conformedDataObjectId)
            return { ...state, currentDataElement: action.conformedDataObject, conformedDataObjectList: cleaned.concat(action.conformedDataObject) }
        }

        case 'CLEAR_CURRENT_CONFORMED_DATA_OBJECT':
            return { ...state, currentDataElement: { name: '' } }

        default:
            return state
    }
}

export default conformedDataObjects