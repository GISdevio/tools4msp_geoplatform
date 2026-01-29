import { Formik } from "formik";
import React, { useEffect } from "react";
import { Breadcrumb, Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormTextField from "../../../components/FormTextField";
import { useCreateGeodatabuilderMutation } from "../../../services/geodatabuilder";

const FORM_VALIDATION = (values) => {
  const errors = {};
  if (!values.label) {
    errors.label = "Required";
  }
  if (!values.desc_expression) {
    errors.desc_expression = "Required";
  }
  return errors;
};

export default function CreateGeodatabuilder() {
  const [create, { isLoading, isSuccess, data }] =
    useCreateGeodatabuilderMutation();
  let [searchParams] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess && !data.error) {
      window.IFRAME_WIZARD_GEODATABUILDER = !!searchParams.get("iframe");
      navigate(`/geodatabuilders/${data.geo_data_builder.id}/`);
    }
  }, [isSuccess, searchParams]);

  return (
    <Container className="create-geo-data-builder">
      <h1 className="">Create Geodatabuilder</h1>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/geodatabuilders/" }}>
          All Geodatabuilders
        </Breadcrumb.Item>
        <Breadcrumb.Item active>create</Breadcrumb.Item>
      </Breadcrumb>
      <Formik onSubmit={create} validate={FORM_VALIDATION} initialValues={{}}>
        {({ handleSubmit, isValid }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <FormTextField name="label" label="Label" />
            <FormTextField
              name="desc_expression"
              label="Description"
              controlAs="textarea"
              wrapped={{ style: { height: 80 } }}
            />
            <div className="mt-4">
              <Button
                type="submit"
                className="create-geo-data-builder"
                size="lg"
                disabled={isLoading || !isValid}
              >
                Next
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Container>
  );
}
