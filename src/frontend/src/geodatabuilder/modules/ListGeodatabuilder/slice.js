const { createSlice, createSelector } = require("@reduxjs/toolkit");

export const geodatabuilderListSlice = createSlice({
    name: 'geodatabuilder_list',
    initialState: {
        page: 1,
        search: '',
    },
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        setSearch(state, action) {
            state.page = 1;
            state.search = action.payload;
        }
    },
})

export const geodatabuilderListSelectors = {
    params: createSelector(
        state => state[geodatabuilderListSlice.name],
        ({ page, search }) => `?page=${page}&search=${search}`
    ),
    serverParams: createSelector(
        state => state[geodatabuilderListSlice.name],
        ({ page, search }) => `?page=${page}&search=${search}&search_fields=label&search_fields=desc_expression`
    ),
    raw: createSelector(
        state => state[geodatabuilderListSlice.name],
        state => state,
    ),
}

export const geodatabuilderListActions = geodatabuilderListSlice.actions;
