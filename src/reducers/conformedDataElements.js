// Reducer to keep track of conformedDataElements within the UI
const conformedDataElementsInitialState = {

    currentConformedDataElement: {
        id: '',
        conformedDataElementId: 0,
        name: '',
        description: 'default description',
        type: 'Batch',
        layer: 'source-to-raw',
        sources: [],
        preferredSource: { id: 0 }
    },
    conformedDataElementList: [
        {
            id: 1,
            name: " CustomerFirstName",
            description: "Customer First Name",
            status: "Approved"
        }
    ]
}

const conformedDataElements = (state = conformedDataElementsInitialState, action) => {
    switch (action.type) {
        case 'INIT_CONFORMED_DATA_ELEMENT_LIST':
            return { ...state, conformedDataElementList: action.conformedDataElementList }


        case 'ADD_CONFORMED_DATA_ELEMENT':
            return {
                currentConformedDataElement: action.conformedDataElement,
                conformedDataElementList: [...state.conformedDataElementList, action.conformedDataElement],
            }

        case 'UPDATE_CURRENT_CONFORMED_DATA_ELEMENT': {
            action.conformedDataElement.updateDate = (new Date()).toLocaleString();
            var cleaned = state.conformedDataElementList.filter(j => j.id !== action.conformedDataElement.id)
            return { ...state, currentConformedDataElement: action.conformedDataElement, conformedDataElementList: cleaned.concat(action.conformedDataElement) }
        }

        case 'CLEAR_CURRENT_CONFORMED_DATA_ELEMENT':
            return { ...state, currentConformedDataElement: { name: '' } }

        case 'SET_PREFERRED_D_E':
            return { ...state, preferred: action.preferred }

        default:
            return state
    }
}

export default conformedDataElements