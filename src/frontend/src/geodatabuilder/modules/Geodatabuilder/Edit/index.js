import { useOutletContext } from 'react-router-dom';
import { Formik } from 'formik';
import React, { useEffect } from 'react';
import { Breadcrumb, Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import FormTextField from '../../../../components/FormTextField';
import { useEditGeodatabuilderMutation } from '../../../../services/geodatabuilder';
import omit from 'lodash/omit' 

const FORM_VALIDATION = values => {
    const errors = {}
    if (!values.label) {
        errors.label = 'Required'
    }
    return errors
}

export default function GeodatabuilderEdit() {
    const data = useOutletContext();

    const [edit, { isLoading, isSuccess, data: result }] = useEditGeodatabuilderMutation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSuccess) {
            navigate(`/geodatabuilders/${data.id}/`);
        }
    }, [isSuccess])

    return (
        <>
            <Formik
                onSubmit={edit}
                validate={FORM_VALIDATION}
                initialValues={omit(data, ['variables'])}
            >
                {({ handleSubmit, isValid }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <FormTextField 
                            name="label"
                            label="Label"
                        />
                        <FormTextField 
                            name="desc_expression"
                            label="Description"
                            controlAs="textarea"
                            wrapped={{ style: { height: 80 }}}
                        />
                        <div className='mt-4'>
                            <Button type='submit' size="lg" disabled={isLoading || !isValid }>Save</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
}
