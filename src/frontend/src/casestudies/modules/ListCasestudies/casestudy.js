import moment from "moment"
import React from "react"
import { Badge, Button, Card, Ratio } from "react-bootstrap"
import { Link } from "react-router-dom"
import Trigger from "../../../components/Tooltip"
import { ownerRender } from "../Casestudy/utils"

export default function CasestudyEntry({ id, label, thumbnails, description, module, cstype, resolution, owner, created, updated }) {
    return (
        <Card className="mb-3">
            <div className="d-flex mb-3 position-absolute top-0 ms-2 mt-2" style={{zIndex: 2}}>
                <Badge pill className="me-3">{module}</Badge>
                <Badge pill className="me-3">{cstype}</Badge>
                <Badge pill>{resolution}</Badge>
            </div>
            <Ratio aspectRatio="4x3">
                <Card.Img variant="top" src={thumbnails.length ? thumbnails[0].thumbnail : ''} />
            </Ratio>
            <Card.Body className="">
                
                <div className="h3 card-title">{label}</div>
                <Card.Text>{description}</Card.Text>
                <div className="d-flex align-items-center flex-wrap">
                    <Trigger content="Owner">
                        <i className="fa fa-user me-1" />{ownerRender(owner)}
                    </Trigger>
                    <Trigger content="Created at">
                        <i className="fa fa-calendar-o me-1 ms-3" />{moment(created).format('DD/MM/YYYY')}
                    </Trigger>
                    <Trigger content="Last edit">
                        <i className="fa fa-calendar-plus-o ms-3 me-1" />{moment(updated).format('DD/MM/YYYY')}
                    </Trigger>
                </div>
                <Button className="mt-4" as={Link} to={`/casestudies/${id}/`}>Open</Button>
            </Card.Body>
        </Card>
    )
}