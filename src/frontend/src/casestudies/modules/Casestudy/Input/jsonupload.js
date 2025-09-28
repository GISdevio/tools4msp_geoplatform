import React, { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
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

export default function JsonUpload({ id, inputId, data = [], matrixConfig }) {
  const [key, setKey] = useState(0);
  const [file, setFile] = useState(null);
  const [selectedInput, setSelectedInput] = useState("");
  const [validationError, setValidationError] = useState("");
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
      // Get the selected input's code
      const selectedInputData = data.find(
        (input) => getIdFromUrl(input.url) === selectedInput
      );

      if (!selectedInputData?.code) {
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
      const matrixData = processJsonToMatrix(
        fileContent,
        selectedInputData.code
      );

      // Upload using existing mutation
      const res = await upload({
        id,
        inputId: selectedInput,
        ...matrixData,
      });

      if (res.data) {
        setKey(key + 1);
        setFile(null);
        setSelectedInput("");
        toast.success("JSON file uploaded successfully");
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
      const errorMessage = error.message;
      setValidationError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  try {
    return (
      <div className="mb-4 p-3 border rounded bg-light">
        <Form noValidate onSubmit={handleSubmit}>
          <div className="row align-items-start">
            <div className="col-md-8">
              <Form.Label className="fw-bold mb-2">
                Upload JSON Input Data
              </Form.Label>

              {data && Array.isArray(data) && data.length > 0 && (
                <Form.Select
                  value={selectedInput}
                  onChange={(e) => {
                    setSelectedInput(e.target.value);
                    setValidationError(""); // Clear validation error when changing input
                  }}
                  className="mb-2"
                >
                  <option value="">Select an input to upload to...</option>
                  {data
                    .filter((input) => input?.code !== "CS-THUMB") // Filter out thumbnail
                    .map((input, index) => {
                      if (!input) return null;

                      const urlId = input.url
                        ? getIdFromUrl(input.url)
                        : input.code || "";
                      const displayText = input.code || `Input ${index}`;
                      const labelText = input?.label ? ` - ${input.label}` : "";

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
              />
              <Form.Text className="text-muted d-block">
                Upload a JSON array with matrix data. Use underscore-prefixed
                attributes (like _type, _options) for input customization.
              </Form.Text>

              {file &&
                !VALID_TYPES.includes(file.type) &&
                !file.name.endsWith(".json") && (
                  <Alert variant="warning" transition={null} className="mt-2">
                    <small>
                      Unsupported file type, please upload a JSON file
                    </small>
                  </Alert>
                )}

              {validationError && (
                <Alert variant="danger" transition={null} className="mt-2">
                  <small>
                    <strong>Validation Error:</strong> {validationError}
                  </small>
                </Alert>
              )}
            </div>

            <div className="col-md-4 d-flex align-items-center justify-content-end">
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
              >
                {isLoading ? "Uploading..." : "Upload JSON"}
              </Button>
            </div>
          </div>
        </Form>
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
