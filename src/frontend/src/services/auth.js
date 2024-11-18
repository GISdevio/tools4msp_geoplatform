import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/o/' }),
    endpoints: (builder) => ({
        getInfo: builder.query({
            query: () => `v4/userinfo`,
            providesTags: () => [{ type: 'userinfo' }],
        }),
    }),
})

export const { 
    useGetInfoQuery,
} = authApi;
