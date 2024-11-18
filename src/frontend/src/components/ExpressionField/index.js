import React, { useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { Field } from "formik";

const ExpressionField = ({
  as,
  md,
  controlId,
  label,
  name,
  type,
  inputGroupPrepend,
  controlAs,
  wrapped = {},
}) => {
  return (
    <Field
      name={name}
      render={({ field, form }) => {
        const isValid = !form.errors[field.name];
        const isInvalid = form.touched[field.name] && !isValid;
        return (
          <Form.Group as={as} md={md} controlId={controlId}>
            <Form.Label>{label}</Form.Label>
            <InputGroup>
              {inputGroupPrepend}
              <Form.Control
                {...field}
                {...wrapped}
                type={type}
                isValid={form.touched[field.name] && isValid}
                isInvalid={isInvalid}
                as="textarea"
                rows={2}
                style={{ minHeight: 80 }}
              />

              {form.errors[field.name] && (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {form.errors[field.name]}
                </Form.Control.Feedback>
              )}
            </InputGroup>
          </Form.Group>
        );
      }}
    />
  );
};

ExpressionField.defaultProps = {
  type: "text",
  inputGroupPrepend: null
};

export default ExpressionField;