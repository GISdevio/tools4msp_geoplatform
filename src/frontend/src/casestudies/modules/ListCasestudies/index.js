import React, { useCallback, useEffect } from 'react'
import { Accordion, Badge, Button, Col, Container, Form, InputGroup, Pagination, Row, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import AsyncSelect from 'react-select/async';

import { usePagination } from '../../../libs/usePagination'
import { useGetCasestudiesQuery, useGetToolsOptionsQuery } from '../../../services/casestudies'
import { useLazyGetUsersQuery } from '../../../services/geonode';
import CasestudyEntry from './casestudy'
import { casestudiesListSelectors, casestudiesListActions } from './slice'

export default function ListCasestudies() {
    let [searchParams, setSearchParams] = useSearchParams();
    const params = useSelector(casestudiesListSelectors.params);
    const { module: mod, type, page, user, search } = useSelector(casestudiesListSelectors.raw);
    const { data, error, isLoading, isError, isSuccess } = useGetCasestudiesQuery(params);
    const { data: modules } = useGetToolsOptionsQuery({ group: 'module' });
    const { data: cstype } = useGetToolsOptionsQuery({ group: 'cstype' });

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(casestudiesListActions.setModule(searchParams.get('module') || ''))
        dispatch(casestudiesListActions.setType(searchParams.get('cstype') || ''))
        dispatch(casestudiesListActions.setPage(searchParams.get('page') || 1))
        const u = searchParams.get('owner')
        dispatch(casestudiesListActions.setUser(u ? { remote_id: u } : null))
        if (searchParams.get('search')) {
            dispatch(casestudiesListActions.setSearch(searchParams.get('search')))
        }
    }, [])

    useEffect(() => {
        setSearchParams(params);
    }, [params, setSearchParams])

    const onChangeModule = useCallback((e) => dispatch(casestudiesListActions.setModule(e.target.value)))
    const onChangeType = useCallback((e) => dispatch(casestudiesListActions.setType(e.target.value)))

    const loadPage = useCallback(p => dispatch(casestudiesListActions.setPage(p)))

    const pagination = usePagination({ totPages: data && data.data ? data.data.total_pages : 0, page, loadPage })

    const [searchUser] = useLazyGetUsersQuery();
    const loadUsers = async (text) => {
        const res = await searchUser(`?filter{user.username.icontains}=${text}`);
        return res.data.users
    }


    return (
        <Container>
            <Row>
                <Col md={3}>
                    <div className="sticky-top" style={{ top: '80px' }}>
                        <h2 className='ms-2 mt-2'>Filters</h2>
                        <Accordion className='mt-4' flush>
                            <Accordion.Item eventKey="search">
                                <Accordion.Header className='fw-bold'>Search</Accordion.Header>
                                <Accordion.Body>
                                    <InputGroup>
                                        <InputGroup.Text id="btnGroupAddon"><i className='fa fa-search'></i></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by Casestudy name"
                                            aria-label="Search by Casestudy name"
                                            aria-describedby="btnGroupAddon"
                                            value={search}
                                            onChange={e => dispatch(casestudiesListActions.setSearch(e.target.value))}
                                        />
                                    </InputGroup>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="user">
                                <Accordion.Header className='fw-bold'>User</Accordion.Header>
                                <Accordion.Body>
                                    <AsyncSelect 
                                        defaultOptions
                                        value={user}
                                        loadOptions={loadUsers}
                                        getOptionLabel={v => v.user ? v.user.username : v.remote_id}
                                        getOptionValue={v => v.remote_id}
                                        onChange={v => dispatch(casestudiesListActions.setUser(v))}
                                        isClearable
                                    />
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="module">
                                <Accordion.Header className='fw-bold'>Modules</Accordion.Header>
                                <Accordion.Body>
                                    <Form.Check type="radio" onChange={onChangeModule} checked={mod === ""} value="" label="All" />
                                    {modules && modules.tools4_msp_options && modules.tools4_msp_options.map(m => <Form.Check type="radio" onChange={onChangeModule} checked={mod === m.value} value={m.value} key={m.value} label={m.label} />)}
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="type">
                                <Accordion.Header className='fw-bold'>Type</Accordion.Header>
                                <Accordion.Body>
                                    <Form.Check type="radio" onChange={onChangeType} checked={type === ""} value="" label="All" name="module" />
                                    {cstype && cstype.tools4_msp_options && cstype.tools4_msp_options.map(m => <Form.Check type="radio" onChange={onChangeType} checked={type === m.value} value={m.value} key={m.value} label={m.label} name="type" />)}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                </Col>
                <Col>
                    <div className='d-flex align-items-center justify-content-between'>
                        <h1 className=''>Explore Casestudies {isSuccess && <Badge pill>{data.data.count}</Badge>}</h1>
                        <Button size="lg" as={Link} to="create/"><i className='fa fa-plus'></i></Button>
                    </div>
                    <div className='mt-3'>
                        {isLoading && <Spinner animation="border" role="status" />}
                        {isError && <p className='text-danger'>{error ? error.data.error?.message : 'Error'}</p>}
                        <Row md={3}>
                            {isSuccess && data.data.results.map(obj => <Col key={obj.id}><CasestudyEntry {...obj} /></Col>)}
                        </Row>
                        {isSuccess && pagination}
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
