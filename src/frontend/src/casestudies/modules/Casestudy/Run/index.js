import React, { useMemo, useState } from "react"
import { Badge, Button, Card, Spinner, Row, Col, Ratio, Accordion, Form, Toast, Alert } from "react-bootstrap";
import { Link, useParams, useLocation } from "react-router-dom";
import { useGetCasestudyRunQuery, useUploadCasestudyRunMutation } from "../../../../services/casestudies";
import moment from "moment";
import { toast } from 'react-toastify';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ownerRender, STATUS, VISIBILITY } from "../utils";
import EditCasestudyRun from "../RunEdit";
import UploadDocuments from "../UploadDocuments";
import Viewer from 'react-viewer';
import { LinkItUrl } from "react-linkify-it";
import DeleteCasestudyRun from "../RunDelete";
import { useGetInfoQuery } from "../../../../services/auth";


const defer = (fn, args, time) => new Promise((res, rej) => {
  setTimeout(() => {
    fn(...args).then(res).catch(rej)
  }, time)
});

const sleep = (time = 1000) => new Promise((res, rej) => {
  setTimeout(res, time)
})

async function check_layer(name, attributes, retry = 0) {
    // Check if layer exists with this name
    const result = await fetch("/api/v2/layers/?filter{name}=" + name).then(result => result.json())

    if (result.layers.length) {
      sleep(5000)
      const headers = new Headers();
      const csrftoken = $('[name="csrfmiddlewaretoken"]').attr('value');
      headers.set('X-CSRFToken', csrftoken);
      headers.set('Content-Type', 'application/json')
      var layer = result.layers[0]
      await fetch(`/api/v2/layers/${layer.pk}/`, { method: 'PATCH', headers, body: JSON.stringify({ abstract: attributes.description || 'No description provided', title: attributes.label })})
      toast.success(`Layer ${name} successfully uplaoded`)
      return layer
    } else {
      if (retry < 50) {
        const layer = await defer(check_layer, [name, attributes, retry + 1], 5000)
        return layer;
      } else {
        return null;
      }
    }
  }
  
async function downloadLayer(code, run, casestudy) {
  return fetch(`/api/v2/casestudies/${casestudy}/runs/${run}/outputlayers/${code}/`).then(res => res.blob())
}

async function upload_layer(code, run, casestudy_id, attributes, profile) {

  const csrftoken = $('[name="csrfmiddlewaretoken"]').attr('value');
  const headers = new Headers();
  headers.set('X-CSRFToken', csrftoken);

  const blob = await downloadLayer(code, run, casestudy_id, attributes)
  const formData = new FormData()
  formData.set("time", false)

  const blobAttrs = {
    type: "application/octet-stream"
  };
  const file = new File([blob], `${casestudy_id}_${run}_${code}.tif`, blobAttrs)

  formData.set("base_file", file)
  formData.set("tif_file", file)
  formData.set("permissions", '{"users":{"AnonymousUser":["view_resourcebase","download_resourcebase"]},"groups":{}}')
  formData.set("charset", "UTF-8")

  const data = await fetch(window.SITE_URL + "api/v2/uploads/upload", {
    "credentials": "include",
    "body": formData,
    "headers": headers,
    "method": "POST",
    "mode": "cors"
  })
  .then(response => response.json())
  .then(data => console.log("data", data))
  .catch(error => console.error("--->Error:", error));

  // TO-DO: FIX API ERROR AND REWORK THIS PART
  // while(data?.redirect_to) {
  //   data = await fetch(data.redirect_to).then(result => result.json())
  // }
  // console.log(data)
  // // Get layer ID
  // var name = data.url.split(":").pop()
  // const layer = await check_layer(name, attributes)
  // console.log(layer)
  // if (attributes.sld) {
  //   // force style
  //   try {
  //     await fetch(`/gs/rest/styles/${layer.default_style.name}?raw=true&access_token=${profile.access_token}`, {
  //       method: 'PUT',
  //       body: attributes.sld,
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
  // return layer
  return null
}

