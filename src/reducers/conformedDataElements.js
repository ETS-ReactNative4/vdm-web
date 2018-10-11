// Reducer to keep track of conformedDataElements within the UI
const conformedDataElementsInitialState = {
    currentDataElement: {
        id: '',
        conformedDataElementId: 0,
        name: '',
        description: 'default description',
        type: 'Batch',
        layer: 'source-to-raw',
        sources: [],
        targets: []
    },
    conformedDataElementList: [
        {
            id: 1,
            name: " CustomerFirstName",
            description: "Customer First Name",
            status: "Approved"
        },
        {
            id: 12,
            name: " CustomerLastName ",
            description: "Customer Last Name",
            status: "Approved"
        }
    ]
}

const conformedDataElements = (state = conformedDataElementsInitialState, action) => {
    switch (action.type) {
        case 'ADD_CONFORMED_DATA_ELEMENT':
            action.conformedDataElement.updateDate = (new Date()).toLocaleString();
            return {
                currentDataElement: action.conformedDataElement,
                conformedDataElementList: [...state.conformedDataElementList, action.conformedDataElement],
            }

        case 'UPDATE_CURRENT_CONFORMED_DATA_ELEMENT': {
            action.conformedDataElement.updateDate = (new Date()).toLocaleString();
            var cleaned = state.conformedDataElementList.filter(j => j.conformedDataElementId != action.conformedDataElement.conformedDataElementId)
            return { ...state, currentDataElement: action.conformedDataElement, conformedDataElementList: cleaned.concat(action.conformedDataElement) }
        }

        case 'CLEAR_CURRENT_CONFORMED_DATA_ELEMENT':
            return { ...state, currentDataElement: { name: '' } }

        default:
            return state
    }
}

export default conformedDataElements