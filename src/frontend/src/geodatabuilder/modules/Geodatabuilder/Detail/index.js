import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import Variables from '../EditExpression/variables';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { LinkItUrl } from 'react-linkify-it';

export default function GeodatabuilderDetail() {
    const data = useOutletContext();
    return (
        <>
            <Row>
                <Col md={5}>
                    <LinkItUrl><p>{data.desc_expression || 'No description provided'}</p></LinkItUrl>
                </Col>
                <Col>
                </Col>
            </Row>
            <div className='my-3 d-flex justify-content-end'>
                <Button to="edit/" as={Link}>Edit Metadata</Button>
            </div>
            <h3 className='fw-bold'>Expression</h3>
            <SyntaxHighlighter language="python" style={darcula} customStyle={{ padding: '3rem', fontSize: '2rem' }}>{data.expression}</SyntaxHighlighter>
            <Variables id={data.id} actions={false} />
            <div className='my-3 d-flex justify-content-end'>
                <Button to="edit-expression/" as={Link}>Edit Expression</Button>
            </div>
        </>
    )
}
