const { createSlice, createSelector } = require("@reduxjs/toolkit");

export const casestudiesListSlice = createSlice({
    name: 'casestudies_list',
    initialState: {
        module: '',
        type: '',
        page: 1,
        user: null,
        search: '',
    },
    reducers: {
        setModule(state, action) {
            state.module = action.payload;
            state.page = 1;
        },
        setType(state, action) {
            state.type = action.payload;
            state.page = 1;
        },
        setUser(state, action) {
            state.user = action.payload;
            state.page = 1;
        },
        setPage(state, action) {
            state.page = action.payload;
        },
        setSearch(state, action) {
            state.search = action.payload;
        }
    },
})

export const casestudiesListSelectors = {
    params: createSelector(
        state => state[casestudiesListSlice.name],
        ({ module, type, page, user, search }) => `?module=${module}&cstype=${type}&owner=${user ? user.remote_id : ''}&page=${page}&search=${search}`
    ),
    raw: createSelector(
        state => state[casestudiesListSlice.name],
        state => state,
    ),
}

export const casestudiesListActions = casestudiesListSlice.actions;
