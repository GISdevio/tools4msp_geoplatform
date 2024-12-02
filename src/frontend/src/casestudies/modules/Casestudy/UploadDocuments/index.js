import React, { useRef, useState } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import SelectField from '../../../../components/SelectField';
import { useLazyGetMapsQuery } from '../../../../services/geonode';
import { useUploadCasestudyRunMutation } from '../../../../services/casestudies';
import { toast } from 'react-toastify'

const FORM_VALIDATION = values => {
    const errors = {}
    if (!values.map) {
        errors.map = 'Required'
    }

    return errors
}


export default function UploadDocuments({ id, runId, btnProps }) {
    const ref = useRef(null);
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [upload, { isLoading }] = useUploadCasestudyRunMutation();

    const [searchMaps] = useLazyGetMapsQuery();
    const loadMaps = async (search) => {
        const result = await searchMaps('?search_fields=title&search_fields=abstract&search=' + search);
        return result.data.maps;
    }

    return (
        <div>
            <Button {...btnProps} onClick={handleShow}>Upload Documents to map</Button>
            <div ref={ref}></div>
            <Modal show={show} container={ref} animation={false} centered onHide={handleClose}>
                <Modal.Header>Upload Documents to map</Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{ id, runId }}
                        onSubmit={async values => {
                            await upload({
                                ...values,
                                map_id: values.map.pk,
                            });
                            handleClose();
                            toast.success('Documents uploaded to the map')
                        }}
                        validate={FORM_VALIDATION}
                    >
                        {({ handleSubmit, isValid }) => (
                        <Form onSubmit={handleSubmit}>
                            <SelectField 
                                name="map"
                                label="Map"
                                loadOptions={loadMaps}
                                getOptionLabel={v => `${v.pk} - ${v.title} - ${v.owner.username}`}
                                getOptionValue={v => v.pk}
                                groupClassName="mt-4"
                            />
                            <div className="mt-5">
                                <Button size="lg" type="submit" className="ms-2" disabled={isLoading || !isValid}>Upload{isLoading && <Spinner animation="border" className="ms-1" size="sm"/>}</Button>
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