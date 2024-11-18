import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import { useCreateCasestudyMutation, useLazyGetContextsQuery, useLazyGetDomainAreaQuery, useLazyGetToolsOptionsQuery } from '../../../services/casestudies';
import FormTextField from '../../../components/FormTextField';
import SelectField from '../../../components/SelectField';
import getIdFromUrl from '../../../libs/getIdFromUrl';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const FORM_VALIDATION = values => {
    const errors = {}
    if (!values && !values.label) {
        errors.label = 'Required'
    }
    if (!values && !values.description) {
        errors.description = 'Required'
    }
    return errors
}


export default function CreateCasestudy() {
    const [create, { isLoading, isSuccess, reset, data }] = useCreateCasestudyMutation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isSuccess && !data.error) {
            reset()
        }
    }, [isSuccess])

    const [searchTools] = useLazyGetToolsOptionsQuery();
    const loadModules = async (search) => {
        const result = await searchTools({ group: 'module', search });
        return result.data.tools4_msp_options;
    }

    const [searchDomains] = useLazyGetDomainAreaQuery();
    const loadDomains = async (search) => {
        const result = await searchDomains(search ? `?search=${search}` : '');
        return result.data.data;
    }

    const [searchContext] = useLazyGetContextsQuery();
    const loadContext = async (search) => {
        const result = await searchContext(search ? `?search=${search}` : '');
        return result.data.data;
    }


    async function runCreate(values) {
        console.log(values)
        const result = await create({ 
            ...values, 
            module: values.module.value,
            context: values.context.label,
            domain_area_terms: values.domain_area_terms.map(t => t.id) 
        })
        if (result && result.data) {
            navigate(`/casestudies/${result.data.data.id}/`);
        }
        if (result.error) {
            toast.error((
                <>
                <p>{result.error.data.error.message}</p>
                {result.error.data.error.details.non_field_errors && (
                    <ul>
                        {result.error.data.error.details.non_field_errors.map(e => <li key={e}>{e}</li>)}
                    </ul>
                )}
                </>
            ))
        }
    }

    return (
        <Container>
            <h1 className=''>Create Casestudy</h1>

            {data && data.error && (
                <Alert variant="danger" animation={false} show transition={false}>
                    <h3 className='fw-bold'>{data.error.message}</h3>
                    <div className="ps-5">
                        {data.error.details.filter(d => d.target).map(d => <li key={d.target}>{d.target}: {d.descriptions.join('')}</li>)}
                    </div>
                </Alert>
            )}
            <Formik
                initialValues={{}}
                onSubmit={runCreate}
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
                    <FormTextField 
                        name="resolution"
                        label="Resolution (meters)"
                        type="number"
                    />
                    <SelectField
                        name="module"
                        label="Module"
                        defaultOptions
                        loadOptions={loadModules}
                        getOptionLabel={v => v.label}
                        getOptionValue={v => v.value}
                    />
                    <SelectField
                        name="context"
                        label="Context"
                        defaultOptions
                        loadOptions={loadContext}
                        getOptionLabel={v => v.label + (v.description ? ` - ${v.description}` : '')}
                        getOptionValue={v => v.label}
                    />
                    <SelectField
                        name="domain_area_terms"
                        label="Domain Areas"
                        defaultOptions
                        loadOptions={loadDomains}
                        getOptionLabel={v => v.label}
                        getOptionValue={v => v.url}
                        isMulti
                    />
                    
                    <div className="mt-5">
                        <Button type='submit' size="lg" disabled={isLoading || !isValid }>Create</Button>
                    </div>
                </Form>
                )}
            </Formik>
        </Container>
    )
}