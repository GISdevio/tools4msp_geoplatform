import React, { useCallback, useEffect } from 'react'
import { Container, Row, Col, Spinner, Badge, Button, Form, InputGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { usePagination } from '../../../libs/usePagination';
import { useGetGeodatabuildersQuery } from '../../../services/geodatabuilder';
import GeodatabuilderEntry from './entry';
import { geodatabuilderListActions, geodatabuilderListSelectors } from './slice';



export default function ListGeodatabuilder() {
    let [searchParams, setSearchParams] = useSearchParams();
    const params = useSelector(geodatabuilderListSelectors.params);
    const serverParams = useSelector(geodatabuilderListSelectors.serverParams);
    const { page, search } = useSelector(geodatabuilderListSelectors.raw);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(geodatabuilderListActions.setSearch(searchParams.get('search') || ''))
        dispatch(geodatabuilderListActions.setPage(parseInt(searchParams.get('page') || 1)))
    }, [])

    useEffect(() => {
        setSearchParams(params);
    }, [params, setSearchParams])

    const loadPage = useCallback(p => dispatch(geodatabuilderListActions.setPage(p)))
    const setSearch = useCallback(e => dispatch(geodatabuilderListActions.setSearch(e.target.value)))

    const { data, isLoading, isError, isSuccess } = useGetGeodatabuildersQuery(serverParams);
    const pagination = usePagination({
        totPages: data && Math.ceil(data.total/data.page_size),
        page,
        loadPage,
    })

    return (
        <Container>
            <Row>
                <Col md={3}>
                    <div className="sticky-top" style={{ top: '80px' }}>
                        <h2 className='ms-2 mt-2'>Filters</h2>
                        <h4>Search</h4>
                        <div>
                            <InputGroup>
                                <InputGroup.Text><i className="fa fa-search"></i></InputGroup.Text>
                                <Form.Control value={search} onChange={setSearch} />
                            </InputGroup>
                        </div>
                    </div>
                </Col>
                <Col>
                <Col>
                    <h1 className=''>Explore Geodatabuilder {isSuccess && <Badge pill>{data.total}</Badge>} <Button size="lg" as={Link} to="/geodatabuilders/create/"><i className="fa fa-plus"></i> Add</Button></h1>
                    <div className='mt-3'>
                        {isLoading && <Spinner animation="border" role="status" />}
                        {isError && <p className='text-danger'>An error occurred</p>}
                        <Row md={3}>
                            {isSuccess && data.geo_data_builders.map(obj => <Col key={obj.id}><GeodatabuilderEntry {...obj} /></Col>)}
                        </Row>
                    </div>
                    {data && pagination}
                </Col>
                </Col>
            </Row>
        </Container>
    )
}
