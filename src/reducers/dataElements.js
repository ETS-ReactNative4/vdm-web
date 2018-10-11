// Reducer to keep track of dataElements within the UI
const dataElementsInitialState = {
    currentDataElement: {
        id: '',
        dataElementId: 0,
        name: '',
        description: 'default description',
        type: 'Batch',
        layer: 'source-to-raw',
        sources: [],
        targets: []
    },
    dataElementList: [
        {
            id: 1,
            name: "cust_nm",
            description: "Customer Name"
        },
        {
            id: 12,
            name: "product_nm",
            description: "Product Name"
        }
    ]
}

const dataElements = (state = dataElementsInitialState, action) => {
    switch (action.type) {
        case 'ADD_DATA_ELEMENT':
            action.dataElement.updateDate = (new Date()).toLocaleString();
            return {
                currentDataElement: action.dataElement,
                dataElementList: [...state.dataElementList, action.dataElement],
            }

        case 'UPDATE_CURRENT_DATA_ELEMENT': {
            action.dataElement.updateDate = (new Date()).toLocaleString();
            var cleaned = state.dataElementList.filter(j => j.dataElementId != action.dataElement.dataElementId)
            return { ...state, currentDataElement: action.dataElement, dataElementList: cleaned.concat(action.dataElement) }
        }

        case 'CLEAR_CURRENT_DATA_ELEMENT':
            return { ...state, currentDataElement: { name: '' } }

        default:
            return state
    }
}

export default dataElements