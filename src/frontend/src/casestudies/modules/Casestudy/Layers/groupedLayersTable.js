import React, { useState } from "react";
import { Form, Button, Ratio } from "react-bootstrap";
import { LinkItUrl } from "react-linkify-it";
import EditCasestudyLayer from "./Edit";
import pick from "lodash/pick";
import getIdFromUrl from "../../../../libs/getIdFromUrl";

export default function GroupedLayersTable({
  layers = [],
  selected = [],
  setSelected,
  setIndex,
  handleDeleteClick,
  isDeleting,
  casestudy,
}) {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const onSelectGroup = (group, isSelect) => {
    const groupRows = layers.filter((r) => r.label.split(" | ")[0] === group);
    const groupCodes = groupRows.map((r) => r.code);
    if (isSelect) {
      setSelected([...new Set([...selected, ...groupCodes])]);
    } else {
      setSelected(selected.filter((s) => !groupCodes.includes(s)));
    }
  };

  const onSelectRow = (row, isSelect) => {
    if (isSelect) {
      setSelected([...selected, row.code]);
    } else {
      setSelected(selected.filter((s) => s !== row.code));
    }
  };

  const isGroupSelected = (group) => {
    const groupRows = layers.filter((r) => r.label.split(" | ")[0] === group);
    return groupRows.every((r) => selected.includes(r.code));
  };

  // Group layers by "group"
  const groupedRows = layers.reduce((acc, row) => {
    const group = row.label.split(" | ")[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push(row);
    return acc;
  }, {});

  return (
    <div>
      {/* Table headers */}
      <div className="d-flex bg-dark text-white p-2 border-bottom">
        <div style={{ width: "50px" }}></div> {/* space for checkbox + arrow */}
        <div style={{ width: "100px", marginRight: "8px" }}>Thumbnail</div>
        <div style={{ flex: 1 }}>Code</div>
        <div style={{ flex: 2 }}>Label</div>
        <div style={{ flex: 1, textAlign: "right" }}>Actions</div>
      </div>

      {Object.keys(groupedRows).map((group) => (
        <div key={group} className="mb-2">
          {/* Group header */}
          <div
            className="d-flex align-items-center bg-light p-2 border-bottom"
            style={{ gap: "8px" }}
          >
            <div
              style={{ width: "40px", display: "flex", alignItems: "center" }}
            >
              {/* Arrow */}
              <span
                onClick={() => toggleGroup(group)}
                style={{
                  display: "inline-block",
                  transform: expandedGroups[group]
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                  userSelect: "none",
                  marginRight: "4px",
                }}
              >
                ▶
              </span>

              {/* Group checkbox */}
              <input
                type="checkbox"
                checked={isGroupSelected(group)}
                onChange={(e) => onSelectGroup(group, e.target.checked)}
                className="custom-checkbox"
              />
            </div>

            {/* Group label with capital letter and count */}
            <strong>
              {group.charAt(0).toUpperCase() + group.slice(1)} (
              {groupedRows[group].length})
            </strong>
          </div>

          {/* Group rows */}
          {expandedGroups[group] &&
            groupedRows[group].map((row) => (
              <div
                key={row.code}
                className="d-flex align-items-center ps-4 border-bottom py-1"
                style={{ gap: "8px" }}
              >
                {/* Row checkbox */}
                <input
                  type="checkbox"
                  checked={selected.includes(row.code)}
                  onChange={(e) => onSelectRow(row, e.target.checked)}
                  className="custom-checkbox"
                />

                {/* Thumbnail */}
                <div style={{ width: "100px", marginRight: "8px" }}>
                  <Ratio aspectRatio="1x1">
                    <img
                      src={row.thumbnail}
                      onClick={() => setIndex(row.thumbnail)}
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Ratio>
                </div>

                {/* Code */}
                <div style={{ flex: 1 }}>{row.code}</div>

                {/* Label */}
                <div style={{ flex: 2 }}>
                  <p className="fw-bold mb-0">{row.label.split(" | ")[1]}</p>
                  {row.description && (
                    <LinkItUrl>
                      <p className="mb-0">{row.description}</p>
                    </LinkItUrl>
                  )}
                </div>

                {/* Actions */}
                <div
                  style={{ flex: 1, textAlign: "right" }}
                  className="d-flex justify-content-end"
                >
                  <Button
                    size="lg"
                    className="me-2"
                    href={row.file}
                    download
                    target="_blank"
                  >
                    <i className="fa fa-download"></i>
                  </Button>
                  <Button
                    size="lg"
                    className="me-2"
                    href={row.thumbnail}
                    download
                    target="_blank"
                  >
                    <i className="fa fa-image"></i>
                  </Button>
                  {casestudy.is_owner && (
                    <EditCasestudyLayer
                      btnProps={{ className: "me-2", size: "lg" }}
                      initialValues={{
                        ...pick(row, ["id", "description"]),
                        casestudyId: casestudy.id,
                      }}
                    />
                  )}
                  {casestudy.is_owner && (
                    <Button
                      variant="danger"
                      size="lg"
                      disabled={isDeleting || row.code === "GRID"}
                      onClick={() => handleDeleteClick(getIdFromUrl(row.url))}
                    >
                      <i className="fa fa-trash-o"></i>
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>
      ))}

      <style jsx>{`
        .custom-checkbox {
          cursor: pointer;
          margin-left: 6px !important;
        }
        .custom-checkbox:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
