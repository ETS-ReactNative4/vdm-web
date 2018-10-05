// Reducer to keep track of jobs within the UI
const jobsInitialState = {
    currentJob: {
        JobID: 0,
        Name: '',
        Description: 'default description',
        Type: 'Batch',
        Layer: 'source-to-raw',
        Sources: [],
        Targets: []
    },
    JobList: []
}

const jobs = (state = jobsInitialState, action) => {
    switch (action.type) {
        case 'ADD_JOB':
            return {
                currentJob: action.job,
                JobList: [...state.JobList, action.job],
            }

        case 'UPDATE_CURRENT_JOB': {
            var cleaned = state.JobList.filter(j => j.JobID != action.job.JobID)
            return { ...state, currentJob: action.job, JobList: cleaned.concat(action.job) }
        }

        case 'CLEAR_CURRENT_JOB':
            return { ...state, currentJob: { Name: '' } }

        default:
            return state
    }
}

export default jobs