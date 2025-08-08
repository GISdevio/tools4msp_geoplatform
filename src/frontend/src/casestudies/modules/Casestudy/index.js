import React, { useState } from 'react';
import { Breadcrumb, Button, Col, Container, Nav, Row, Spinner } from "react-bootstrap";
import { Link, Outlet, useHref, useLocation, useParams, useResolvedPath } from "react-router-dom";
import { LinkItUrl } from 'react-linkify-it';
import { useGetCasestudyQuery } from "../../../services/casestudies";
import CloneCasestudy from './Clone';
import DeleteCasestudy from './Delete';
import EditCasestudy from './Edit';
import CasestudyMap from './Map';
import { ownerRender, VISIBILITY } from './utils';
import Trigger from '../../../components/Tooltip';
import moment from "moment";


export default function CasestudyPage() {
    const { id } = useParams()
    const { data, isLoading, isError, isSuccess, error } = useGetCasestudyQuery(id);
    let { pathname: path } = useLocation();
    const basePath = `/casestudies/${id}/`

    const [customSubArea, setSubArea] = useState(null);

    path = path.replace(basePath, '').split('/')[0]

    return (
        <>
        <Container>
            {isLoading && <Spinner animation="border" size="sm"/>}
            {isError && <h1 className="text-danger">{error.data.error.message}</h1>}
            {isSuccess && (
                <>
                    <div className='d-flex mb-5'>
                        <div>
                            <h1 className=''>{data.data.label}</h1>
                            <Breadcrumb>
                                <Breadcrumb.Item linkAs={Link} linkProps={{to: "/casestudies/"}}>All Casestudies</Breadcrumb.Item>
                                <Breadcrumb.Item linkAs={Link} linkProps={{to: `/casestudies/?module=${data.data.module}`}}>{data.data.module}</Breadcrumb.Item>
                                <Breadcrumb.Item active>{data.data.label}</Breadcrumb.Item>
                            </Breadcrumb>
                        </div>
                        
                        <div className='ms-auto d-flex align-items-start'>
                            <CloneCasestudy btnProps={{ className: "me-3", size: 'lg'}} id={data.data.id} label={data.data.label} />
                            {data.data.is_owner && <DeleteCasestudy btnProps={{ className: "me-3", size: 'lg', variant: 'danger'}} id={data.data.id} label={data.data.label} />}
                            {data.data.is_owner && <EditCasestudy btnProps={{ className: "me-3", size: 'lg', variant: 'warning'}} id={data.data.id} initialValues={data.data} />}
                        </div>
                    </div>
                    <div className='d-flex'>
                        <div className="me-4">
                            <Trigger content="Owner">
                                <i className="fa fa-user me-2" />
                                {ownerRender(data.data.owner)}
                            </Trigger>
                        </div>
                        <div className="me-4">
                            <Trigger content="Created at">
                                <i className="fa fa-calendar-o me-2" />
                                {moment(data.data.created).format('DD/MM/YYYY HH:mm')}
                            </Trigger>
                        </div>
                        <div className="me-4">
                            <Trigger content="Last edit at">
                                <i className="fa fa-calendar-plus-o me-2" />
                                {moment(data.data.updated).format('DD/MM/YYYY HH:mm')}
                            </Trigger>
                        </div>
                        <div className="me-4">
                            <Trigger content="Visibility">
                                <i className="fa fa-eye me-2" />
                                {VISIBILITY(data.data.visibility)}
                            </Trigger>
                        </div>
                        <div className="me-4">
                            <Trigger content="Resolution">
                                <i className="fa fa-th me-2" />
                                {data.data.resolution}
                            </Trigger>
                        </div>
                    </div>
                    <hr />
                    <Row>
                        <Col md={5}>
                            <LinkItUrl><p>{data.data.description || 'No description provided'}</p></LinkItUrl>
                        </Col>
                        <Col>
                            <CasestudyMap {...data.data} onChange={setSubArea} />
                        </Col>
                    </Row>
                    <Nav variant="tabs" activeKey={path}>
                        <Nav.Item>
                            <Nav.Link as={Link} eventKey='' to={basePath}>Datasets</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} eventKey="inputs" to={`${basePath}inputs/`}>Inputs</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} eventKey="runs" to={`${basePath}runs/`}>Run History</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <Outlet context={data ? { ...data.data, customSubArea } : null} />
                </>
            )}
            
        </Container>
        </>
    )
}