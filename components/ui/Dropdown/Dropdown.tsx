'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Dropdown.module.less';

type DropdownItemVariant = 'default' | 'danger';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: DropdownItemVariant;
  separator?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
}

export function Dropdown({ trigger, items }: DropdownProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback((): void => setIsOpen(false), []);

  const toggle = (): void => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  const handleItemClick = (item: DropdownItem): void => {
    item.onClick?.();
    close();
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.trigger} onClick={toggle}>
        {trigger}
      </div>
      {isOpen && (
        <div className={styles.menu} role="menu">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator && index > 0 && <div className={styles.separator} role="separator" />}
              <button
                className={[
                  styles.item,
                  item.variant === 'danger' ? styles.itemDanger : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="menuitem"
                onClick={() => handleItemClick(item)}
              >
                {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
