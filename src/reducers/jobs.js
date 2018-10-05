// Reducer to keep track of jobs within the UI
const jobsInitialState = {
    currentJob: {
        jobId: 0, 
        name: '', 
        description: 'default description',
        layer:'source-to-raw',
        sources:[],
        targets:[]
    },
    jobs: []
}

const jobs = (state = jobsInitialState, action) => {
    switch (action.type) {
        case 'ADD_JOB':
            return {
                currentJob: action.job,
                jobs: [...state.jobs, action.job],
            }

        case 'UPDATE_CURRENT_JOB': {
            var cleaned = state.jobs.filter(j => j.jobId != action.job.jobId)
            return { ...state, currentJob:action.job, jobs:cleaned.concat(action.job)}
        }

        case 'CLEAR_CURRENT_JOB':
            return { ...state, currentJob:{} }

        default:
            return state
    }
}

export default jobs