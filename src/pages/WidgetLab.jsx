import { useEffect, useMemo, useRef, useState } from "react";
import GridLayout from "react-grid-layout";

import {
  availableWidgets,
  defaultWidgetIds,
  widgetRegistry,
} from "../components/widgets/widgetRegistry";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./WidgetLab.css";

const LAYOUT_STORAGE_KEY = "trqx-widget-lab-layout-v2";
const ACTIVE_WIDGETS_STORAGE_KEY = "trqx-widget-lab-active-widgets-v2";
const COLLAPSED_STORAGE_KEY = "trqx-widget-lab-collapsed-v2";

function readStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);

    if (!savedValue) {
      return fallbackValue;
    }

    return JSON.parse(savedValue);
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallbackValue;
  }
}

function createDefaultLayout(widgetIds = defaultWidgetIds) {
  let currentY = 0;

  return widgetIds.map((widgetId, index) => {
    const widget = widgetRegistry[widgetId];
    const defaults = widget.defaultLayout;

    const width = Math.min(defaults.w, 12);
    const x = width === 12 ? 0 : index % 2 === 0 ? 0 : 6;

    if (width === 12 || x === 0) {
      currentY =
        index === 0
          ? 0
          : Math.max(
              currentY,
              index > 0
                ? Math.max(
                    ...widgetIds.slice(0, index).map((previousId) => {
                      const previousWidget = widgetRegistry[previousId];

                      return previousWidget
                        ? previousWidget.defaultLayout.h
                        : 0;
                    })
                  )
                : 0
            );
    }

    return {
      i: widgetId,
      x,
      y:
        widgetId === "market-brief"
          ? 0
          : widgetId === "economic-events" ||
              widgetId === "academy-progress"
            ? 5
            : 10,
      w: width,
      h: defaults.h,
      minW: defaults.minW,
      minH: defaults.minH,
    };
  });
}

function getNextWidgetPosition(layout, widgetDefinition) {
  const maximumY = layout.reduce((highestPoint, item) => {
    return Math.max(highestPoint, item.y + item.h);
  }, 0);

  return {
    i: widgetDefinition.id,
    x: 0,
    y: maximumY,
    w: widgetDefinition.defaultLayout.w,
    h: widgetDefinition.defaultLayout.h,
    minW: widgetDefinition.defaultLayout.minW,
    minH: widgetDefinition.defaultLayout.minH,
  };
}

