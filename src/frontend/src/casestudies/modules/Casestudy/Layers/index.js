import React, { useEffect, useState } from "react"
import { Alert, Button, Form, FormControl, Ratio, Spinner } from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Swal from 'sweetalert2'
import Viewer from 'react-viewer';
import getIdFromUrl from "../../../../libs/getIdFromUrl";
import { useDeleteCasestudyLayerMutation, useGetCasestudyLayersQuery, useRunCasestudyMutation } from "../../../../services/casestudies";
import CreateGeodatabuilder from "../CreateGeodatabuilder";
import UploadGeodatabuilder from "../UploadGeodatabuilder";
import UploadLayer from "../UploadLayer";
import { toast } from 'react-toastify';
import EditCasestudyLayer from "./Edit";
import pick from "lodash/pick";
import { LinkItUrl } from 'react-linkify-it';

function labelFormatter(cell, row) {
    return (
        <>
            <p className="fw-bold">{cell.split(' | ')[1]}</p>
            <LinkItUrl><p>{row.description}</p></LinkItUrl>
        </>
    );
}

function groupFormatter(cell, row) {
    return row.label.split(' | ')[0].toUpperCase()
}

function imageFormatter(cell, row, onClick) {
    return (
        <div style={{ maxWidth: '80px' }}>
            <Ratio aspectRatio="1x1">
                <img src={cell} onClick={() => onClick(cell)} />
            </Ratio>
        </div>
    )
}

const rowClasses = row => {
    let group = row.label.split(' | ')[0]
    return `cs-layer-group cs-layer-group-${group}`;
};

const COLUMNS = ({ casestudyId, handleDeleteClick, isDeleting, isOwner, setIndex }) => [
    {
        dataField: 'thumbnail',
        text: 'Thumbnail',
        formatter: (cell, row) => imageFormatter(cell, row, setIndex),
    },
    {
        dataField: 'group',
        isDummyField: true,
        text: 'Group',
        formatter: groupFormatter,
    },
    {
        dataField: 'code',
        text: 'Code'
    },
    {
        dataField: 'label',
        text: 'Label',
        formatter: labelFormatter,
    },
    {
        dataField: 'actions',
        isDummyField: true,
        text: 'Actions',
        formatter: (cell, row) => (<div className="d-flex">
            <Button size="lg" className="me-2" href={row.file} download target="_blank" ><i className="fa fa-download"></i></Button>
            <Button size="lg" className="me-2" href={row.thumbnail} download target="_blank" ><i className="fa fa-image"></i></Button>
            {isOwner && <EditCasestudyLayer btnProps={{ className: 'me-2', size: 'lg' }} initialValues={{ ...(pick(row, ['id', 'description',])), casestudyId }} />}
            {<Button variant="danger" size="lg" disabled={isDeleting || row.code === 'GRID'} onClick={() => handleDeleteClick(getIdFromUrl(row.url))}><i className="fa fa-trash-o"></i></Button>} 
            {/* // remember to reset isOwner && */}
        </div>),
    },
].filter(_ => _)


export default function CasestudyLayers() {
    const [selected, setSelected] = useState([]);
    const [useCustom, setUseCustom] = useState(false);
    const { id } = useParams()
    const [index, setIndex] = useState(null);

    const casestudy = useOutletContext();

    const { data, isLoading, isError, isSuccess, isFetching } = useGetCasestudyLayersQuery(id);
    const [run, { data: response, isLoading: isRunning, error: runningError }] = useRunCasestudyMutation();
    const [removeLayer, { data: deleteResponse, isLoading: isDeleting, error: deletingError }] = useDeleteCasestudyLayerMutation();
    const navigate = useNavigate();

    const onSelect = (row, isSelect) => {
        if (isSelect) {
            setSelected([...selected, row.code])
        } else {
            setSelected(selected.filter(s => s !== row.code))
        }
    }

    const onSelectAll = (isSelect, rows) => {
        if (isSelect) {
            setSelected(rows.map(r => r.code))
        } else {
            setSelected([])
        }
    }

    const handleClick = async () => {
        try {
            let domain_area = null;
            if (useCustom && casestudy.customSubArea && casestudy.customSubArea.features.length > 0 && casestudy.customSubArea.features[0].geometry) {
                domain_area = casestudy.customSubArea.features[0].geometry;
            }
            const result = await run({ id, selected_layers: selected.join(','), domain_area });
            if (result.data) {
                navigate(`/casestudies/${id}/runs/${result.data.data.run_id}/`)
            }
            if (result.error) {
                toast.error((
                    <>
                    <p>{result.error.data.error.message}</p>
                    {result.error.data.error.details.non_field_errors && (
                        <ul>
                            {result.error.data.error.details.non_field_errors.map(e => <li key={e}>{e}</li>)}
                        </ul>
                    )}
                    </>
                ))
            }
        } catch(e) {
            console.error(e);
        }
    }

    const handleDeleteClick = async (layerId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
        })
        if (result.isConfirmed) {
            removeLayer({ id, layerId })
        }
    }

    const layers = isSuccess ? data.data : []

    return (
        <div className="mt-4">
            {casestudy.is_owner && (
                <div className="d-flex py-2">
                    <UploadLayer btnProps={{ className: 'mx-2', size: 'lg' }} />
                    <UploadGeodatabuilder btnProps={{ className: 'mx-2', size: 'lg' }} />
                    <CreateGeodatabuilder btnProps={{ className: 'mx-2', size: 'lg' }} />
                </div>
            )}
            {runningError && (
                <Alert variant="danger" transition={false}>
                    {runningError.data.error.message}
                </Alert>
            )}
            {deletingError && (
                <Alert variant="danger" transition={false}>
                    {deletingError.data.error.message}
                </Alert>
            )}
            <div className="mt-2">
                {(isLoading || isFetching) && <Spinner animation="border" />}
                {isError && <p className="text-danger">{response.error.message}</p>}
                {(isSuccess && !isFetching) && (<>
                    <Viewer
                        visible={index !== null}
                        onClose={() => setIndex(null)}
                        images={data.data.filter(e => e.thumbnail === index).map(e => ({ src: e.thumbnail }))}
                        attribute
                        drag={false}
                        noToolbar
                        noFooter
                        noClose
                        zoomable={false}
                        disableMouseZoom
                        zIndex={99999999999999}
                        onMaskClick={() => setIndex(null)}
                    />
                    <BootstrapTable
                        keyField="code"
                        data={data.data}
                        columns={COLUMNS({ handleDeleteClick, isDeleting, isOwner: casestudy.is_owner, setIndex, casestudyId: casestudy.id })}
                        noDataIndication="No layers found"
                        bordered={false}
                        rowClasses={rowClasses}
                        selectRow={{
                            mode: 'checkbox',
                            selected,
                            onSelect,
                            onSelectAll,
                        }}
                    />
                    <div className="d-flex justify-content-center align-items-center flex-column">
                        <Button 
                            disabled={!selected.length || isRunning}
                            size="lg"
                            onClick={handleClick}
                        >
                            {isRunning && <Spinner animation="border" className="me-2" />}Run Casestudy ({selected.length}/{layers.length})
                        </Button>
                        {(!isRunning && casestudy.customSubArea) && <div className="d-flex mt-2"><Form.Check checked={useCustom} onChange={() => setUseCustom(!useCustom)} type="checkbox" label="Use Custom Sub Area" /></div>}
                    </div>
                    {isRunning && <Alert variant="warning" className="mt-2" animation={false} transition={false}>Processing may take a few minutes</Alert>}
                </>)}
            </div>
        </div>
    )
}