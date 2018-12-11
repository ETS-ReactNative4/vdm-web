// Reducer to keep track of jobs within the UI
const jobsInitialState = {
    currentJob: {
        id: '',
        jobId: 0,
        name: '',
        description: 'default description',
        type: 'Batch',
        layer: 'source-to-raw',
        sources: [],
        targets: []
    },
    jobList: []
}

const jobs = (state = jobsInitialState, action) => {
    switch (action.type) {
        case 'INIT_JOB_LIST':
            if(action.jobList == null) action.jobList = []
            return { ...state, jobList: action.jobList }

        case 'ADD_JOB':
            action.job.updateDate = (new Date()).toLocaleString();
            return {
                currentJob: action.job,
                jobList: [...state.jobList, action.job],
            }

        case 'UPDATE_CURRENT_JOB': {
            // Another work around
            if(action.job.id == null){
                action.job.id = action.job.jobId;
            }

            action.job.updateDate = (new Date()).toLocaleString();
            var cleaned = state.jobList.filter(j => j.id !== action.job.id)
            return { ...state, currentJob: action.job, jobList: cleaned.concat(action.job) }
        }

        case 'CLEAR_CURRENT_JOB':
            return { ...state, currentJob: { name: '' } }

        default:
            return state
    }
}

export default jobs