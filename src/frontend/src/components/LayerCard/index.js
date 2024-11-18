import React from "react"
import { Badge, Button, Card, Ratio } from "react-bootstrap"

export default function LayerCard({ label, thumbnail }) {
    const [tag, name] = label.split('|')
    return (
        <Card className="mb-3">
            <div className="d-flex mb-3 position-absolute top-0 ms-2 mt-2" style={{zIndex: 2}}>
                <Badge pill className="">{tag}</Badge>
            </div>
            <Ratio aspectRatio="1x1">
                <Card.Img variant="top" src={thumbnail} />
            </Ratio>
            <Card.Body className="">                
                <div className="h3 card-title">{name}</div>
            </Card.Body>
        </Card>
    )
}