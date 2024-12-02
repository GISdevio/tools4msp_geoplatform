import React from 'react';
import { Breadcrumb, Button, Container, Spinner } from "react-bootstrap";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useGetGeodatabuilderQuery } from "../../../services/geodatabuilder";
import moment from 'moment';
import DeleteGeodatabuilder from './Delete';
import Trigger from '../../../components/Tooltip';

export default function GeodatabuilderPage() {
    const { id } = useParams()
    const { data = {}, isLoading, isError, isSuccess } = useGetGeodatabuilderQuery(id, '?');
    let { pathname: path } = useLocation();
    const basePath = `/geodatabuilders/${id}/`

    path = path.replace(basePath, '').split('/')[0]
    const { geo_data_builder } = data;

    function uploadToCasestudy() {
        window.top.postMessage({ 'geodatabuilder': id }, '*');
    }

    return (
        <>
        <Container>
            {isLoading && <Spinner animation="border" size="sm"/>}
            {isError && <h1 className="text-danger">An error occurred</h1>}
            {isSuccess && (
                <>
                    <div className='d-flex mb-5'>
                        <div>
                            <h1 className=''>{geo_data_builder.label}</h1>
                            <Breadcrumb>
                                <Breadcrumb.Item linkAs={Link} linkProps={{to: "/geodatabuilders/"}}>All Geodatabuilders</Breadcrumb.Item>
                                <Breadcrumb.Item active>{geo_data_builder.label}</Breadcrumb.Item>
                            </Breadcrumb>
                        </div>
                        
                        <div className='ms-auto d-flex align-items-start'>
                            {!window.IFRAME_WIZARD_GEODATABUIxLDER && geo_data_builder.is_owner && <DeleteGeodatabuilder btnProps={{ className: "me-3", size: 'lg', variant: 'danger'}} id={id} label={geo_data_builder.label} />}
                            {window.IFRAME_WIZARD_GEODATABUILDER && <Button disabled={!geo_data_builder.expression} size="lg" variant="success" onClick={uploadToCasestudy}>Upload to casestudy</Button>}
                        </div>
                    </div>
                    <div className='d-flex'>
                        <div className="me-4">
                            <Trigger content="Owner">
                                <i className="fa fa-user me-2" />
                                {geo_data_builder.owner.username}
                            </Trigger>
                        </div>
                        <div className="me-4">
                            <Trigger content="Created at">
                                <i className="fa fa-calendar-o me-2" />
                                {moment(geo_data_builder.created).format('DD/MM/YYYY HH:mm')}
                            </Trigger>
                        </div>
                        <div className="me-4">
                            <Trigger content="Last edit at">
                                <i className="fa fa-calendar-plus-o me-2" />
                                {moment(geo_data_builder.updated).format('DD/MM/YYYY HH:mm')}
                            </Trigger>
                        </div>
                    </div>
                    <hr />
                    <Outlet context={geo_data_builder} />
                </>
            )}
            
        </Container>
        </>
    )
}