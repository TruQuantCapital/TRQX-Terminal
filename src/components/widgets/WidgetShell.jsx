import React from "react";
import "./WidgetShell.css";

export default function WidgetShell({
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
  contentClassName = "",
  scrollable = false,
  height,
}) {
  const shellStyle = height
    ? {
        height:
          typeof height === "number"
            ? `${height}px`
            : height,
      }
    : undefined;

  return (
    <section
      className={`trqx-widget ${className}`.trim()}
      style={shellStyle}
    >
      {(eyebrow || title || description || action) && (
        <header className="trqx-widget-header">
          <div className="trqx-widget-heading">
            {eyebrow && (
              <span className="trqx-widget-eyebrow">
                {eyebrow}
              </span>
            )}

            {title && (
              <h2 className="trqx-widget-title">
                {title}
              </h2>
            )}

            {description && (
              <p className="trqx-widget-description">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="trqx-widget-action">
              {action}
            </div>
          )}
        </header>
      )}

      <div
        className={[
          "trqx-widget-content",
          scrollable ? "trqx-widget-content-scrollable" : "",
          contentClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </section>
  );
}