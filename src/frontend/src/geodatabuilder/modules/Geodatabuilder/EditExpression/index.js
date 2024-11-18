import { useOutletContext } from 'react-router-dom';
import { Formik, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { Breadcrumb, Container, Form, Button, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import FormTextField from '../../../../components/FormTextField';
import { useEditGeodatabuilderMutation, useValidateExpressionMutation } from '../../../../services/geodatabuilder';
import Variables from './variables';
import Layers from './layers';
import omit from 'lodash/omit';


function Buttons() {
    const { values, setFieldValue } = useFormikContext();

    return (
        <div className='d-flex my-3 operators-buttons align-items-center'>
            <span className='me-2'>Operators</span>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + '+')}>+</Button>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + '-')}>-</Button>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + '/')}>/</Button>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + '*')}>&#x2217;</Button>
            <span className="ms-5 me-2">Functions</span>
            <Button  onClick={() => setFieldValue('expression', (values.expression || '') + 'MAX()')}>MAX</Button>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + 'MIN()')}>MIN</Button>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + 'AVG()')}>AVG</Button>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + 'LOG()')}>LOG</Button>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + 'RESCALE()')}>RESCALE</Button>
            <Button onClick={() => setFieldValue('expression', (values.expression || '') + 'GAUSSIAN_FILTER()')}>GAUSSIAN_FILTER</Button>
        </div>
    )
}

export default function GeodatabuilderEditExpression() {
    const data = useOutletContext();
    const [validateExpr] = useValidateExpressionMutation()
    const validate = async values => {
        const errors = {}
        if (!values.expression) {
            errors.expression = 'Required'
            return errors
        }
        const response = await validateExpr(values.expression);
        if (response.error) {
            errors.expression = response.error.data.expression.join('\n')
        }

        return errors;
    }

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
                validate={validate}
                initialValues={omit(data, ['variables'])}
            >
                {({ handleSubmit, isValid }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12}>
                                <FormTextField
                                    name="expression"
                                    label="Expression"
                                    controlAs="textarea"
                                    wrapped={{ style: { height: 80, fontSize: '1.8rem' }}}
                                />
                                <Buttons />
                            </Col>
                            <Col md={12}>
                                <Variables id={data.id} />
                            </Col>
                        </Row>

                        <div className='mt-4'>
                            <Button type='submit' size="lg" disabled={isLoading || !isValid }>Save</Button>
                        </div>
                    </Form>
                )}
            </Formik>

            <Layers id={data.id} />
        </>
    )
}
