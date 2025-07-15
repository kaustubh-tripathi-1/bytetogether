import { AnimatePresence, motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

/**
 * Generic Tooltip component for any component
 */
export default function Tooltip({
    content,
    children,
    position = 'bottom',
    offset = 8,
    className = '',
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [positionStyles, setPositionStyles] = useState({});
    const tooltipRef = useRef(null);
    const wrapperRef = useRef(null);

    function handleMouseEnter() {
        setIsVisible(true);
    }
    function handleMouseLeave() {
        setIsVisible(false);
    }

    useEffect(() => {
        if (!isVisible || !wrapperRef.current || !tooltipRef.current) return;

        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        function calcStyle() {
            switch (position) {
                case 'top':
                    return {
                        top: -tooltipRect.height - offset,
                        left: wrapperRect.width / 2 - tooltipRect.width / 2,
                    };
                case 'bottom':
                    return {
                        top: wrapperRect.height + offset,
                        left: wrapperRect.width / 2 - tooltipRect.width / 2,
                    };
                case 'left':
                    return {
                        top: wrapperRect.height / 2 - tooltipRect.height / 2,
                        left: -tooltipRect.width - offset,
                    };
                case 'right':
                    return {
                        top: wrapperRect.height / 2 - tooltipRect.height / 2,
                        left: wrapperRect.width + offset,
                    };
                default:
                    return { top: 0, left: 0 };
            }
        }

        setPositionStyles(calcStyle());
    }, [isVisible, position, offset]);

    return (
        <div
            ref={wrapperRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative inline-block"
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ y: -10, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -10, opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute z-50 rounded-md bg-gray-300 px-2 py-1 text-xs whitespace-nowrap text-gray-800 opacity-90 dark:bg-[#2b2b44] dark:text-white ${className}`}
                        style={positionStyles}
                        role="tooltip"
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
