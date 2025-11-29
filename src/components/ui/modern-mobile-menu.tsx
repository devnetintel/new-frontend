"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

export interface InteractiveMenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  activeIndex?: number;
  onItemClick?: (index: number) => void;
}

const defaultAccentColor = "hsl(var(--primary))";

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor,
  activeIndex: controlledActiveIndex,
  onItemClick,
}) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);

  const activeIndex =
    controlledActiveIndex !== undefined
      ? controlledActiveIndex
      : internalActiveIndex;

  const finalItems = useMemo(() => {
    const isValid =
      items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) {
      console.warn(
        "InteractiveMenu: 'items' prop is invalid or missing. Using default items.",
        items
      );
      return [];
    }
    return items;
  }, [items]);

  useEffect(() => {
    if (activeIndex >= finalItems.length) {
      if (controlledActiveIndex === undefined) {
        setInternalActiveIndex(0);
      }
    }
  }, [finalItems, activeIndex, controlledActiveIndex]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];
      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`);
      }
    };

    setLineWidth();
    window.addEventListener("resize", setLineWidth);
    return () => {
      window.removeEventListener("resize", setLineWidth);
    };
  }, [activeIndex, finalItems]);

  const handleItemClick = (index: number) => {
    if (controlledActiveIndex === undefined) {
      setInternalActiveIndex(index);
    }
    if (onItemClick) {
      onItemClick(index);
    }
    const item = finalItems[index];
    if (item.onClick) {
      item.onClick();
    }
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { "--component-active-color": activeColor } as React.CSSProperties;
  }, [accentColor]);

  if (finalItems.length === 0) {
    return null;
  }

  return (
    <nav className="mobile-menu" role="navigation" style={navStyle}>
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex;
        const isTextActive = isActive;
        const IconComponent = item.icon;

        return (
          <button
            key={`${item.label}-${index}`}
            className={`mobile-menu__item ${isActive ? "active" : ""}`}
            onClick={() => handleItemClick(index)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            style={{ "--lineWidth": "0px" } as React.CSSProperties}
          >
            <div className="mobile-menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`mobile-menu__text ${isTextActive ? "active" : ""}`}
              ref={(el) => {
                textRefs.current[index] = el;
              }}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};

export { InteractiveMenu };
