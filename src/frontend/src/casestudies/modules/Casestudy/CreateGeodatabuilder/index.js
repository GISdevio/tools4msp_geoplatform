import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import SelectField from '../../../../components/SelectField';
import FormTextField from '../../../../components/FormTextField';
import { useLazyGetCodedlabelsQuery, useUploadGeodatabuilderMutation } from '../../../../services/casestudies';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function CreateGeodatabuilder({ id, btnProps, label }) {
    const ref = useRef(null);
    const [show, setShow] = useState(false)
    const handleShow = () => setShow(true);
    const [iframeKey, setIframeKey] = useState(1);

    const [geodatabuilder, setGeodatabuilder] = useState(null);

    const handleClose = useCallback(() => {
        setShow(false);
        setGeodatabuilder(null);
        setIframeKey(iframeKey + 1);
    }, [iframeKey]);

    useEffect(() => {
        function manageEvent(event) {
            console.log(event);
            if (event.data.geodatabuilder) {
                setGeodatabuilder(event.data.geodatabuilder);
            }
        }
        window.addEventListener('message', manageEvent, false)
        return () => window.removeEventListener('message', manageEvent)
    })

    const casestudy = useOutletContext();

    const [searchCoded] = useLazyGetCodedlabelsQuery();
    const [upload, { isLoading, error }] = useUploadGeodatabuilderMutation();
    const loadCodes = async (search) => {
        const result = await searchCoded(`?case_study_id=${casestudy.id}&search=${search}`);
        return result.data.data;
    }

    return (
        <div>
            <Button {...btnProps} onClick={handleShow}>Create GeoDataBuilder</Button>
            <div ref={ref}></div>
            <Modal show={show} container={ref} animation={false} centered onHide={handleClose} fullscreen>
                <Modal.Header closeButton>Create GeoDataBuilder</Modal.Header>
                <Modal.Body className="">
                    {error && (
                        <Alert variant="danger" transition={null}>{error.error}</Alert>
                    )}
                    {!geodatabuilder && <iframe key={iframeKey} src="/geodatabuilders/create/?iframe=1" style={{ width: '100%', height: 'calc(100vh - 8rem)' }}></iframe>}
                    {geodatabuilder && (
                        <Formik
                            key={iframeKey}
                            initialValues={{}}
                            onSubmit={async values => {
                                const result = await upload({
                                    id: casestudy.id,
                                    resolution: casestudy.resolution,
                                    grid: casestudy.grid,
                                    codedlabel: values.code,
                                    geodatabuilder_id: geodatabuilder,
                                    description: values.description,
                                });
                                console.log(result)
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
                                <div className="mt-5">
                                    <Button size="lg" type="submit" className="ms-2" disabled={isLoading}>Upload{isLoading && <Spinner className="ms-1" size="sm"/>}</Button>
                                    <Button size="lg" onClick={() => setGeodatabuilder(null)} type="submit" className="ms-2" disabled={isLoading} variant="secondary">Reset</Button>
                                </div>
                            </Form>
                            )}
                        </Formik>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    )
}