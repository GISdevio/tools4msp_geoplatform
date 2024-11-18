import { configureStore } from '@reduxjs/toolkit'
import { casestudiesListSlice } from '../modules/ListCasestudies/slice'
import { casestudiesApi } from '../../services/casestudies'
import { geodatabuildersApi } from '../../services/geodatabuilder'
import { geonodeApi } from '../../services/geonode'
import { authApi } from '../../services/auth'

export const store = configureStore({
  reducer: {
    [casestudiesApi.reducerPath]: casestudiesApi.reducer,
    [geodatabuildersApi.reducerPath]: geodatabuildersApi.reducer,
    [geonodeApi.reducerPath]: geonodeApi.reducer,
    [casestudiesListSlice.name]: casestudiesListSlice.reducer,
    [authApi.reducerPath]: authApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(casestudiesApi.middleware, geonodeApi.middleware, geodatabuildersApi.middleware, authApi.middleware),
})
