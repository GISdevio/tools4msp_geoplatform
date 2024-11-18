import React from 'react';
import { Spinner } from "react-bootstrap";

export const STATUS = (statusCode) => {
    switch(statusCode) {
        case 0: return <Spinner animation="border" />;
        case 1: return 'Ready';
        case 2: return 'Error';
        default: return 'Unknown'
    }
}

export const VISIBILITY = (visibility) => {
    switch(visibility) {
        case 0: return 'Private';
        case 1: return 'Hidden';
        case 2: return 'Public';
        default: return 'Unknown'
    }
}

export const ownerRender = (username) => {
    return username.split('__').pop()
}
