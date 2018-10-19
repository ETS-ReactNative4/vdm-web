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
                currentConformedDataObject: action.conformedDataObject,
                conformedDataObjectList: [...state.conformedDataObjectList, action.conformedDataObject],
            }

        case 'UPDATE_CURRENT_CDO': {
            action.cdo.updateDate = (new Date()).toLocaleString();
            var cleaned = state.conformedDataObjectList.filter(j => j.id != action.cdo.id)
            return { ...state, currentConformedDataObject: action.cdo, conformedDataObjectList: cleaned.concat(action.cdo) }
        }

        case 'CLEAR_CURRENT_CONFORMED_DATA_OBJECT':
            return { ...state, currentConformedDataObject: { name: '' } }

        default:
            return state
    }
}

export default conformedDataObjects