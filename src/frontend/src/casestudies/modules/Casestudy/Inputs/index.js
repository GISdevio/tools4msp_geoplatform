import React from "react"
import { Nav, Spinner, Tab, Tabs } from "react-bootstrap";
import { Link, Outlet, useLocation, useOutletContext, useParams } from "react-router-dom";
import { useGetCasestudyInputsQuery } from "../../../../services/casestudies";
import getIdFromUrl from "../../../../libs/getIdFromUrl";

export default function CasestudyInputs() {
    const { id } = useParams()
    const { data, isLoading, isError, error, isSuccess } = useGetCasestudyInputsQuery(id);
    let { pathname: path } = useLocation();
    const basePath = `/casestudies/${id}/inputs/`
    path = path.replace(basePath, '').split('/')[0];
    const casestudy = useOutletContext();


    return (
        <div className="mt-4">
            {isLoading && <Spinner animation="border" size="sm"/>}
            {isError && <p className="text-danger">{error.data.error.message}</p>}
            {isSuccess && (
                <>
                    <Nav variant="tabs" activeKey={path} className="sticky">
                        {data.data.map(input => (
                            <Nav.Item key={input.code}>
                                <Nav.Link as={Link} eventKey={getIdFromUrl(input.url)} to={`${basePath}${getIdFromUrl(input.url)}/`}>{input.code}</Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>
                    <Outlet context={casestudy} />
                </>
            )}
        </div>
    )
}