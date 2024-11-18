import React, { useEffect, useRef, useState } from 'react';
import pick from 'lodash/pick';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import { useEditCasestudyRunMutation, useLazyGetToolsOptionsQuery } from '../../../../services/casestudies';
import SelectField from '../../../../components/SelectField'
import FormTextField from '../../../../components/FormTextField';

const FORM_VALIDATION = values => {
    const errors = {}
    if (!values.visibility) {
        errors.visibility = 'Required'
    }
    return errors
}


export default function EditCasestudyRun({ runId, id, btnProps, initialValues }) {
    const [edit, { isLoading, isSuccess, reset, data }] = useEditCasestudyRunMutation();
    const ref = useRef(null);
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [searchTools] = useLazyGetToolsOptionsQuery();
    const loadVisibility = async (search) => {
        const result = await searchTools({ group: 'visibility', search });
        return result.data.tools4_msp_options;
    }

    useEffect(() => {
        if (isSuccess && !data.error) {
            reset()
            handleClose();
        }
    }, [isSuccess])

    return (
        <div>
            <Button {...btnProps} onClick={handleShow}>Edit</Button>
            <div ref={ref}></div>
            <Modal show={show} container={ref} animation={false} centered onHide={handleClose}>
                <Modal.Header>Edit Run</Modal.Header>
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
                        initialValues={{
                            ...pick(initialValues, ['visibility', 'label', 'description']),
                            id,
                            runId,
                        }}
                        onSubmit={values => {
                            edit({ ...values, visibility: parseInt(values.visibility.value, 10) })
                        }}
                        validate={FORM_VALIDATION}
                    >
                        {({ handleSubmit, isValid }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <FormTextField 
                                name="label"
                                label="Label"
                            />
                            <FormTextField 
                                name="description"
                                label="Description"
                                controlAs="textarea"
                                wrapped={{maxLength: 800}}
                            />
                            <SelectField
                                name="visibility"
                                label="Visibility"
                                defaultOptions
                                loadOptions={loadVisibility}
                                getOptionLabel={v => v.label}
                                getOptionValue={v => v.label}
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