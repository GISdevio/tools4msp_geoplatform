import React, { useState, useRef, useEffect } from 'react';
import { Button, Spinner, Modal, Form, InputGroup } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import { Formik } from 'formik';
import { useGetLayersQuery } from '../../../../services/geonode';
import { find } from 'lodash';
import FormTextField from '../../../../components/FormTextField';
import { useCreateVariableMutation } from '../../../../services/geodatabuilder';
import { usePagination } from '../../../../libs/usePagination';


const FORM_VALIDATION = values => {
    const errors = {}
    if (!values.name) {
        errors.name = 'Required'
    }
    if (!values.name.startsWith('$')) {
        errors.name = 'Must start with $'
    }
    if (values.name === '$') {
        errors.name = 'Must have at least a character'
    }

    return errors
}


const COLUMNS = ({ setSelected, actions }) => [
    {
        dataField: 'title',
        text: 'Title',
    },
    {
        dataField: 'owner.username',
        text: 'Owner',
    },
    {
        dataField: 'rating',
        text: 'Rating'
    },
    actions && {
        dataField: 'actions',
        isDummyField: true,
        text: 'Actions',
        formatter: (cell, row) => <Button onClick={() => setSelected(row.pk)}>Create variable</Button>,
    }
].filter(_ => _);

export default function Layers({ id, actions = true }) {
    const [selected, setSelected] = useState(null);
    const [page, loadPage] = useState(1);
    const [search, setSearch] = useState('');
    const ref = useRef(null);
    const { data, isLoading, isError, isSuccess, isFetching } = useGetLayersQuery(`?page=${page}&search=${search}&seach_fields=title&search_fields=abstract&search_fields=name`);
    const handleClose = () => setSelected(null);

    const [create, { isLoading: isCreatingVariable, isSuccess: isSuccessCreate, data: result }] = useCreateVariableMutation();

    useEffect(() => {
        if (isSuccessCreate) {
            handleClose();
        }
    }, [isSuccessCreate])

    const selectedLayer = selected && isSuccess ? find(data.datasets, l => l.pk === selected) : null;
    // console.log('selectedLayer')
    // console.log(selectedLayer)
    const pagination = usePagination({
        totPages: data && Math.ceil(data.total / data.page_size),
        page,
        loadPage,
    })
    return (
        <>
            <div className='d-flex align-items-center justify-content-between mt-4'>
                <h3 className='fw-bold'>Layers</h3>
            </div>

            <div className='mb-3'>
                <InputGroup>
                    <InputGroup.Text><i className="fa fa-search"></i></InputGroup.Text>
                    <Form.Control value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '25rem' }} />
                </InputGroup>
            </div>

            {(isLoading || isFetching) && <Spinner animation="border" />}
            {isError && <p className="text-danger">{response.error.message}</p>}
            {(isSuccess && !isFetching) && (<>
                <BootstrapTable
                    keyField="id"
                    data={data.datasets}
                    columns={COLUMNS({ setSelected, actions })}
                    noDataIndication="No layers found"
                    bordered={false}
                />
                {pagination}
            </>)}
            <div ref={ref}></div>
            <Modal show={selectedLayer} container={ref} animation={false} centered onHide={handleClose}>
                <Modal.Header>Create Variable</Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{ name: '$', layer: selected, geodatabuilder: id, attribute: null, where_condition: null }}
                        onSubmit={create}
                        validate={FORM_VALIDATION}
                    >
                        {({ handleSubmit, isValid }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <FormTextField
                                name="name"
                                label="Name"
                            />
                            <FormTextField
                                name="attribute"
                                label="Attribute"
                                controlAs={Form.Select}
                            >
                                <option value={null}>-- None --</option>
                                <option key={selectedLayer.pk} value={selectedLayer.attribution}>{selectedLayer.attribution}</option>)}

                            </FormTextField>
                            <FormTextField
                                name="where_condition"
                                label="Where"
                            />

                            <div className="mt-5">
                                <Button type='submit' size="lg" disabled={isLoading || !isValid }>Save</Button>
                                <Button size="lg" onClick={handleClose} variant="light" className="ms-2">Close</Button>
                            </div>
                        </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </>
    )
}
