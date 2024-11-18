import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCSRF } from './csrf';

export const casestudiesApi = createApi({
    reducerPath: 'casestudiesApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/v2/' }),
    tagTypes: ['Casestudies', 'Inputs', 'Runs', 'Layers', 'Codedlabels'],
    endpoints: (builder) => ({
        getCasestudies: builder.query({
            query: (params) => `casestudies/${params}`,
            providesTags: (result) => [{ type: 'Casestudies', id: 'LIST' }],
        }),
        getCasestudy: builder.query({
            query: (id) => `casestudies/${id}/`,
            providesTags: (result, error) => result && !error ? [{ type: 'Casestudies', id: result.data.id }] : [],
        }),
        createCasestudy: builder.mutation({
            query: (body) => ({
                url: `casestudies/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: [{ type: 'Casestudies', id: 'LIST' }]
        }),
        cloneCasestudy: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/clone/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: [{ type: 'Casestudies', id: 'LIST' }]
        }),
        runCasestudy: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/run/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [
                { type: 'Casestudies', id: request.id },
                { type: 'Runs', id: `CS-${request.id}-LIST` },
            ],
        }),
        editCasestudy: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/`,
                method: 'PUT',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Casestudies', id: request.id }],
        }),
        deleteCasestudy: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/`,
                method: 'DELETE',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Casestudies', id: request.id }, { type: 'Casestudies', id: 'LIST' }]
        }),
        getCasestudyInputs: builder.query({
            query: (id) => `casestudies/${id}/inputs/`,
            providesTags: (result, error, request) => [{ type: 'Inputs', id: `CS-${request}-LIST` }],
        }),
        getCasestudyInput: builder.query({
            query: ({ id, inputId }) => `casestudies/${id}/inputs/${inputId}/`,
            providesTags: (result, error, request) => [{ type: 'Inputs', id: `CS-${request.id}-${request.inputId}` }],
        }),
        getCasestudyRuns: builder.query({
            query: ({ id, query }) => `casestudies/${id}/runs/${query}`,
            providesTags: (result, error, request) => [{ type: 'Runs', id: `CS-${request.id}-LIST` }],
        }),
        getCasestudyRun: builder.query({
            query: ({id, runId }) => `casestudies/${id}/runs/${runId}/`,
            providesTags: (result) => [{ type: 'Runs', id: result.data.id }],
        }),
        editCasestudyRun: builder.mutation({
            query: ({id, runId, ...body }) => ({
                url: `casestudies/${id}/runs/${runId}/`,
                method: 'PATCH',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                },
            }),
            invalidatesTags: (response, err, request) => [{ type: 'Runs', id: request.runId }],
        }),
        deleteCasestudyRun: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/runs/${body.runId}/`,
                method: 'DELETE',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Runs', id: `CS-${request.id}-LIST` }]
        }),
        uploadCasestudyRun: builder.mutation({
            query: ({id, runId, ...body }) => ({
                url: `casestudies/${id}/runs/${runId}/upload_to_geonode/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Layers', id: request.id }],
        }),
        uploadInput: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/inputs/${body.inputId}/upload/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Inputs', id: `CS-${request.id}-${request.inputId}` }],
        }),
        uploadInputThumbnail: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/inputs/${body.inputId}/thumbnailupload/`,
                method: 'POST',
                body: body.formData,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Inputs', id: `CS-${request.id}-${request.inputId}` }],
        }),
        getCasestudyLayers: builder.query({
            query: (id) => `casestudies/${id}/layers/`,
            providesTags: (result, error, request) => [{ type: 'Layers', id: request }],
        }),
        editCasestudyLayer: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.casestudyId}/layers/${body.id}/`,
                method: 'PUT',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Layers', id: request.casestudyId }],
        }),
        uploadLayer: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/layers/upload/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Layers', id: request.id }],
        }),
        uploadGeodatabuilder: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/layers/upload_geodatabuilder/`,
                method: 'POST',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Layers', id: request.id }],
        }),
        deleteCasestudyLayer: builder.mutation({
            query: (body) => ({
                url: `casestudies/${body.id}/layers/${body.layerId}/`,
                method: 'DELETE',
                body,
                headers: {
                    'X-CSRFToken': getCSRF(),
                }
            }),
            invalidatesTags: (response, error, request) => [{ type: 'Layers', id: request.id }]
        }),
        getCodedlabels: builder.query({
            query: (params) => `codedlabels/${params}`,
            providesTags: () => [{ type: 'Codedlabels', id: 'LIST' }],
        }),
        getContexts: builder.query({
            query: (params) => `contexts/${params}`,
            providesTags: () => [{ type: 'Contexts', id: 'LIST' }],
        }),
        getDomainArea: builder.query({
            query: (params) => `domainareas/${params}`,
            providesTags: () => [{ type: 'DomainAreas', id: 'LIST' }],
        }),
        getToolsOptions: builder.query({
            query: ({ group, search}) => `tools4msp-options/?filter{group}=${group}${search ? '&filter{label.icontains}=' + search : '' }`,
            providesTags: (response, error, request) => [{ type: `Options${request.group}`, id: 'LIST' }],
        }),
    }),
})

export const { 
    useGetCasestudiesQuery, 
    useGetCasestudyQuery, 
    useCloneCasestudyMutation, 
    useDeleteCasestudyMutation,
    useEditCasestudyMutation,
    useGetCasestudyInputsQuery,
    useGetCasestudyRunsQuery,
    useRunCasestudyMutation,
    useGetCasestudyRunQuery,
    useGetCasestudyInputQuery,
    useUploadInputMutation,
    useGetCasestudyLayersQuery,
    useDeleteCasestudyLayerMutation,
    useGetCodedlabelsQuery,
    useLazyGetCodedlabelsQuery,
    useGetContextsQuery,
    useGetDomainAreaQuery,
    useUploadLayerMutation,
    useUploadGeodatabuilderMutation,
    useUploadCasestudyRunMutation,
    useLazyGetToolsOptionsQuery,
    useGetToolsOptionsQuery,
    useCreateCasestudyMutation,
    useLazyGetDomainAreaQuery,
    useLazyGetContextsQuery,
    useEditCasestudyRunMutation,
    useEditCasestudyLayerMutation,
    useUploadInputThumbnailMutation,
    useDeleteCasestudyRunMutation,
} = casestudiesApi;