export default function CasestudyRun() {
    const [copied, setCopied ] = useState(false);
    const [uploadingLayers, setUploadingLayers] = useState(false);
    const [mapUrl, setMapUrl] = useState(null);
    const [image, setImage] = useState(null);
  
    const { id, runId } = useParams()
    const query = useMemo(() => ({ id, runId }), [id, runId])
    const { data, isLoading, isError, isSuccess } = useGetCasestudyRunQuery(query, { pollingInterval: 10000 });
    const { data: profile } = useGetInfoQuery()

    async function createMap() {
      setUploadingLayers(true)
      const layers = await Promise.all(data.data.outputlayers.map(l => upload_layer(l.code, runId, id, l, profile)))
      console.log(layers)
      setMapUrl(layers.map(l => `layer=${l.store}:${l.alternate}`).join('&'))
      setUploadingLayers(false)
    }

    return (
        <div className="mt-4">
            {isLoading && !data  && <Spinner animation="border" size="sm"/>}
            {isError && <p className="text-danger">{data.error.message}</p>}
            {isSuccess && (
                <>
                    <Card className="my-3">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h2><i className="fa fa-tasks me-2"></i>{data.data.label || `Run ${moment(data.data.created).format('DD/MM/YYYY HH:mm')}`}<Badge pill className="ms-1">{STATUS(data.data.runstatus)}</Badge></h2>
                                    <div className="d-flex">
                                        <Button className="mx-2" as={Link} to={`/casestudies/${id}/runs/`} variant="secondary">Back</Button>
                                        {data.data.is_owner && <Button className="mx-2" onClick={createMap} disabled={uploadingLayers}>Upload layers to map{uploadingLayers && <Spinner animation="border" size="sm"/>}</Button>}
                                        {data.data.is_owner && <UploadDocuments id={id} runId={runId} btnProps={{ className: 'mx-2' }} />}
                                        {data.data.is_owner && <EditCasestudyRun id={id} initialValues={data.data} runId={runId} btnProps={{ className: 'mx-2' }} />}
                                        {data.data.is_owner && <DeleteCasestudyRun id={id} runId={runId} btnProps={{ className: 'mx-2', variant: 'danger' }} />}
                                    </div>
                                </div>
                                {mapUrl && (
                                  <Alert variant="warning" transition={null} className="my-4">
                                    Uploads of layers was successful, but to create a map you need to save the following map <Button href={`/maps/new?${mapUrl}`} target="_blank">Open Map</Button>
                                  </Alert>
                                )}
                                <div className="new-fs-5 ps-4">
                                    <p>
                                        <i className="fa fa-user me-2"></i>{ownerRender(data.data.owner)}<br />
                                        <i className="fa fa-eye me-2"></i>{VISIBILITY(data.data.visibility)}<br />
                                        <i className="fa fa-calendar-o me-2"></i>Created at {moment(data.data.created).format('DD/MM/YYYY HH:mm')}<br/>
                                        <i className="fa fa-calendar-plus-o me-2"></i>Last updated at {moment(data.data.updated).format('DD/MM/YYYY HH:mm')}
                                    </p>
                                </div>

                                {data.data.description && (
                                  <div className="new-fs-5 ps-4">
                                    <LinkItUrl><p>{data.data.description}</p></LinkItUrl>
                                  </div>
                                )}

                                {data.data.runstatus === 2 && (
                                  <Alert variant="danger" transition={null} className="my-4">
                                    Run failed with the following error: {data.data.runerror}
                                  </Alert>
                                )}

                                <Viewer
                                  visible={image}
                                  onClose={() => setImage(null)}
                                  images={image ? [{ src: image }] : null}
                                  attribute
                                  drag={false}
                                  noToolbar
                                  noFooter
                                  noClose
                                  zoomable={false}
                                  disableMouseZoom
                                  zIndex={99999999999999}
                                  onMaskClick={() => setImage(null)}
                                />
                                
                                <Accordion className="mb-3">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>
                                            <h3><i className="fa fa-map-o me-2"></i> Layers <Badge pill>{data.data.outputlayers.length}</Badge></h3>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Row md={4}>
                                                {data.data.outputlayers.map(l => (
                                                    <Col key={l.file} className="my-2">
                                                        <Card>
                                                            <Ratio aspectRatio="1x1">
                                                                <Card.Img src={l.thumbnail} onClick={() => setImage(l.thumbnail)} />
                                                            </Ratio>
                                                            <Card.Body>
                                                                <div className="h3 card-title">{l.label}</div>
                                                                <p className="fw-light new-fs-5">{l.description || 'No description provided'}</p>
                                                                <p><Badge bg="secondary">{l.code}</Badge></p>
                                                                <Button as="a" href={l.file} target="_blank" download><i className="fa fa-download"></i> Download</Button>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                                <Accordion>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>
                                            <h3><i className="fa fa-files-o me-2"></i>Documents <Badge pill>{data.data.outputs.length}</Badge></h3>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Row md={4}>
                                                {data.data.outputs.map(l => (
                                                    <Col key={l.file} className="my-2">
                                                        <Card>
                                                            <Ratio aspectRatio="1x1">
                                                                <Card.Img src={l.thumbnail} onClick={() => setImage(l.thumbnail)} />
                                                            </Ratio>
                                                            <Card.Body>
                                                                <div className="h3 card-title">{l.label}</div>
                                                                <p className="fw-light new-fs-5">{l.description || 'No description provided'}</p>
                                                                <p><Badge bg="secondary">{l.code}</Badge></p>
                                                                <Button as="a" href={l.file} target="_blank" download><i className="fa fa-download"></i> Download</Button>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                                <div className="mt-5">
                                    <h3><i className="me-2 fa fa-share-alt"></i>Share</h3>
                                    <Form.Control as="textarea" value={location.href} readOnly disabled rows={2} cols={50} size="lg" />
                                    <div className="mt-3 d-flex align-items-center">
                                        <CopyToClipboard text={location.href} onCopy={() => setCopied(true)}>
                                            <Button className="me-3 my-2"><i className="fa fa-copy me-2"></i>Copy to clipboard</Button>
                                        </CopyToClipboard>
                                        <Toast onClose={() => setCopied(false)} animation={false} show={copied} className="" delay={3000} autohide>
                                            <Toast.Body>Copied to clipboard</Toast.Body>
                                        </Toast>
                                    </div>
                                    
                                </div>
                            </Card.Body>
                        </Card>
                </>
            )}
        </div>
    )
}