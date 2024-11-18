import React from "react"
import { Badge, Button, Card, Spinner } from "react-bootstrap";
import { Link, useParams, useSearchParams } from "react-router-dom";
import moment from 'moment';
import { useGetCasestudyRunsQuery } from "../../../../services/casestudies";
import { ownerRender, STATUS, VISIBILITY } from "../utils";
import { usePagination } from '../../../../libs/usePagination';
import { LinkItUrl } from "react-linkify-it";

export default function CasestudyRuns() {
    const { id } = useParams()
    let [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page')) || 1

    const { data, isLoading, isError, isSuccess } = useGetCasestudyRunsQuery({ id, query: `?page=${page}` });

    const pagination = usePagination({
        totPages: data && data.data && data.data.total_pages,
        page,
        loadPage: p => setSearchParams(`page=${p}`)
    })

    return (
        <div className="mt-4">
            {isLoading && <Spinner animation="border" />}
            {isError && <p className="text-danger">{data.error.message}</p>}
            {isSuccess && (
                <>
                    {data.data.results.map(r => (
                        <Card key={r.id} className="my-3">
                            <Card.Body>
                                <h2><i className="fa fa-tasks me-2"></i>{r.label || `Run ${moment(r.created).format('DD/MM/YYYY HH:mm')}`}<Badge pill className="ms-1">{STATUS(r.runstatus)}</Badge></h2>
                                <p>
                                    <i className="fa fa-user me-2"></i>{ownerRender(r.owner)}<br />
                                    <i className="fa fa-eye me-2"></i>{VISIBILITY(r.visibility)}
                                </p>
                                {r.description && <LinkItUrl><p>{r.description}</p></LinkItUrl>}
                                <p><Badge pill><i className="fa fa-map-o me-2"></i>{r.outputlayers && r.outputlayers.length}</Badge> <Badge pill><i className="fa fa-files-o me-2"></i>{r.outputs && r.outputs.length}</Badge></p>
                                <Button as={Link} to={`/casestudies/${id}/runs/${r.id}/`}>Open</Button>
                            </Card.Body>
                        </Card>))}
                    {!data.data.count && <p>No runs found</p>}
                    {pagination}
                </>
            )}
        </div>
    )
}