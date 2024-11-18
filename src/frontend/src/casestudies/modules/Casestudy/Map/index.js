import React from 'react';
import {
    MapContainer, TileLayer, GeoJSON, FeatureGroup, LayersControl
} from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"

import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'


export default function CasestudyMap({ extent, domain_area, onChange, ...props }) {
    const ref = React.useRef(null);

    if (!extent && !domain_area) {
        return null;
    }

    const bounds = extent ? [
        [extent[1], extent[0]], 
        [extent[3], extent[2]],
    ] : null

    function processChange() {
        if (onChange) {
            onChange(ref.current.toGeoJSON())
        }
    }

    return (
        <div style={{ height: '350px' }}>
            <MapContainer style={{ height: '350px' }} bounds={bounds} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />  
                <LayersControl position="topright">
                    <LayersControl.Overlay checked name="Domain area">
                        <GeoJSON data={domain_area} pathOptions={{ fillColor: 'yellow', color: 'red', fillOpacity: 0.5, opacity: 0.7 }} />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay checked name="Custom area">
                        <FeatureGroup ref={ref}>
                            <EditControl
                                position='bottomright'
                                onEdited={processChange}
                                onCreated={processChange}
                                onDeleted={processChange}
                                draw={{
                                    marker: false,
                                    polyline: false,
                                    circlemarker: false,
                                    circle: false,
                                }}

                            />
                        </FeatureGroup>
                    </LayersControl.Overlay>
                </LayersControl>
            </MapContainer>
        </div>
    )
}