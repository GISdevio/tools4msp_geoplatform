import React, { useEffect, useRef, useState } from 'react';
import pick from 'lodash/pick';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import { useEditCasestudyLayerMutation } from '../../../../../services/casestudies';
import FormTextField from '../../../../../components/FormTextField';

const FORM_VALIDATION = values => {
    const errors = {}
    if (!values.description) {
        errors.description = 'Required'
    }
    return errors
}


export default function EditCasestudyLayer({ id, casestudyId, btnProps, initialValues }) {
    const [edit, { isLoading, isSuccess, reset, data }] = useEditCasestudyLayerMutation();
    const ref = useRef(null);
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        if (isSuccess && !data.error) {
            reset()
            handleClose();
        }
    }, [isSuccess])

    console.log(initialValues)

    return (
        <div className='d-inline'>
            <Button {...btnProps} size="lg" onClick={handleShow}><i className='fa fa-pencil' /></Button>
            <div ref={ref}></div>
            <Modal show={show} container={ref} animation={false} centered onHide={handleClose}>
                <Modal.Header>Edit Layer description</Modal.Header>
                <Modal.Body>
                    {data && data.error && (
                        <Alert variant="danger" animation={false} show transition={false}>
                            <h3 className='fw-bold'>{data.error.message}</h3>
                            <div className="ps-5">
                                {data.error.details.filter(d => d.target).map(d => <li key={d.target}>{d.target}: {d.descriptions.join('')}</li>)}
                            </div>
                        </Alert>
                    )}
                    <Formik
                        initialValues={initialValues}
                        onSubmit={values => edit({ ...values })}
                        validate={FORM_VALIDATION}
                    >
                        {({ handleSubmit, isValid }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <FormTextField 
                                name="description"
                                label="Description"
                                controlAs="textarea"
                                wrapped={{maxLength: 800}}
                            />  
                            <div className="mt-5">
                                <Button type='submit' size="lg" disabled={isLoading || !isValid }>Edit</Button>
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