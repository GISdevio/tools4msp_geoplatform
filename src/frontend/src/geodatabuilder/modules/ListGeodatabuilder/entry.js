import React from "react"
import { Badge, Button, Card, Ratio } from "react-bootstrap"
import { Link } from "react-router-dom"
import { LinkItUrl } from 'react-linkify-it';
import Trigger from '../../../components/Tooltip';

export default function GeodatabuilderEntry({ id, label, desc_expression: description, owner, created, updated }) {
    return (
        <Card className="mb-3">
            <div className="d-flex mb-3 position-absolute top-0 ms-2 mt-2" style={{zIndex: 2}}>
            </div>
            
            <Card.Body className="">
                
                <div className="h3 card-title">{label}</div>
                <LinkItUrl><Card.Text>{description}</Card.Text></LinkItUrl>
                <div className="d-flex align-items-center flex-wrap">
                    <Trigger content="Owner">
                        <i className="fa fa-user me-1" />{owner.username}
                    </Trigger>
                    <Trigger content="Created at">
                        <i className="fa fa-calendar-o me-1 ms-3" />{moment(created).format('DD/MM/YYYY')}
                    </Trigger>
                    <Trigger content="Last edit">
                        <i className="fa fa-calendar-plus-o ms-3 me-1" />{moment(updated).format('DD/MM/YYYY')}
                    </Trigger>
                </div>
                <Button className="mt-4" as={Link} to={`/geodatabuilders/${id}/`}>Open</Button>
            </Card.Body>
        </Card>
    )
}