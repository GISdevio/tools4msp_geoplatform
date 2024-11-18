import React, { useRef, useState } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import SelectField from '../../../../components/SelectField';
import { useLazyGetCodedlabelsQuery, useUploadLayerMutation } from '../../../../services/casestudies';
import { useLazyGetLayersQuery } from '../../../../services/geonode';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormTextField from '../../../../components/FormTextField';

export default function UploadLayer({ id, btnProps, label }) {
    const ref = useRef(null);
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const casestudy = useOutletContext();

    const [searchCoded] = useLazyGetCodedlabelsQuery();
    const [upload, { isLoading }] = useUploadLayerMutation();
    const loadCodes = async (search) => {
        const result = await searchCoded(`?case_study_id=${casestudy.id}&search=${search}`);
        return result.data.data;
    }

    const [searchLayer] = useLazyGetLayersQuery();
    const loadLayers = async (search) => {
        const result = await searchLayer('?search_fields=title&search_fields=abstract&search=' + search);
        return result.data.datasets;
    }

    return (
        <div>
            <Button {...btnProps} onClick={handleShow}>Upload Layer</Button>
            <div ref={ref}></div>
            <Modal show={show} container={ref} animation={false} centered onHide={handleClose}>
                <Modal.Header>Upload Layer</Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{}}
                        onSubmit={async values => {
                            const result = await upload({
                                id: casestudy.id,
                                layer_id: values.layer.pk,
                                resolution: casestudy.resolution,
                                grid: casestudy.grid,
                                attribute: values.attribute ? values.attribute.attribute : null,
                                codedlabel: values.code,
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
                                name="layer"
                                label="Layer"
                                loadOptions={loadLayers}
                                getOptionLabel={v => v.title || v.name}
                                getOptionValue={v => v.pk}
                                groupClassName="mt-4"
                            />
                            <SelectField
                                name="attribute"
                                label="Attribute"
                                groupClassName="mt-4"
                                getOptionLabel={v => v.attribute}
                                getOptionValue={v => v.pk}
                                options={values.layer ? values.layer.attribute_set: []}
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