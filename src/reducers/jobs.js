// Reducer to keep track of jobs within the UI
const jobsInitialState = {
    currentJob: {jobId: 0, name: 'Please create or open a job', description: 'default description'},
    jobs: []
}

const jobs = (state = jobsInitialState, action) => {
    switch (action.type) {
        case 'ADD_JOB':
            return {
                currentJob: action.job,
                jobs: [...state.jobs, action.job],
            }


        case 'SET_CURRENT_JOB': {
            state.currentJob = action.job;
            return { ...state }
        }

        default:
            return state
    }
}

export default jobs