export default function WidgetLab() {
  const workspaceRef = useRef(null);

  const [gridWidth, setGridWidth] = useState(1200);
  const [widgetPanelOpen, setWidgetPanelOpen] = useState(false);

  const [activeWidgetIds, setActiveWidgetIds] = useState(() =>
    readStorage(ACTIVE_WIDGETS_STORAGE_KEY, defaultWidgetIds)
  );

  const [layout, setLayout] = useState(() =>
    readStorage(
      LAYOUT_STORAGE_KEY,
      createDefaultLayout(defaultWidgetIds)
    )
  );

  const [collapsedWidgetIds, setCollapsedWidgetIds] = useState(() =>
    readStorage(COLLAPSED_STORAGE_KEY, [])
  );

  useEffect(() => {
    const workspace = workspaceRef.current;

    if (!workspace) {
      return undefined;
    }

    const updateWidth = () => {
      const measuredWidth = workspace.getBoundingClientRect().width;

      if (measuredWidth > 0) {
        setGridWidth(measuredWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(workspace);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      ACTIVE_WIDGETS_STORAGE_KEY,
      JSON.stringify(activeWidgetIds)
    );
  }, [activeWidgetIds]);

  useEffect(() => {
    localStorage.setItem(
      LAYOUT_STORAGE_KEY,
      JSON.stringify(layout)
    );
  }, [layout]);

  useEffect(() => {
    localStorage.setItem(
      COLLAPSED_STORAGE_KEY,
      JSON.stringify(collapsedWidgetIds)
    );
  }, [collapsedWidgetIds]);

  const categorizedWidgets = useMemo(() => {
    return availableWidgets.reduce((categories, widget) => {
      const category = widget.category || "Other";

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push(widget);
      return categories;
    }, {});
  }, []);

  const handleLayoutChange = (nextLayout) => {
    setLayout(nextLayout);
  };

  const addWidget = (widgetId) => {
    if (activeWidgetIds.includes(widgetId)) {
      return;
    }

    const widgetDefinition = widgetRegistry[widgetId];

    if (!widgetDefinition) {
      return;
    }

    setActiveWidgetIds((currentWidgetIds) => [
      ...currentWidgetIds,
      widgetId,
    ]);

    setLayout((currentLayout) => [
      ...currentLayout,
      getNextWidgetPosition(currentLayout, widgetDefinition),
    ]);
  };

  const removeWidget = (widgetId) => {
    setActiveWidgetIds((currentWidgetIds) =>
      currentWidgetIds.filter((id) => id !== widgetId)
    );

    setLayout((currentLayout) =>
      currentLayout.filter((item) => item.i !== widgetId)
    );

    setCollapsedWidgetIds((currentCollapsedIds) =>
      currentCollapsedIds.filter((id) => id !== widgetId)
    );
  };

  const toggleCollapsed = (widgetId) => {
    setCollapsedWidgetIds((currentCollapsedIds) => {
      if (currentCollapsedIds.includes(widgetId)) {
        return currentCollapsedIds.filter((id) => id !== widgetId);
      }

      return [...currentCollapsedIds, widgetId];
    });
  };

  const resetWorkspace = () => {
    const defaultLayout = createDefaultLayout(defaultWidgetIds);

    setActiveWidgetIds(defaultWidgetIds);
    setLayout(defaultLayout);
    setCollapsedWidgetIds([]);

    localStorage.removeItem(ACTIVE_WIDGETS_STORAGE_KEY);
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    localStorage.removeItem(COLLAPSED_STORAGE_KEY);
  };

  const renderWidget = (widgetId) => {
    const definition = widgetRegistry[widgetId];

    if (!definition) {
      return null;
    }

    const WidgetComponent = definition.component;
    const isCollapsed = collapsedWidgetIds.includes(widgetId);

    return (
      <section
        key={widgetId}
        className={`widget-lab__card ${
          isCollapsed ? "widget-lab__card--collapsed" : ""
        }`}
      >
        <header className="widget-lab__card-header">
          <div className="widget-lab__drag-handle">
            <span className="widget-lab__drag-icon" aria-hidden="true">
              ⋮⋮
            </span>

            <span>{definition.title}</span>
          </div>

          <div className="widget-lab__card-actions">
            <button
              type="button"
              className="widget-lab__icon-button"
              onClick={() => toggleCollapsed(widgetId)}
              title={isCollapsed ? "Expand widget" : "Collapse widget"}
              aria-label={
                isCollapsed ? "Expand widget" : "Collapse widget"
              }
            >
              {isCollapsed ? "＋" : "−"}
            </button>

            <button
              type="button"
              className="widget-lab__icon-button widget-lab__icon-button--remove"
              onClick={() => removeWidget(widgetId)}
              title="Remove widget"
              aria-label={`Remove ${definition.title}`}
            >
              ×
            </button>
          </div>
        </header>

        {!isCollapsed && (
          <div className="widget-lab__card-content">
            <WidgetComponent />
          </div>
        )}
      </section>
    );
  };

  return (
    <main className="widget-lab">
      <header className="widget-lab__header">
        <div>
          <p className="widget-lab__eyebrow">
            TRQX DEVELOPMENT WORKSPACE
          </p>

          <h1>Widget Lab</h1>

          <p className="widget-lab__description">
            Build your terminal by adding, moving, resizing, collapsing, and
            removing widgets. Your workspace is saved automatically.
          </p>
        </div>

        <div className="widget-lab__toolbar">
          <span className="widget-lab__status">Phase 3</span>

          <button
            type="button"
            className="widget-lab__button widget-lab__button--primary"
            onClick={() => setWidgetPanelOpen(true)}
          >
            + Add Widget
          </button>

          <button
            type="button"
            className="widget-lab__button"
            onClick={resetWorkspace}
          >
            Reset Workspace
          </button>
        </div>
      </header>

      {activeWidgetIds.length === 0 && (
        <section className="widget-lab__empty">
          <p className="widget-lab__empty-label">
            CUSTOM TERMINAL
          </p>

          <h2>Your workspace is empty</h2>

          <p>
            Add a widget to begin building your TRQX terminal.
          </p>

          <button
            type="button"
            className="widget-lab__button widget-lab__button--primary"
            onClick={() => setWidgetPanelOpen(true)}
          >
            + Add Your First Widget
          </button>
        </section>
      )}

      <div
        ref={workspaceRef}
        className="widget-lab__workspace"
      >
        {gridWidth > 0 && activeWidgetIds.length > 0 && (
          <GridLayout
            className="widget-lab__grid"
            layout={layout}
            cols={12}
            rowHeight={70}
            width={gridWidth}
            margin={[20, 20]}
            containerPadding={[0, 0]}
            draggableHandle=".widget-lab__drag-handle"
            draggableCancel=".widget-lab__card-actions"
            onLayoutChange={handleLayoutChange}
            compactType="vertical"
            preventCollision={false}
            resizeHandles={["se"]}
            useCSSTransforms
          >
            {activeWidgetIds.map(renderWidget)}
          </GridLayout>
        )}
      </div>

      {widgetPanelOpen && (
        <div
          className="widget-panel__backdrop"
          role="presentation"
          onMouseDown={() => setWidgetPanelOpen(false)}
        >
          <aside
            className="widget-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="widget-panel-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="widget-panel__header">
              <div>
                <p className="widget-panel__eyebrow">
                  TERMINAL COMPONENTS
                </p>

                <h2 id="widget-panel-title">
                  Add Widget
                </h2>
              </div>

              <button
                type="button"
                className="widget-lab__icon-button"
                onClick={() => setWidgetPanelOpen(false)}
                aria-label="Close widget panel"
              >
                ×
              </button>
            </header>

            <div className="widget-panel__content">
              {Object.entries(categorizedWidgets).map(
                ([category, widgets]) => (
                  <section
                    key={category}
                    className="widget-panel__category"
                  >
                    <h3>{category}</h3>

                    <div className="widget-panel__list">
                      {widgets.map((widget) => {
                        const isActive =
                          activeWidgetIds.includes(widget.id);

                        return (
                          <article
                            key={widget.id}
                            className={`widget-panel__item ${
                              isActive
                                ? "widget-panel__item--active"
                                : ""
                            }`}
                          >
                            <div>
                              <h4>{widget.title}</h4>
                              <p>{widget.description}</p>
                            </div>

                            <button
                              type="button"
                              className="widget-panel__add-button"
                              disabled={isActive}
                              onClick={() => addWidget(widget.id)}
                            >
                              {isActive ? "Added" : "Add"}
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}