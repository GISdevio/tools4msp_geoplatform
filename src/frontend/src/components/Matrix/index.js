import React, { useState, useMemo } from "react"
import { Table, Form, Button, Spinner, Dropdown } from "react-bootstrap"
import {ErrorBoundary} from 'react-error-boundary'
import { Formik } from 'formik';
import classnames from 'classnames';
import Trigger from "../Tooltip";

function Wrapper({ type = 'number', options, handleChange, handleBlur, field, ...props }) {
    if (type === 'select') {
        return (
            <Trigger content={field}>
                <Form.Select {...props} onChange={handleChange} onBlur={handleBlur}>
                    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Form.Select>
            </Trigger>
        )
    } 

    return (
        <Trigger content={field}>
            <Form.Control 
                {...props}
                type={type}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        </Trigger>
    )
}

function TdContent({ c, r, index, x, y, formValues, handleChange, matrixValues, handleBlur, setFocusedKey, separators, editable, extra }) {
    const name = `${x}${separators.secondary}${c}${separators.main}${y}${separators.secondary}${r}`

    const extraProps = useMemo(() => extra[name] || {}, [extra, name]);

    if (!formValues[name]) {
        return null;
    }


    return (
        <>
            {matrixValues.map(v => (
                <Wrapper
                    {...extraProps}
                    disabled={!editable}
                    key={v}
                    field={v}
                    name={`${name}.${v}`}
                    value={formValues[name][v]}
                    className="my-1"
                    style={{ minWidth: '6em' }}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    onFocus={
                        () => setFocusedKey([c, r])
                    }
                />
            ))}
        </>
    )
}

function Toolbar({ isSubmitting, cols = [], rows = [], visibleColumns, setVisibleColumns, drop='down' }) {
    const params = useMemo(() => Array.from(new Set([...cols, ...rows])), [cols, rows])

    const toggleElement = element => visibleColumns.includes(element) ? setVisibleColumns(visibleColumns.filter(e => e !== element)) : setVisibleColumns([...visibleColumns, element])
    
    return (
        <div className="my-2 d-flex justify-content-end">
            <Dropdown className="mx-2" drop={drop} align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic" size="lg">
                    <i className="fa fa-eye" /> Shown Params
                </Dropdown.Toggle>

                <Dropdown.Menu className="py-0">
                    <div className="overflow-auto pe-5 px-2 pt-2" style={{ maxHeight: '300px' }}>
                        {params.map(element => (
                            <Form.Check 
                                key={element} 
                                name={element} 
                                checked={visibleColumns.includes(element)} 
                                label={element} 
                                onChange={() => toggleElement(element)}
                                type="checkbox"
                            />
                        ))}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
            <Button type="submit" size="lg" className="mx-2" disabled={isSubmitting}>{isSubmitting && <Spinner animation="border" className="mr-2" />}Save</Button>
        </div>
    )
}

const RIGHT_BORDER_STYLE = { borderRightColor: 'black', borderRightWidth: '2px' }

export default function Matrix({ cols, rows, values: matrixValues, index, x, y, extra, isUpdating, update, separators, visibleCodes, editable, fetchContent }) {
    const [focusedKey, setFocusedKey] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState(visibleCodes);
    const toolbar = useMemo(() => (
        <Toolbar isSubmitting={isUpdating} cols={cols} rows={rows} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
    ), [cols, rows, visibleColumns, isUpdating])
    return (
        <div>
            <Formik 
                initialValues={index}
                onSubmit={formResult => update(formResult)}
            >
                {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    errors,
                    values,
                }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        {toolbar}
                        <Table responsive bordered>
                            <thead>
                                <tr>
                                    <th style={RIGHT_BORDER_STYLE}></th>
                                    {cols.filter(c => visibleColumns.includes(c)).map(c => (
                                        <th key={c} className={classnames("text-center", { 'bg-highlight': focusedKey[0] == c })}>
                                            <Trigger content={fetchContent(c)}>{c}</Trigger>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.filter(r => visibleColumns.includes(r)).map(r => (
                                    <tr key={r}>
                                        <td className={classnames("text-center fw-bold", { 'bg-highlight': focusedKey[1] == r })} style={RIGHT_BORDER_STYLE}>
                                            <Trigger content={fetchContent(r)}>{r}</Trigger>
                                        </td>
                                        {cols.filter(c => visibleColumns.includes(c)).map(c => (
                                            <td key={`${x}${c}#${y}${r}`} className={classnames({ 'bg-highlight': focusedKey[0] == c || focusedKey[1] == r })}>
                                                <ErrorBoundary fallbackRender={() => <>Error</>}>
                                                    <TdContent
                                                        matrixValues={matrixValues} 
                                                        c={c} 
                                                        r={r} 
                                                        index={index} 
                                                        x={x}
                                                        y={y}
                                                        handleChange={handleChange}
                                                        handleBlur={handleBlur}
                                                        formValues={values}
                                                        setFocusedKey={setFocusedKey}
                                                        separators={separators}
                                                        editable={editable}
                                                        extra={extra}
                                                    />
                                                </ErrorBoundary>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {toolbar}
                    </Form>
                )}
            </Formik>
        </div>
    )
}