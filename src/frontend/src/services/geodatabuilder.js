import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCSRF } from './csrf';

export const geodatabuildersApi = createApi({
    reducerPath: 'geodatabuildersApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/v2/' }),
    tagTypes: ['geodatabuilders', 'variables'],
    endpoints: (builder) => ({
        getGeodatabuilders: builder.query({
            query: (params = '') => `geodatabuilders/${params}${ params ? '&' : '?'}exclude[]=variables`,
            providesTags: (result) => [{ type: 'geodatabuilders', id: 'LIST' }],
        }),
        getGeodatabuilder: builder.query({
            query: (id) => `geodatabuilders/${id}/`,
            providesTags: (result, error, request) => [{ type: 'geodatabuilders', id: request }],
        }),
        createGeodatabuilder: builder.mutation({
            query: (body) => ({
                url: `geodatabuilders/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: [{ type: 'geodatabuilders', id: 'LIST' }]
        }),
        cloneGeodatabuilder: builder.mutation({
            query: (body) => ({
                url: `geodatabuilders/${body.id}/clone/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: [{ type: 'geodatabuilders', id: 'LIST' }]
        }),
        editGeodatabuilder: builder.mutation({
            query: (body) => ({
                url: `geodatabuilders/${body.id}/`,
                method: 'PUT',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'geodatabuilders', id: request.id }],
        }),
        deleteGeodatabuilder: builder.mutation({
            query: (body) => ({
                url: `geodatabuilders/${body.id}/`,
                method: 'DELETE',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'geodatabuilders', id: request.id }, { type: 'geodatabuilders', id: 'LIST' }]
        }),
        getVariables: builder.query({
            query: (params = '') => `geodatabuilders/${params}/variables/`,
            providesTags: (result, error, request) => [{ type: 'variables', id: `LIST-${request}` }],
        }),
        createVariable: builder.mutation({
            query: (body) => ({
                url: `geodatabuilder-variables/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (resp, error, req) => [{ type: 'variables', id: `LIST-${req.geodatabuilder}` }]
        }),
        deleteVariable: builder.mutation({
            query: (body) => ({
                url: `geodatabuilder-variables/${body.id}/`,
                method: 'DELETE',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (resp, error, req) => [{ type: 'variables', id: `LIST-${req.geodatabuilder}` }]
        }),
        validateExpression: builder.mutation({
            query: (expression) => ({
                url: `geodatabuilders/validate_expression/`,
                method: 'POST',
                body: { expression },
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
        }),
    }),
})

export const { 
    useGetGeodatabuildersQuery, 
    useLazyGetGeodatabuildersQuery, 
    useGetGeodatabuilderQuery, 
    useCloneGeodatabuilderMutation, 
    useDeleteGeodatabuilderMutation,
    useEditGeodatabuilderMutation,
    useCreateGeodatabuilderMutation,
    useGetVariablesQuery,
    useCreateVariableMutation,
    useDeleteVariableMutation,
    useValidateExpressionMutation,
} = geodatabuildersApi;
