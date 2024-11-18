import React, { useRef, useState } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import SelectField from '../../../../components/SelectField';
import FormTextField from '../../../../components/FormTextField';
import { useLazyGetCodedlabelsQuery, useUploadGeodatabuilderMutation } from '../../../../services/casestudies';
import { useLazyGetGeodatabuildersQuery } from '../../../../services/geodatabuilder';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UploadGeodatabuilder({ id, btnProps, label }) {
    const ref = useRef(null);
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const casestudy = useOutletContext();

    const [searchCoded] = useLazyGetCodedlabelsQuery();
    const [upload, { isLoading }] = useUploadGeodatabuilderMutation();
    const loadCodes = async (search) => {
        const result = await searchCoded(`?case_study_id=${casestudy.id}&search=${search}`);
        return result.data.data;
    }

    const [searchGeodatabuilder] = useLazyGetGeodatabuildersQuery();
    const loadLayers = async (search) => {
        const result = await searchGeodatabuilder(search ? `?search_fields=label&search_fields=desc_expression&search=${search}&filter{expression.isnull}&filter{-expression}=` : '?filter{expression.isnull}&filter{-expression}=');
        return result.data.geo_data_builders;
    }

    return (
        <div>
            <Button {...btnProps} onClick={handleShow}>Upload GeoDataBuilder</Button>
            <div ref={ref}></div>
            <Modal show={show} container={ref} animation={false} centered onHide={handleClose}>
                <Modal.Header>Upload GeoDataBuilder</Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{}}
                        onSubmit={async values => {
                            const result = await upload({
                                id: casestudy.id,
                                resolution: casestudy.resolution,
                                grid: casestudy.grid,
                                codedlabel: values.code,
                                geodatabuilder_id: values.geodatabuilder.id, 
                                description: values.description,
                            });
                            if (result.data) {
                                if (result.data.data.success) {
                                    handleClose();
                                } else {
                                    toast(result.data.data.detail)
                                }
                            }
                            if (result.error) {
                                toast.error('An error occurred')
                            }
                        }}
                    >
                        {({ handleSubmit, values }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <FormTextField
                                label="Description"
                                name="description"
                            />
                            <SelectField 
                                name="code"
                                label="Code"
                                loadOptions={loadCodes}
                                getOptionLabel={v => v.label}
                                getOptionValue={v => v.code}
                            />
                            <SelectField 
                                name="geodatabuilder"
                                label="GeoDataBuilder"
                                loadOptions={loadLayers}
                                getOptionLabel={v => v.label}
                                getOptionValue={v => v.id}
                                groupClassName="mt-4"
                            />
                            <div className="mt-5">
                                <Button size="lg" type="submit" className="ms-2" disabled={isLoading}>Upload{isLoading && <Spinner className="ms-1" />}</Button>
                                <Button size="lg" onClick={handleClose} variant="light" className="ms-2">Close</Button>
                            </div>
                        </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </div>
    )
}