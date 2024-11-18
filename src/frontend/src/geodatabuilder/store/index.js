import { configureStore } from '@reduxjs/toolkit'
import { geonodeApi } from '../../services/geonode'
import { geodatabuildersApi } from '../../services/geodatabuilder'
import { geodatabuilderListSlice } from '../modules/ListGeodatabuilder/slice'

export const store = configureStore({
  reducer: {
    [geodatabuildersApi.reducerPath]: geodatabuildersApi.reducer,
    [geonodeApi.reducerPath]: geonodeApi.reducer,
    [geodatabuilderListSlice.name]: geodatabuilderListSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(geodatabuildersApi.middleware, geonodeApi.middleware),
})
