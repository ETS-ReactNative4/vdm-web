// This keeps track of what was added into the canvas
const datasources = (state = [], action) => {
  switch (action.type) {
    case 'ADD_DATASOURCE':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ]
    default:
      return state
  }
}
export default datasources