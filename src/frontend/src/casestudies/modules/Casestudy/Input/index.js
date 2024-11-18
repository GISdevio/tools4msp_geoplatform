import React, { useCallback, useMemo, useRef } from "react"
import { Spinner, Tab, Button } from "react-bootstrap";
import { useOutletContext, useParams } from "react-router-dom";
import { LinkItUrl } from 'react-linkify-it';
import Matrix from "../../../../components/Matrix";
import { useGetCasestudyInputQuery, useGetCasestudyLayersQuery, useGetCodedlabelsQuery, useUploadInputMutation } from "../../../../services/casestudies";
import ThumbnailUpload from "./thumbnail";


export default function CasestudyInput() {
    const { id, inputId } = useParams()
    const query = useMemo(() => ({
        id,
        inputId
    }), [id, inputId]);
    const { data, isLoading, isFetching, isError, isSuccess } = useGetCasestudyInputQuery(query);
    const { data: layers, isLoading: loadingLayers } = useGetCasestudyLayersQuery(id);
    const { data: codedLabels, isLoading: loadingLabels } = useGetCodedlabelsQuery('');

    const labels = useMemo(() => {
        if (!codedLabels || !codedLabels.data) {
            return {}
        }
        return codedLabels.data.reduce((p,c) => ({
            ...p,
            [c.code]: c,
        }), {});
    }, [codedLabels]);


    const [upload, { isLoading: isUpdating }] = useUploadInputMutation();
    const casestudy = useOutletContext();

    const update = (values) => {
        upload({
            id,
            inputId,
            ...data.data.matrix,
            index: values,
        })
    }

    const initialVisibleCodes = useMemo(() => {
        if (data && data.data && !isLoading && !loadingLayers && !isFetching && isSuccess) {
            if (data.data.vizmode === 1) {
                return Array.from(new Set([...data.data.matrix.cols, ...data.data.matrix.rows]))
            }

            return layers.data.map(l => l.code);
        }

        return [];
    }, [data, layers, isLoading, loadingLayers, isFetching, isSuccess]);

    const fetchContent = useCallback((label) => {
        if (loadingLabels) {
            return <Spinner />
        }

        return labels[label].label;
    }, [labels, loadingLabels])

    return (
        <div className="mt-4">
            {(isLoading || isFetching || loadingLayers) && <Spinner animation="border" />}
            {isError && <p className="text-danger">An error occurred</p>}
            {(!isLoading && !loadingLayers && !isFetching && isSuccess) && (
                <>
                    <h4 className="fw-bold text-xl">{data.data.label}</h4>
                    <LinkItUrl><p>{data.data.description}</p></LinkItUrl>
                    {data.data.thumbnail && (
                        <div>
                            {casestudy.is_owner && <ThumbnailUpload {...data.data} id={id} inputId={inputId} />}
                            <img src={data.data.thumbnail} className="mw-100" />
                        </div>    
                    )}
                    {data.data.matrix && (
                        <Matrix 
                            {...data.data.matrix} 
                            editable={casestudy.is_owner} 
                            visibleCodes={initialVisibleCodes} 
                            key={inputId} 
                            update={update} 
                            isUpdating={isUpdating} 
                            fetchContent={fetchContent}
                        />
                    )}
                </>
            )}
        </div>
    )
}