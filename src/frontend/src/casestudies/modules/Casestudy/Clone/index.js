import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { Formik } from 'formik';
import { useCloneCasestudyMutation } from '../../../../services/casestudies';
import FormTextField from '../../../../components/FormTextField';
import { useNavigate } from 'react-router-dom';

document.getElementById('#modals-portal-wrapper')

export default function CloneCasestudy({ id, btnProps, label }) {
    const [clone, { isLoading, isSuccess, data }] = useCloneCasestudyMutation();
    const ref = useRef(null);
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (isSuccess) {
            navigate(`/casestudies/${data.data.id}/`);
        }
    }, [isSuccess])

    return (
        <div>
            <Button {...btnProps} onClick={handleShow}>Clone</Button>
            <div ref={ref}></div>
            <Modal show={show} container={ref} animation={false} centered onHide={handleClose}>
                <Modal.Header>Clone Casestudy</Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            label,
                        }}
                        onSubmit={(values) => {
                            clone({ ...values, id })
                        }}
                    >
                        {({ handleSubmit }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <FormTextField 
                                name="label"
                                label="Title"
                            />
                            <FormTextField 
                                name="description"
                                label="Description"
                                controlAs="textarea"
                            />
                                
                            <div className="mt-5">
                                <Button type='submit' size="lg" disabled={isLoading}>Clone</Button>
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