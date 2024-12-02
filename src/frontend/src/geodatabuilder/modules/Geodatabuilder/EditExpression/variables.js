import React, { useState } from 'react';
import { useDeleteVariableMutation, useGetVariablesQuery } from '../../../../services/geodatabuilder';
import { Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const COLUMNS = ({ handleDeleteClick, isDeleting, actions, preview = false }) => [
    {
        dataField: 'name',
        text: 'Name',
    },
    {
        dataField: 'layer.name',
        text: 'Layer',
        formatter: (cell, row) => <a href={row.layer.detail_url}>{cell}</a>
    },
    {
        dataField: 'attribute',
        text: 'Attribute'
    },
    {
        dataField: 'where_condition',
        text: 'Where'
    },
    preview && {
        dataField: 'layer.thumbnail_url',
        text: 'Thumbnail',
        formatter: (cell, row) => cell ? <img src={cell} /> : null
    },
    actions && {
        dataField: 'actions',
        isDummyField: true,
        text: 'Actions',
        formatter: (cell, row) => (
            <>
                <CopyToClipboard text={row.name} onCopy={() => toast.success('Copied to clipboard')}>
                    <Button className="me-3 my-2"><i className="fa fa-copy"></i></Button>
                </CopyToClipboard>
                <Button variant="danger" disabled={isDeleting} onClick={() => handleDeleteClick(row.id)}><i className="fa fa-trash-o"></i></Button>
            </>
        ),
    }
].filter(_ => _)

export default function Variables({ id, actions = true }) {
    const { data, isLoading, isError, isSuccess, isFetching } = useGetVariablesQuery(id);
    const [remove, { isLoading: isRemovingVariable }] = useDeleteVariableMutation();
    const [preview, setPreview] = useState(false);

    const handleDeleteClick = async (variableId) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
        })
        if (confirm.isConfirmed) {
            remove({ id: variableId, geodatabuilder: id })
        }
    }

    return (
        <>
            <div className='d-flex align-items-center justify-content-between mt-4'>
                <h3 className='fw-bold'>Variables</h3>
                <Button variant="info" onClick={() => setPreview(!preview)}>{preview ? 'Hide' : 'Show'} Preview</Button>
            </div>

            {(isLoading || isFetching) && <Spinner animation="border" size="sm"/>}
            {isError && <p className="text-danger">{response.error.message}</p>}
            {(isSuccess && !isFetching) && (<>
                <BootstrapTable
                    keyField="id"
                    data={data.geo_data_builder_variables}
                    columns={COLUMNS({ handleDeleteClick, isDeleting: isRemovingVariable, actions, preview })}
                    noDataIndication="No variables found"
                    bordered={false}
                />
            </>)}
        </>
    )
}
