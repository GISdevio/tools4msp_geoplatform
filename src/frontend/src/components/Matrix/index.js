import React, { useState, useMemo } from "react";
import { Table, Form, Button, Spinner, Dropdown } from "react-bootstrap";
import { ErrorBoundary } from "react-error-boundary";
import { Formik } from "formik";
import classnames from "classnames";
import Trigger from "../Tooltip";

// Add custom styles for multiselect dropdown
const multiselectStyles = `
  .dropdown-item-no-hover:hover {
    background-color: inherit !important;
  }
  .dropdown-item-no-hover:focus {
    background-color: inherit !important;
  }
`;

// Inject styles only once
if (
  typeof document !== "undefined" &&
  !document.getElementById("multiselect-styles")
) {
  const styleElement = document.createElement("style");
  styleElement.id = "multiselect-styles";
  styleElement.textContent = multiselectStyles;
  document.head.appendChild(styleElement);
}

function Wrapper({
  type = "number",
  options,
  handleChange,
  handleBlur,
  field,
  editable = true,
  ...props
}) {
  if (type === "select") {
    return (
      <Trigger content={field}>
        <Form.Select {...props} onChange={handleChange} onBlur={handleBlur}>
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Form.Select>
      </Trigger>
    );
  }

  if (type === "multiselect") {
    const selectedValues = props.value ? props.value.split(",") : [];

    const handleMultiSelectChange = (optionValue) => {
      let newValues;
      if (selectedValues.includes(optionValue)) {
        // Remove the value
        newValues = selectedValues.filter((v) => v !== optionValue);
      } else {
        // Add the value
        newValues = [...selectedValues, optionValue];
      }

      // Call the original handleChange with the comma-separated string
      const event = {
        target: {
          name: props.name,
          value: newValues.join(","),
        },
      };
      handleChange(event);
    };

    const displayText =
      selectedValues.length > 0
        ? selectedValues.length === 1
          ? (() => {
              const option = options.find(
                ([optVal]) => optVal === selectedValues[0]
              );
              return option ? option[1] : selectedValues[0];
            })()
          : `${selectedValues.length} selected`
        : "Select...";

    return (
      <Trigger content={field}>
        <Dropdown style={{ width: "100%" }} drop="auto" autoClose="outside">
          <Dropdown.Toggle
            as="div"
            className="form-select form-select-sm"
            style={{
              width: "100%",
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {displayText}
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 10000,
              width: "200px",
              position: "absolute",
            }}
            flip={true}
          >
            {options.map(([v, l]) => (
              <Dropdown.Item
                key={v}
                onClick={(e) => {
                  e.preventDefault();
                  handleMultiSelectChange(v);
                }}
                style={{
                  cursor: "pointer",
                }}
                className="dropdown-item-no-hover"
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    id={`${props.name}-${v}`}
                    checked={selectedValues.includes(v)}
                    onChange={() => {}} // Handled by dropdown click
                    style={{ pointerEvents: "none", margin: 0 }}
                  />
                  <label
                    htmlFor={`${props.name}-${v}`}
                    style={{
                      pointerEvents: "none",
                      margin: 0,
                      flex: 1,
                      cursor: "pointer",
                    }}
                  >
                    {l}
                  </label>
                </div>
              </Dropdown.Item>
            ))}
            {selectedValues.length > 0 && (
              <>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={(e) => {
                    e.preventDefault();
                    const event = {
                      target: {
                        name: props.name,
                        value: "",
                      },
                    };
                    handleChange(event);
                  }}
                  className="text-danger dropdown-item-no-hover"
                >
                  Clear All
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Trigger>
    );
  }

  if (type === "text") {
    return (
      <Trigger content={field}>
        <Form.Control
          {...props}
          type="text"
          readOnly={!editable}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Trigger>
    );
  }

  return (
    <Trigger content={field}>
      <Form.Control
        {...props}
        type={type}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Trigger>
  );
}

function TdContent({
  c,
  r,
  index,
  x,
  y,
  formValues,
  handleChange,
  matrixValues,
  handleBlur,
  setFocusedKey,
  separators,
  editable,
  extra,
}) {
  const name = `${x}${separators.secondary}${c}${separators.main}${y}${separators.secondary}${r}`;

  const extraProps = useMemo(() => extra[name] || {}, [extra, name]);

  if (!formValues[name]) {
    return null;
  }

  return (
    <>
      {matrixValues.map((v) => {
        // Extract parameter name from the cell name
        // Name format: "param$PARAMETER_NAME#layer$LAYER_NAME"
        let actualParam = v; // default to the matrix value

        if (name && typeof name === "string") {
          // Split by main separator (#) and get the first part
          const firstPart = name.split("#")[0];
          if (firstPart && firstPart.includes("$")) {
            // Split by secondary separator ($) and get the part after "param$"
            const parts = firstPart.split("$");
            if (parts.length >= 2 && parts[0] === "param") {
              actualParam = parts[1];
            }
          }
        }

        return (
          <Wrapper
            {...extraProps}
            disabled={!editable}
            key={v}
            field={actualParam}
            name={`${name}.${v}`}
            value={formValues[name][v]}
            className="my-1"
            style={{ minWidth: "6em" }}
            handleChange={handleChange}
            handleBlur={handleBlur}
            onFocus={() => setFocusedKey([c, r])}
          />
        );
      })}
    </>
  );
}

function Toolbar({
  isSubmitting,
  cols = [],
  rows = [],
  visibleColumns,
  setVisibleColumns,
  drop = "down",
}) {
  const params = useMemo(
    () => Array.from(new Set([...cols, ...rows])),
    [cols, rows]
  );

  const toggleElement = (element) =>
    visibleColumns.includes(element)
      ? setVisibleColumns(visibleColumns.filter((e) => e !== element))
      : setVisibleColumns([...visibleColumns, element]);

  return (
    <div className="my-2 d-flex justify-content-end">
      <Dropdown className="mx-2" drop={drop} align="end">
        <Dropdown.Toggle variant="light" id="dropdown-basic" size="lg">
          <i className="fa fa-eye" /> Shown Params
        </Dropdown.Toggle>

        <Dropdown.Menu className="py-0">
          <div
            className="overflow-auto pe-5 px-2 pt-2"
            style={{ maxHeight: "300px" }}
          >
            {params.map((element) => (
              <Form.Check
                key={element}
                name={element}
                checked={visibleColumns.includes(element)}
                label={element}
                onChange={() => toggleElement(element)}
                type="checkbox"
              />
            ))}
          </div>
        </Dropdown.Menu>
      </Dropdown>
      <Button type="submit" size="lg" className="mx-2" disabled={isSubmitting}>
        {isSubmitting && (
          <Spinner animation="border" className="mr-2" size="sm" />
        )}
        Save
      </Button>
    </div>
  );
}

const RIGHT_BORDER_STYLE = {
  borderRightColor: "black",
  borderRightWidth: "2px",
};

export default function Matrix({
  cols,
  rows,
  values: matrixValues,
  index,
  x,
  y,
  extra,
  isUpdating,
  update,
  separators,
  visibleCodes,
  editable,
  fetchContent,
}) {
  const [focusedKey, setFocusedKey] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(visibleCodes);
  const toolbar = useMemo(
    () => (
      <Toolbar
        isSubmitting={isUpdating}
        cols={cols}
        rows={rows}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
      />
    ),
    [cols, rows, visibleColumns, isUpdating]
  );
  return (
    <div>
      <Formik
        initialValues={index}
        onSubmit={(formResult) => update(formResult)}
      >
        {({ handleSubmit, handleChange, handleBlur, errors, values }) => (
          <Form noValidate onSubmit={handleSubmit}>
            {toolbar}
            <Table responsive bordered>
              <thead>
                <tr>
                  <th style={RIGHT_BORDER_STYLE}></th>
                  {cols
                    .filter((c) => visibleColumns.includes(c))
                    .map((c) => (
                      <th
                        key={c}
                        className={classnames("text-center", {
                          "bg-highlight": focusedKey[0] == c,
                        })}
                      >
                        <Trigger content={fetchContent(c)}>{c}</Trigger>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) => visibleColumns.includes(r))
                  .map((r) => (
                    <tr key={r}>
                      <td
                        className={classnames("text-center fw-bold", {
                          "bg-highlight": focusedKey[1] == r,
                        })}
                        style={RIGHT_BORDER_STYLE}
                      >
                        <Trigger content={fetchContent(r)}>{r}</Trigger>
                      </td>
                      {cols
                        .filter((c) => visibleColumns.includes(c))
                        .map((c) => (
                          <td
                            key={`${x}${c}#${y}${r}`}
                            className={classnames({
                              "bg-highlight":
                                focusedKey[0] == c || focusedKey[1] == r,
                            })}
                          >
                            <ErrorBoundary fallbackRender={() => <>Error</>}>
                              <TdContent
                                matrixValues={matrixValues}
                                c={c}
                                r={r}
                                index={index}
                                x={x}
                                y={y}
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                formValues={values}
                                setFocusedKey={setFocusedKey}
                                separators={separators}
                                editable={editable}
                                extra={extra}
                              />
                            </ErrorBoundary>
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Form>
        )}
      </Formik>
    </div>
  );
}
