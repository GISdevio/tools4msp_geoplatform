import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { Formik } from 'formik';
import { useDeleteCasestudyMutation } from '../../../../services/casestudies';
import { useNavigate } from 'react-router-dom';

export default function DeleteCasestudy({ id, btnProps, label }) {
    const [remove, { isLoading, isSuccess, data }] = useDeleteCasestudyMutation();
    const ref = useRef(null);
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (isSuccess) {
            navigate(`/casestudies/`);
        }
    }, [isSuccess])

    return (
        <div>
            <Button {...btnProps} onClick={handleShow}>Delete</Button>
            <div ref={ref}></div>
            <Modal show={show} container={ref} animation={false} centered onHide={handleClose}>
                <Modal.Header>Delete Casestudy</Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete <strong>{label}</strong>?
                    <Formik
                        initialValues={{
                            label,
                        }}
                        onSubmit={() => {
                            remove({ id })
                        }}
                    >
                        {({ handleSubmit }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <div className="mt-5">
                                <Button type='submit' size="lg" variant="danger" disabled={isLoading}>Confirm</Button>
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