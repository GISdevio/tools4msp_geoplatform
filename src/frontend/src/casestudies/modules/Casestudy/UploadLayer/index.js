import React, { useRef, useState } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import SelectField from "../../../../components/SelectField";
import {
  useLazyGetCodedlabelsQuery,
  useUploadLayerMutation,
} from "../../../../services/casestudies";
import { useLazyGetLayersQuery } from "../../../../services/geonode";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import FormTextField from "../../../../components/FormTextField";

// Get attributes
function parseFeatureInfoTemplate(customTemplate) {
  if (!customTemplate) return [];
  const regex = /\$\{properties\['([^']+)'\]\}/g;
  const attributes = new Set();

  let match;
  while ((match = regex.exec(customTemplate)) !== null) {
    attributes.add(match[1]);
  }

  return Array.from(attributes).map((attribute) => ({
    attribute,
  }));
}

export default function UploadLayer({ id, btnProps, label }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  const [allDatasets, setAllDatasets] = useState([]);
  const [datasetsLoaded, setDatasetsLoaded] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const casestudy = useOutletContext();

  const [searchCoded] = useLazyGetCodedlabelsQuery();
  const [upload, { isLoading }] = useUploadLayerMutation();
  const loadCodes = async (search) => {
    const result = await searchCoded(
      `?case_study_id=${casestudy.id}&search=${search}`
    );
    return result.data.data;
  };

  const [searchLayer] = useLazyGetLayersQuery();

  // Load all datasets once and cache them
  const loadAllDatasets = async () => {
    if (!datasetsLoaded) {
      const result = await searchLayer(
        "?search_fields=title&search_fields=abstract&search=&page_size=1000"
      );
      if (result.data && result.data.datasets) {
        setAllDatasets(result.data.datasets);
        setDatasetsLoaded(true);
        return result.data.datasets;
      }
      return [];
    }
    return allDatasets;
  };

  const loadLayers = async (search, mspdfFilter = null) => {
    const currentDatasets = await loadAllDatasets();
    let datasets = [...currentDatasets];

    if (search) {
      datasets = datasets.filter((dataset) => {
        const title = dataset.title?.toLowerCase() || "";
        const abstract = dataset.abstract?.toLowerCase() || "";
        const name = dataset.name?.toLowerCase() || "";
        const searchLower = search.toLowerCase();
        return (
          title.includes(searchLower) ||
          abstract.includes(searchLower) ||
          name.includes(searchLower)
        );
      });
    }

    if (mspdfFilter) {
      datasets = datasets.filter((dataset) => {
        if (dataset.tkeywords && dataset.tkeywords.length > 0) {
          return dataset.tkeywords.some((keyword) => {
            return (
              keyword && keyword.name && keyword.name === mspdfFilter.value
            );
          });
        }
        return false;
      });
    }

    if (!search && !mspdfFilter) {
      return datasets.slice(0, 10);
    }

    return datasets;
  };

  // Load distinct MSPDF values
  const loadMspdfValues = async (search) => {
    const currentDatasets = await loadAllDatasets();

    const mspdfValuesMap = new Map();

    currentDatasets.forEach((dataset) => {
      if (dataset.tkeywords && dataset.tkeywords.length > 0) {
        dataset.tkeywords.forEach((keyword) => {
          if (
            keyword &&
            keyword.name &&
            (keyword.name.toLowerCase().includes("mspdf") ||
              keyword.name.toLowerCase().startsWith("msp"))
          ) {
            if (!mspdfValuesMap.has(keyword.name)) {
              const mspdfValue = {
                label: keyword.i18n?.en || keyword.i18n?.it || keyword.name,
                value: keyword.name,
              };
              mspdfValuesMap.set(keyword.name, mspdfValue);
            }
          }
        });
      }
    });

    const mspdfValues = Array.from(mspdfValuesMap.values());
    return mspdfValues.filter((mspdfValue) =>
      search
        ? mspdfValue.label.toLowerCase().includes(search.toLowerCase())
        : true
    );
  };

  return (
    <div>
      <Button {...btnProps} onClick={handleShow}>
        Upload Dataset
      </Button>
      <div ref={ref}></div>
      <Modal
        show={show}
        container={ref}
        animation={false}
        centered
        onHide={handleClose}
      >
        <Modal.Header>Upload Dataset</Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{}}
            onSubmit={async (values) => {
              const result = await upload({
                id: casestudy.id,
                layer_id: values.layer.pk,
                resolution: casestudy.resolution,
                grid: casestudy.grid,
                attribute: values.attribute ? values.attribute.attribute : null,
                codedlabel: values.code,
                description: values.description,
                mspdf_filter: values.mspdf_filter || null,
              });
              if (result.data) {
                if (result.data.data.success) {
                  handleClose();
                } else {
                  toast(result.data.data.detail);
                }
              }
              if (result.error) {
                toast.error("An error occurred");
              }
            }}
          >
            {({ handleSubmit, values, setFieldValue }) => {
              return (
                <Form noValidate onSubmit={handleSubmit}>
                  <FormTextField label="Description" name="description" />
                  <SelectField
                    name="mspdf_filter"
                    label="MSPDF Filter"
                    loadOptions={loadMspdfValues}
                    getOptionLabel={(v) => v.label}
                    getOptionValue={(v) => v.value}
                    groupClassName="mt-4"
                    isClearable={true}
                    placeholder="Select MSPDF value (optional)"
                    onChange={(value) => {
                      setFieldValue("mspdf_filter", value);
                      setFieldValue("layer", null);
                      setFieldValue("attribute", null);
                    }}
                  />
                  <SelectField
                    name="code"
                    label="Code"
                    loadOptions={loadCodes}
                    getOptionLabel={(v) => v.label}
                    getOptionValue={(v) => v.code}
                    groupClassName="mt-4"
                  />
                  <SelectField
                    name="layer"
                    label="Dataset"
                    loadOptions={(search) =>
                      loadLayers(search, values.mspdf_filter)
                    }
                    getOptionLabel={(v) => v.title || v.name}
                    getOptionValue={(v) => v.pk}
                    groupClassName="mt-4"
                    key={`layer-${values.mspdf_filter?.value || "no-filter"}`}
                  />
                  <SelectField
                    name="attribute"
                    label="Attribute"
                    groupClassName="mt-4"
                    getOptionLabel={(v) => v.attribute}
                    getOptionValue={(v) => v.attribute}
                    options={
                      values.layer && values.layer.featureinfo_custom_template
                        ? parseFeatureInfoTemplate(
                            values.layer.featureinfo_custom_template
                          )
                        : []
                    }
                  />
                  <div className="mt-5">
                    <Button
                      size="lg"
                      type="submit"
                      className="ms-2"
                      disabled={isLoading}
                    >
                      Upload
                      {isLoading && <Spinner className="ms-1" size="sm" />}
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleClose}
                      variant="light"
                      className="ms-2"
                    >
                      Close
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
}
