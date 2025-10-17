import React, { useCallback, useMemo, useState } from "react";
import { Spinner, Tab, Button } from "react-bootstrap";
import { useOutletContext, useParams } from "react-router-dom";
import { LinkItUrl } from "react-linkify-it";
import Matrix from "../../../../components/Matrix";
import {
  useGetCasestudyInputQuery,
  useGetCasestudyInputsQuery,
  useGetCasestudyLayersQuery,
  useGetCodedlabelsQuery,
  useUploadInputMutation,
} from "../../../../services/casestudies";
import ThumbnailUpload from "./thumbnail";
import JsonUpload from "./jsonupload";

export default function CasestudyInput() {
  const { id, inputId } = useParams();
  const query = useMemo(
    () => ({
      id,
      inputId,
    }),
    [id, inputId]
  );
  const { data, isLoading, isFetching, isError, isSuccess } =
    useGetCasestudyInputQuery(query);
  const { data: inputs } = useGetCasestudyInputsQuery(id);
  const { data: layers, isLoading: loadingLayers } =
    useGetCasestudyLayersQuery(id);
  const { data: codedLabels, isLoading: loadingLabels } =
    useGetCodedlabelsQuery("");

  const labels = useMemo(() => {
    if (!codedLabels || !codedLabels.data) {
      return {};
    }
    return codedLabels.data.reduce(
      (p, c) => ({
        ...p,
        [c.code]: c,
      }),
      {}
    );
  }, [codedLabels]);

  const [upload, { isLoading: isUpdating }] = useUploadInputMutation();
  const casestudy = useOutletContext();

  const [currentVisibleColumns, setCurrentVisibleColumns] = useState([]);

  const update = (values) => {
    const matrixData = data?.data?.matrix || {};
    upload({
      id,
      inputId,
      ...matrixData,
      index: values,
    });
  };

  const initialVisibleCodes = useMemo(() => {
    if (
      data &&
      data.data &&
      !isLoading &&
      !loadingLayers &&
      !isFetching &&
      isSuccess
    ) {
      if (data.data.vizmode === 1) {
        const matrixCols = data.data.matrix?.cols || [];
        const matrixRows = data.data.matrix?.rows || [];
        return Array.from(new Set([...matrixCols, ...matrixRows]));
      }

      return layers?.data?.map((l) => l.code) || [];
    }

    return [];
  }, [data, layers, isLoading, loadingLayers, isFetching, isSuccess]);

  const fetchContent = useCallback(
    (label) => {
      if (loadingLabels) {
        return <Spinner size="sm" />;
      }

      if (!labels || !labels[label]) {
        return label; // Return the original label as fallback
      }

      if (!labels[label].label) {
        return label; // Return the original label as fallback
      }

      return labels[label].label;
    },
    [labels, loadingLabels]
  );

  return (
    <div className="mt-4">
      {(isLoading || isFetching || loadingLayers) && (
        <Spinner animation="border" size="sm" />
      )}
      {isError && <p className="text-danger">An error occurred</p>}
      {!isLoading && !loadingLayers && !isFetching && isSuccess && (
        <>
          <h4 className="fw-bold text-xl">{data.data.label}</h4>
          <LinkItUrl>
            <p>{data.data.description}</p>
          </LinkItUrl>

          {data.data.thumbnail && (
            <div>
              {casestudy.is_owner && (
                <ThumbnailUpload {...data.data} id={id} inputId={inputId} />
              )}
              <img src={data.data.thumbnail} className="mw-100" />
            </div>
          )}
          {data.data.matrix && (
            <Matrix
              cols={data.data.matrix.cols || []}
              rows={data.data.matrix.rows || []}
              values={data.data.matrix.values || []}
              index={data.data.matrix.index || {}}
              x={data.data.matrix.x || "x"}
              y={data.data.matrix.y || "y"}
              extra={data.data.matrix.extra || {}}
              separators={
                data.data.matrix.separators || { main: "#", secondary: "$" }
              }
              editable={casestudy.is_owner}
              visibleCodes={initialVisibleCodes}
              key={inputId}
              update={update}
              isUpdating={isUpdating}
              fetchContent={fetchContent}
              onVisibleColumnsChange={setCurrentVisibleColumns}
            />
          )}
          {casestudy.is_owner && (
            <JsonUpload
              id={id}
              inputId={inputId}
              data={inputs?.data || []}
              currentMatrix={data?.data?.matrix}
              visibleColumns={currentVisibleColumns}
            />
          )}
        </>
      )}
    </div>
  );
}
