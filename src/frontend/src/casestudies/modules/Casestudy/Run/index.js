import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Spinner,
  Row,
  Col,
  Ratio,
  Accordion,
  Form,
  Toast,
  Alert,
} from "react-bootstrap";
import { Link, useParams, useLocation } from "react-router-dom";
import { useGetCasestudyRunQuery } from "../../../../services/casestudies";
import moment from "moment";
import { toast } from "react-toastify";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ownerRender, STATUS, VISIBILITY } from "../utils";
import EditCasestudyRun from "../RunEdit";
import Viewer from "react-viewer";
import { LinkItUrl } from "react-linkify-it";
import DeleteCasestudyRun from "../RunDelete";
import { useGetInfoQuery } from "../../../../services/auth";

async function downloadLayer(code, run, casestudy) {
  return fetch(
    `/api/v2/casestudies/${casestudy}/runs/${run}/outputlayers/${code}/`
  ).then((res) => res.blob());
}

export default function CasestudyRun() {
  const [copied, setCopied] = useState(false);
  const [uploadingIndividualLayers, setUploadingIndividualLayers] = useState(
    new Set()
  );
  const [uploadingIndividualDocuments, setUploadingIndividualDocuments] =
    useState(new Set());
  const [image, setImage] = useState(null);

  const { id, runId } = useParams();
  const query = useMemo(() => ({ id, runId }), [id, runId]);
  const { data, isLoading, isError, isSuccess } = useGetCasestudyRunQuery(
    query,
    { pollingInterval: 10000 }
  );
  const { data: profile } = useGetInfoQuery();

  async function uploadSingleLayer(layer) {
    // Add layer code to uploading set
    setUploadingIndividualLayers((prev) => new Set([...prev, layer.code]));

    try {
      const blob = await downloadLayer(layer.code, runId, id);
      const formData = new FormData();

      const blobAttrs = {
        type: "application/octet-stream",
      };
      const file = new File(
        [blob],
        `${id}_${runId}_${layer.code}.tif`,
        blobAttrs
      );

      formData.set("time", false);
      formData.set("base_file", file);
      formData.set("tif_file", file);
      formData.set(
        "permissions",
        '{"users":{"AnonymousUser":["view_resourcebase","download_resourcebase"]},"groups":{}}'
      );
      formData.set("charset", "UTF-8");

      function getCSRFToken() {
        return (
          document.querySelector("[name=csrfmiddlewaretoken]")?.value ||
          document
            .querySelector("meta[name=csrf-token]")
            ?.getAttribute("content") ||
          ""
        );
      }

      const csrftoken = getCSRFToken();
      const headers = new Headers();
      headers.set("X-CSRFToken", csrftoken);

      const response = await fetch(window.SITE_URL + "api/v2/uploads/upload", {
        credentials: "include",
        body: formData,
        headers: headers,
        method: "POST",
        mode: "cors",
      });

      if (response.ok) {
        toast.success(`Layer "${layer.label}" uploaded successfully!`);
      } else {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload layer "${layer.label}": ${error.message}`);
    } finally {
      // Remove layer code from uploading set
      setUploadingIndividualLayers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(layer.code);
        return newSet;
      });
    }
  }

  async function downloadDocument(documentFile, documentCode) {
    // Instead of downloading directly from external API (which causes CORS issues),
    // we'll use the existing API endpoint that already handles this
    const downloadUrl = `/api/v2/casestudies/${id}/runs/${runId}/outputlayers/${documentCode}/`;

    try {
      const response = await fetch(downloadUrl, {
        credentials: "include",
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download document: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error downloading document:", error);
      throw error;
    }
  }

  async function uploadSingleDocument(documentObj) {
    // Add document code to uploading set
    setUploadingIndividualDocuments(
      (prev) => new Set([...prev, documentObj.code])
    );

    try {
      const blob = await downloadDocument(documentObj.file, documentObj.code);
      const formData = new FormData();

      // Get file extension from the document file URL
      const fileExtension = documentObj.file.split(".").pop();
      const fileName = `${id}_${runId}_${documentObj.code}.${fileExtension}`;

      const file = new File([blob], fileName, {
        type: blob.type || "application/octet-stream",
      });

      // Use the correct field names that GeoNode documents API expects
      formData.append("doc_file", file);
      formData.append(
        "title",
        documentObj.label || `Document ${documentObj.code}`
      );
      formData.append(
        "abstract",
        documentObj.description || "No description provided"
      );
      formData.append("extension", fileExtension);
      formData.append("metadata_only", "false");

      // Get CSRF token with multiple fallbacks (using global document object)
      const csrftoken =
        document.querySelector("[name=csrfmiddlewaretoken]")?.value ||
        document
          .querySelector("meta[name=csrf-token]")
          ?.getAttribute("content") ||
        $('[name="csrfmiddlewaretoken"]').attr("value");

      const headers = new Headers();
      if (csrftoken) {
        headers.set("X-CSRFToken", csrftoken);
      }
      // Don't set Content-Type - let browser set it automatically for FormData

      const response = await fetch("/api/v2/documents/", {
        credentials: "include",
        body: formData,
        headers: headers,
        method: "POST",
      });

      if (response.ok) {
        toast.success(`Document "${documentObj.label}" uploaded successfully!`);
      } else {
        const errorText = await response.text();
        console.error("Upload response:", response.status, errorText);
        console.error("Full response:", response);

        // Try to parse error response as JSON for better error messages
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) {
            errorMessage = errorJson.detail;
          } else if (errorJson.errors) {
            errorMessage = Array.isArray(errorJson.errors)
              ? errorJson.errors.join(", ")
              : errorJson.errors;
          }
        } catch (e) {
          // Keep original error text if not JSON
        }

        throw new Error(
          `Upload failed with status ${response.status}: ${errorMessage}`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Failed to upload document "${documentObj.label}": ${error.message}`
      );
    } finally {
      // Remove document code from uploading set
      setUploadingIndividualDocuments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentObj.code);
        return newSet;
      });
    }
  }

  return (
    <div className="mt-4">
      {isLoading && !data && <Spinner animation="border" size="sm" />}
      {isError && (
        <p className="text-danger">
          {String(error?.data?.message || error?.error || "Request failed")}
        </p>
      )}
      {isSuccess && (
        <>
          <Card className="my-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h2>
                  <i className="fa fa-tasks me-2"></i>
                  {data.data.label ||
                    `Run ${moment(data.data.created).format(
                      "DD/MM/YYYY HH:mm"
                    )}`}
                  <Badge pill className="ms-1">
                    {STATUS(data.data.runstatus)}
                  </Badge>
                </h2>
                <div className="d-flex">
                  <Button
                    className="mx-2"
                    as={Link}
                    to={`/casestudies/${id}/runs/`}
                    variant="secondary"
                  >
                    Back
                  </Button>
                  {data.data.is_owner && (
                    <EditCasestudyRun
                      id={id}
                      initialValues={data.data}
                      runId={runId}
                      btnProps={{ className: "mx-2" }}
                    />
                  )}
                  {data.data.is_owner && (
                    <DeleteCasestudyRun
                      id={id}
                      runId={runId}
                      btnProps={{ className: "mx-2", variant: "danger" }}
                    />
                  )}
                </div>
              </div>
              <div className="new-fs-5 ps-4">
                <p>
                  <i className="fa fa-user me-2"></i>
                  {ownerRender(data.data.owner)}
                  <br />
                  <i className="fa fa-eye me-2"></i>
                  {VISIBILITY(data.data.visibility)}
                  <br />
                  <i className="fa fa-calendar-o me-2"></i>Created at{" "}
                  {moment(data.data.created).format("DD/MM/YYYY HH:mm")}
                  <br />
                  <i className="fa fa-calendar-plus-o me-2"></i>Last updated at{" "}
                  {moment(data.data.updated).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>

              {data.data.description && (
                <div className="new-fs-5 ps-4">
                  <LinkItUrl>
                    <p>{data.data.description}</p>
                  </LinkItUrl>
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
                images={image ? [{ src: image }] : []}
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
                    <h3>
                      <i className="fa fa-map-o me-2"></i> Layers{" "}
                      <Badge pill>{data.data.outputlayers.length}</Badge>
                    </h3>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row md={4}>
                      {data.data.outputlayers.map((l) => (
                        <Col key={l.code} className="my-2">
                          <Card>
                            <Ratio aspectRatio="1x1">
                              <Card.Img
                                src={l.thumbnail}
                                onClick={() => setImage(l.thumbnail)}
                              />
                            </Ratio>
                            <Card.Body>
                              <div className="h3 card-title">{l.label}</div>
                              <p className="fw-light new-fs-5">
                                {l.description || "No description provided"}
                              </p>
                              <p>
                                <Badge bg="secondary">{l.code}</Badge>
                              </p>
                              <div className="d-flex gap-2">
                                <Button
                                  as="a"
                                  href={l.file}
                                  target="_blank"
                                  download
                                >
                                  <i className="fa fa-download"></i> Download
                                </Button>
                                {data.data.is_owner && (
                                  <Button
                                    variant="primary"
                                    onClick={() => uploadSingleLayer(l)}
                                    disabled={uploadingIndividualLayers.has(
                                      l.code
                                    )}
                                  >
                                    <i className="fa fa-upload"></i> Upload
                                    {uploadingIndividualLayers.has(l.code) && (
                                      <Spinner
                                        animation="border"
                                        size="sm"
                                        className="ms-1"
                                      />
                                    )}
                                  </Button>
                                )}
                              </div>
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
                    <h3>
                      <i className="fa fa-files-o me-2"></i>Documents{" "}
                      <Badge pill>{data.data.outputs.length}</Badge>
                    </h3>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row md={4}>
                      {data.data.outputs.map((l) => (
                        <Col key={l.file} className="my-2">
                          <Card>
                            <Ratio aspectRatio="1x1">
                              <Card.Img
                                src={l.thumbnail}
                                onClick={() => setImage(l.thumbnail)}
                              />
                            </Ratio>
                            <Card.Body>
                              <div className="h3 card-title">{l.label}</div>
                              <p className="fw-light new-fs-5">
                                {l.description || "No description provided"}
                              </p>
                              <p>
                                <Badge bg="secondary">{l.code}</Badge>
                              </p>
                              <div className="d-flex gap-2">
                                <Button
                                  as="a"
                                  href={l.file}
                                  target="_blank"
                                  download
                                >
                                  <i className="fa fa-download"></i> Download
                                </Button>
                                {data.data.is_owner && (
                                  <Button
                                    variant="primary"
                                    onClick={() => uploadSingleDocument(l)}
                                    disabled={uploadingIndividualDocuments.has(
                                      l.code
                                    )}
                                  >
                                    <i className="fa fa-upload"></i> Upload
                                    {uploadingIndividualDocuments.has(
                                      l.code
                                    ) && (
                                      <Spinner
                                        animation="border"
                                        size="sm"
                                        className="ms-1"
                                      />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <div className="mt-5">
                <h3>
                  <i className="me-2 fa fa-share-alt"></i>Share
                </h3>
                <Form.Control
                  as="textarea"
                  value={location.href}
                  readOnly
                  disabled
                  rows={2}
                  cols={50}
                  size="lg"
                />
                <div className="mt-3 d-flex align-items-center">
                  <CopyToClipboard
                    text={location.href}
                    onCopy={() => setCopied(true)}
                  >
                    <Button className="me-3 my-2">
                      <i className="fa fa-copy me-2"></i>Copy to clipboard
                    </Button>
                  </CopyToClipboard>
                  <Toast
                    onClose={() => setCopied(false)}
                    animation={false}
                    show={copied}
                    className=""
                    delay={3000}
                    autohide
                  >
                    <Toast.Body>Copied to clipboard</Toast.Body>
                  </Toast>
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
