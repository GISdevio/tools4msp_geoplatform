import React, { useState } from "react";
import { Alert, Button, Form, Collapse, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useUploadInputMutation } from "../../../../services/casestudies";
import getIdFromUrl from "../../../../libs/getIdFromUrl";

const VALID_TYPES = ["application/json", "text/json"];

// CODE_MAP from backend - defines expected JSON structure for each input type
const CODE_MAP = {
  "LAYER-WEIGHTS": {
    x: "param",
    y: "layer",
    v: ["weight"],
  },
  WEIGHTS: {
    x: "p",
    y: "u",
    v: ["w", "d"],
  },
  "PRESSURE-WEIGHTS": {
    x: "use",
    y: "pressure",
    v: ["weight", "distance"],
  },
  PCONFLICT: {
    x: "u1",
    y: "u2",
    v: ["score"],
    square: true,
  },
  SENS: {
    x: "p",
    y: "e",
    v: ["s"],
  },
  SENSITIVITIES: {
    x: "env",
    y: "pressure",
    v: ["sensitivity", "impact_level", "recovery_time"],
  },
  "PMAR-CONF": {
    y: "paramname",
    x: "paramtype",
    v: ["value"],
  },
};

export default function JsonUpload({
  id,
  inputId,
  data = [],
  matrixConfig,
  currentMatrix,
}) {
  const [key, setKey] = useState(0);
  const [file, setFile] = useState(null);
  const [selectedInput, setSelectedInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [upload, { isLoading }] = useUploadInputMutation();

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setValidationError(""); // Clear any previous validation errors
    }
  };

  const validateJsonStructure = (jsonData, inputCode) => {
    const expectedStructure = CODE_MAP[inputCode];
    if (!expectedStructure) {
      return { valid: false, error: `Unknown input type: ${inputCode}` };
    }

    const { x, y, v } = expectedStructure;

    // Check if ALL items have required x and y fields
    // But be flexible about value fields - allow mixed data types
    for (const item of jsonData) {
      // Check x and y fields (these are required for matrix structure)
      if (!item.hasOwnProperty(x)) {
        return {
          valid: false,
          error: `Missing required field '${x}' for ${inputCode}`,
        };
      }
      if (!item.hasOwnProperty(y)) {
        return {
          valid: false,
          error: `Missing required field '${y}' for ${inputCode}`,
        };
      }
    }

    // Check if at least SOME items have the expected value fields
    // This allows for mixed data types in the same JSON file
    const itemsWithExpectedValues = jsonData.filter((item) =>
      v.some((field) => item.hasOwnProperty(field))
    );

    if (itemsWithExpectedValues.length === 0) {
      return {
        valid: false,
        error: `No items found with expected value fields. Expected at least one item with: ${v.join(
          ", "
        )}`,
      };
    }

    return { valid: true };
  };

  const processJsonToMatrix = (jsonContent, inputCode) => {
    // Parse JSON content
    let jsonData;
    try {
      jsonData = JSON.parse(jsonContent);
    } catch (error) {
      throw new Error("Invalid JSON format");
    }

    if (!Array.isArray(jsonData)) {
      throw new Error("JSON must be an array of objects");
    }

    // Validate JSON structure matches the expected input type
    const validation = validateJsonStructure(jsonData, inputCode);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get the expected structure from CODE_MAP
    const expectedStructure = CODE_MAP[inputCode];
    const { x, y, v: values } = expectedStructure;

    // Build matrix structure
    const cols = [
      ...new Set(
        jsonData
          .map((item) => item && item[x])
          .filter((val) => val !== undefined && val !== null && val !== "")
      ),
    ];

    const rows = [
      ...new Set(
        jsonData
          .map((item) => item && item[y])
          .filter((val) => val !== undefined && val !== null && val !== "")
      ),
    ];

    const index = {};
    const extra = {};

    jsonData.forEach((item) => {
      if (!item || typeof item !== "object") {
        return;
      }

      const colVal = item[x];
      const rowVal = item[y];

      if (colVal && rowVal) {
        const id = `${x}$${colVal}#${y}$${rowVal}`;

        // Regular data
        index[id] = {};
        values.forEach((v) => {
          if (item[v] !== undefined) {
            index[id][v] = item[v];
          }
        });

        // Extra properties (starting with _)
        const extraProps = {};
        Object.keys(item).forEach((key) => {
          if (key.startsWith("_")) {
            extraProps[key.substring(1)] = item[key];
          }
        });

        if (Object.keys(extraProps).length > 0) {
          extra[id] = extraProps;
        }
      }
    });

    return {
      x,
      y,
      cols,
      rows,
      values,
      index,
      extra,
    };
  };

  // Get selected input data for rendering
  const selectedInputData = selectedInput
    ? data.find((input) => getIdFromUrl(input.url) === selectedInput)
    : null;
  const expectedStructure = selectedInputData?.code
    ? CODE_MAP[selectedInputData.code]
    : null;

  // Convert current matrix back to JSON format for export
  const convertMatrixToJson = (matrix, inputCode) => {
    if (!matrix || !matrix.index || !inputCode) {
      return [];
    }

    const expectedStructure = CODE_MAP[inputCode];
    if (!expectedStructure) {
      return [];
    }

    const { x, y, v: values } = expectedStructure;
    const jsonArray = [];

    // Iterate through the matrix index to reconstruct JSON objects
    Object.keys(matrix.index).forEach((cellId) => {
      const cellData = matrix.index[cellId];

      // Parse the cell ID to extract x and y values
      // Cell ID format: "param$PARAM_VALUE#layer$LAYER_VALUE"
      const parts = cellId.split("#");
      if (parts.length === 2) {
        const xPart = parts[0]; // "param$PARAM_VALUE"
        const yPart = parts[1]; // "layer$LAYER_VALUE"

        const xValue = xPart.split("$")[1]; // Extract PARAM_VALUE
        const yValue = yPart.split("$")[1]; // Extract LAYER_VALUE

        if (xValue && yValue) {
          const jsonObject = {
            [x]: xValue,
            [y]: yValue,
          };

          // Add value fields
          values.forEach((valueField) => {
            if (cellData[valueField] !== undefined) {
              jsonObject[valueField] = cellData[valueField];
            }
          });

          // Add extra properties (prefixed with _)
          if (matrix.extra && matrix.extra[cellId]) {
            Object.keys(matrix.extra[cellId]).forEach((extraKey) => {
              jsonObject[`_${extraKey}`] = matrix.extra[cellId][extraKey];
            });
          }

          // Only add objects that have at least one value field
          const hasValues = values.some(
            (valueField) =>
              cellData[valueField] !== undefined &&
              cellData[valueField] !== null &&
              cellData[valueField] !== ""
          );

          if (hasValues) {
            jsonArray.push(jsonObject);
          }
        }
      }
    });

    return jsonArray;
  };

  // Handle export JSON functionality
  const handleExportJson = () => {
    if (!selectedInput) {
      toast.error("Please select an input to export");
      return;
    }

    try {
      // Get the selected input's code and matrix data
      const selectedInputInfo = data.find(
        (input) => input && getIdFromUrl(input.url) === selectedInput
      );

      if (!selectedInputInfo) {
        toast.error("Selected input not found");
        return;
      }

      if (!selectedInputInfo.code) {
        toast.error("Could not determine input type");
        return;
      }

      // Use currentMatrix if available, otherwise fall back to selectedInputInfo.matrix
      const matrixToExport = currentMatrix || selectedInputInfo.matrix;

      if (!matrixToExport || !matrixToExport.index) {
        toast.error("No matrix data available to export");
        return;
      }

      // Convert matrix to JSON format
      const jsonData = convertMatrixToJson(
        matrixToExport,
        selectedInputInfo.code
      );

      if (jsonData.length === 0) {
        toast.warning("No data found to export");
        return;
      }

      // Create and download the JSON file
      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedInputInfo.code}_export_${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      toast.success(`Exported ${jsonData.length} records to JSON file`);
    } catch (error) {
      console.error("Export JSON Error:", error);
      toast.error(`Export failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (!selectedInput) {
      toast.error("Please select an input to upload to");
      return;
    }

    try {
      if (!data || !Array.isArray(data)) {
        throw new Error("No input data available");
      }

      // Get the selected input's code
      const selectedInputInfo = data.find(
        (input) => input && getIdFromUrl(input.url) === selectedInput
      );

      if (!selectedInputInfo) {
        throw new Error("Selected input not found");
      }

      if (!selectedInputInfo.code) {
        throw new Error("Could not determine input type");
      }

      // Read file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });

      // Process and validate JSON to matrix format
      const newMatrixData = processJsonToMatrix(
        fileContent,
        selectedInputInfo.code
      );

      // Validate that newMatrixData has required structure
      if (!newMatrixData || typeof newMatrixData !== "object") {
        throw new Error("Invalid matrix data generated from JSON");
      }

      // Get existing matrix data to merge with - use the current detailed matrix data
      let existingMatrix = {};
      try {
        // Use currentMatrix if available (most up-to-date), otherwise fall back to finding in data
        if (currentMatrix) {
          existingMatrix = currentMatrix;
        } else {
          existingMatrix = selectedInputInfo?.matrix || {};
        }
      } catch (error) {
        console.warn("Error accessing existing matrix:", error);
        existingMatrix = {};
      }

      // Ensure we have proper structure even if matrix is empty/undefined
      const safeExistingMatrix = {
        index:
          existingMatrix && existingMatrix.index ? existingMatrix.index : {},
        extra:
          existingMatrix && existingMatrix.extra ? existingMatrix.extra : {},
        cols:
          existingMatrix && Array.isArray(existingMatrix.cols)
            ? existingMatrix.cols
            : [],
        rows:
          existingMatrix && Array.isArray(existingMatrix.rows)
            ? existingMatrix.rows
            : [],
        x:
          existingMatrix && existingMatrix.x
            ? existingMatrix.x
            : newMatrixData && newMatrixData.x
            ? newMatrixData.x
            : "x",
        y:
          existingMatrix && existingMatrix.y
            ? existingMatrix.y
            : newMatrixData && newMatrixData.y
            ? newMatrixData.y
            : "y",
        values:
          existingMatrix && Array.isArray(existingMatrix.values)
            ? existingMatrix.values
            : newMatrixData && Array.isArray(newMatrixData.values)
            ? newMatrixData.values
            : [],
        separators:
          existingMatrix && existingMatrix.separators
            ? existingMatrix.separators
            : { main: "#", secondary: "$" },
      };

      // Merge the new data with existing data - update existing cells AND create new cells for existing coordinates
      const mergedIndex = { ...safeExistingMatrix.index };

      // Only update/create cells where BOTH the row and column already exist in the matrix
      if (newMatrixData.index && typeof newMatrixData.index === "object") {
        Object.keys(newMatrixData.index).forEach((cellId) => {
          // Parse the cell ID to get the column and row values
          // Cell ID format: "param$PARAM_VALUE#layer$LAYER_VALUE"
          const parts = cellId.split("#");
          if (parts.length === 2) {
            const paramPart = parts[0]; // "param$PARAM_VALUE"
            const layerPart = parts[1]; // "layer$LAYER_VALUE"

            const paramValue = paramPart.split("$")[1]; // Extract PARAM_VALUE
            const layerValue = layerPart.split("$")[1]; // Extract LAYER_VALUE

            // Check if both the column (paramValue) and row (layerValue) exist in the existing matrix
            const columnExists = safeExistingMatrix.cols.includes(paramValue);
            const rowExists = safeExistingMatrix.rows.includes(layerValue);

            if (columnExists && rowExists) {
              // Either update existing cell or create new cell for existing coordinates
              mergedIndex[cellId] = {
                ...mergedIndex[cellId], // Keep existing values (empty object if cell didn't exist)
                ...newMatrixData.index[cellId], // Add/override with new values
              };
            }
          }
        });
      }

      // Keep existing extra data, and add extra data for new cells with existing coordinates
      const mergedExtra = { ...safeExistingMatrix.extra };
      if (newMatrixData.extra && typeof newMatrixData.extra === "object") {
        Object.keys(newMatrixData.extra).forEach((cellId) => {
          // Parse the cell ID to check if coordinates exist
          const parts = cellId.split("#");
          if (parts.length === 2) {
            const paramValue = parts[0].split("$")[1];
            const layerValue = parts[1].split("$")[1];

            const columnExists = safeExistingMatrix.cols.includes(paramValue);
            const rowExists = safeExistingMatrix.rows.includes(layerValue);

            if (columnExists && rowExists) {
              // Add/update extra data for cells with existing coordinates
              mergedExtra[cellId] = {
                ...mergedExtra[cellId],
                ...newMatrixData.extra[cellId],
              };
            }
          }
        });
      }

      // Keep existing structure - DO NOT add new columns or rows
      const mergedCols = Array.isArray(safeExistingMatrix.cols)
        ? safeExistingMatrix.cols
        : [];
      const mergedRows = Array.isArray(safeExistingMatrix.rows)
        ? safeExistingMatrix.rows
        : [];

      // Prepare upload data with extra validation
      const uploadData = {
        id,
        inputId: selectedInput,
        x: safeExistingMatrix.x || "param",
        y: safeExistingMatrix.y || "layer",
        values:
          Array.isArray(safeExistingMatrix.values) &&
          safeExistingMatrix.values.length > 0
            ? safeExistingMatrix.values
            : ["weight"],
        cols:
          Array.isArray(mergedCols) && mergedCols.length > 0 ? mergedCols : [],
        rows:
          Array.isArray(mergedRows) && mergedRows.length > 0 ? mergedRows : [],
        separators: safeExistingMatrix.separators || {
          main: "#",
          secondary: "$",
        },
        index: mergedIndex || {},
        extra: mergedExtra || {},
      };

      // Final validation before upload
      if (!Array.isArray(uploadData.cols)) {
        uploadData.cols = [];
      }
      if (!Array.isArray(uploadData.rows)) {
        uploadData.rows = [];
      }
      if (!Array.isArray(uploadData.values)) {
        uploadData.values = ["weight"];
      }

      const res = await upload(uploadData);

      if (res.data) {
        setKey(key + 1);
        setFile(null);

        // Check if we uploaded to the currently displayed input
        if (selectedInput === inputId) {
          toast.success("JSON data uploaded successfully - matrix updated");
        } else {
          toast.success(
            "JSON data uploaded successfully - navigate to the uploaded input to see changes"
          );
        }
      }
      if (res.error) {
        toast.error(
          "An error occurred during upload: " +
            (res.error.data?.error?.message ||
              res.error.message ||
              "Unknown error")
        );
      }
    } catch (error) {
      console.error("JSON Upload Error Details:", {
        error: error,
        message: error.message,
        stack: error.stack,
        selectedInput,
        data,
        file: file
          ? { name: file.name, type: file.type, size: file.size }
          : null,
      });

      const errorMessage = error.message || "Unknown error occurred";
      setValidationError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  try {
    return (
      <div className="mb-4">
        <Card>
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{
              cursor: "pointer",
              outline: "none",
              border: "none",
            }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            onFocus={(e) => e.target.blur()}
          >
            <h5 className="mb-0 fw-bold">Upload JSON Input Data</h5>
            <Button
              variant="link"
              className="p-0 text-decoration-none"
              style={{
                outline: "none",
                border: "none",
                boxShadow: "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.target.blur();
                setIsCollapsed(!isCollapsed);
              }}
              onFocus={(e) => e.target.blur()}
            >
              {isCollapsed ? "▼" : "▲"}
            </Button>
          </Card.Header>
          <Collapse in={!isCollapsed} timeout={300}>
            <div>
              <Card.Body>
                <Form noValidate onSubmit={handleSubmit}>
                  <div className="row align-items-start">
                    <div className="col-md-8">
                      {data && Array.isArray(data) && data.length > 0 && (
                        <Form.Select
                          value={selectedInput}
                          onChange={(e) => {
                            setSelectedInput(e.target.value);
                            setValidationError(""); // Clear validation error when changing input
                          }}
                          className="mb-2"
                          style={{
                            outline: "none",
                            boxShadow: "none",
                          }}
                          onFocus={(e) => {
                            e.target.style.outline = "none";
                            e.target.style.boxShadow =
                              "0 0 0 0.2rem rgba(0,123,255,.25)";
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          <option value="">
                            Select an input to upload to...
                          </option>
                          {data
                            .filter((input) => input?.code !== "CS-THUMB") // Filter out thumbnail
                            .map((input, index) => {
                              if (!input) return null;

                              const urlId = input.url
                                ? getIdFromUrl(input.url)
                                : input.code || "";
                              const displayText =
                                input.code || `Input ${index}`;
                              const labelText = input?.label
                                ? ` - ${input.label}`
                                : "";

                              return (
                                <option key={input.code || index} value={urlId}>
                                  {displayText}
                                  {labelText}
                                </option>
                              );
                            })
                            .filter(Boolean)}
                        </Form.Select>
                      )}

                      <Form.Control
                        key={key}
                        type="file"
                        accept=".json,application/json,text/json"
                        onChange={handleFileChange}
                        className="mb-2"
                        style={{
                          outline: "none",
                          boxShadow: "none",
                        }}
                        onFocus={(e) => {
                          e.target.style.outline = "none";
                          e.target.style.boxShadow =
                            "0 0 0 0.2rem rgba(0,123,255,.25)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = "none";
                        }}
                      />
                      <Form.Text className="text-muted d-block">
                        Upload a JSON array with matrix data. Existing cells
                        will be updated and new cells will be created for
                        existing coordinates (param/layer combinations). No new
                        rows or columns will be added. Use underscore-prefixed
                        attributes (like _type, _options) for input
                        customization. Use "Export JSON" to download the current
                        matrix data in the same format.
                      </Form.Text>

                      {file &&
                        !VALID_TYPES.includes(file.type) &&
                        !file.name.endsWith(".json") && (
                          <Alert
                            variant="warning"
                            transition={null}
                            className="mt-2"
                          >
                            <small>
                              Unsupported file type, please upload a JSON file
                            </small>
                          </Alert>
                        )}

                      {validationError && (
                        <Alert
                          variant="danger"
                          transition={null}
                          className="mt-2"
                        >
                          <small>
                            <strong>Validation Error:</strong> {validationError}
                          </small>
                        </Alert>
                      )}
                    </div>

                    <div className="col-md-4 d-flex flex-column align-items-end gap-2">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={
                          !file ||
                          !selectedInput ||
                          isLoading ||
                          (file &&
                            !VALID_TYPES.includes(file.type) &&
                            !file.name.endsWith(".json"))
                        }
                        className="px-4"
                        style={{
                          outline: "none",
                          boxShadow: "none",
                          cursor:
                            !file ||
                            !selectedInput ||
                            isLoading ||
                            (file &&
                              !VALID_TYPES.includes(file.type) &&
                              !file.name.endsWith(".json"))
                              ? "not-allowed"
                              : "pointer",
                          pointerEvents: "auto",
                        }}
                        onFocus={(e) => e.target.blur()}
                      >
                        {isLoading ? "Uploading..." : "Upload JSON"}
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        disabled={!selectedInput}
                        className="px-4"
                        style={{
                          outline: "none",
                          boxShadow: "none",
                          cursor: !selectedInput ? "not-allowed" : "pointer",
                          pointerEvents: "auto",
                        }}
                        onFocus={(e) => e.target.blur()}
                        onClick={handleExportJson}
                      >
                        Export JSON
                      </Button>
                    </div>
                  </div>
                </Form>
              </Card.Body>
            </div>
          </Collapse>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error rendering JsonUpload component:", error);
    return (
      <div className="mb-4 p-3 border rounded bg-danger text-white">
        <h5>Error Loading Upload Component</h5>
        <p>
          There was an error loading the JSON upload component. Check the
          console for details.
        </p>
        <pre>{error.message}</pre>
      </div>
    );
  }
}
