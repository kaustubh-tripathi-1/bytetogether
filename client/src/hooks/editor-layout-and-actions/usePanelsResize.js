import { useCallback, useEffect } from 'react';

import { useThrottle } from '../useThrottle';

/**
 * Custom hook to enable panel resizing (horizontal and vertical) using mouse events.
 *
 * - Horizontal: Resizes between the CodeEditor and the Input/Output panel.
 * - Vertical: Resizes between InputPanel and OutputPanel within the right panel.
 *
 * Attaches `mousemove` and `mouseup` event listeners to handle live resizing and cleanup on unmount.
 *
 * @param {Object} params Parameters for resizing logic.
 * @param {number} params.editorWidth - Editor width in percentage.
 * @param {number} params.inputHeight - Input panel height in percentage.ms Parameters for resizing logic.
 * @param {React.RefObject<HTMLElement|null>} params.containerRef Ref to the container used for resizing calculations.

 * @param {React.RefObject<boolean>} params.isDraggingHorizontal Ref indicating horizontal drag state.
 * @param {React.RefObject<boolean>} params.isDraggingVertical Ref indicating vertical drag state.
 * @param {React.SetStateAction<Function>} params.setEditorWidth State setter to update editor width in percentage (20% - 80%).
 * @param {React.SetStateAction<Function>} params.setInputHeight State setter to update input panel height in percentage (20% - 80%).
 * @param {React.SetStateAction<Function>} params.setIsResizing State setter to toggle the resizing UI state.
 *
 */

export function usePanelsResize({
    editorWidth,
    inputHeight,
    containerRef,
    isDraggingHorizontal,
    isDraggingVertical,
    setEditorWidth,
    setInputHeight,
    setIsResizing,
    consoleHeight,
    setConsoleHeight,
    isPreviewVisible,
    previewContainerRef,
}) {
    const throttledSetConsoleHeight = useThrottle(setConsoleHeight, 16, {
        leading: true,
        trailing: false,
    });
    const throttledSetEditorWidth = useThrottle(setEditorWidth, 16, {
        leading: true,
        trailing: false,
    });
    const throttledSetInputHeight = useThrottle(setInputHeight, 16, {
        leading: true,
        trailing: false,
    });

    /**
     * Horizontal resize (CodeEditor vs Right Panel)
     */
    const handleHorizontalMouseDown = useCallback(
        (event) => {
            if (window.innerWidth < 768) return; // Disable resizing on mobile

            isDraggingHorizontal.current = true;
            setIsResizing(true);
            event.stopPropagation();
            event.preventDefault();
        },
        [isDraggingHorizontal, setIsResizing]
    );

    /**
     * Vertical resize (OutputPanel vs InputPanel or Preview Panel vs Console Panel)
     */
    const handleVerticalMouseDown = useCallback(
        (event) => {
            if (window.innerWidth < 768) return; // Disable resizing on mobile

            isDraggingVertical.current = true;
            setIsResizing(true);
            event.stopPropagation();
            event.preventDefault();
        },
        [isDraggingVertical, setIsResizing]
    );

    // Update container styles dynamically
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current?.style.setProperty(
                '--editor-width',
                `${editorWidth}%`
            );
            if (!isPreviewVisible) {
                containerRef.current?.style.setProperty(
                    '--input-height',
                    `${inputHeight}%`
                );
            }

            containerRef.current?.style.setProperty(
                '--console-height',
                `${consoleHeight}%`
            );
        }
    }, [
        consoleHeight,
        containerRef,
        editorWidth,
        inputHeight,
        isPreviewVisible,
    ]);

    // Add global event listeners for dragging
    useEffect(() => {
        function handleHorizontalMouseMove(event) {
            if (!isDraggingHorizontal.current || !containerRef.current) {
                return;
            }

            const containerWidth = containerRef.current.offsetWidth;
            const containerLeft =
                containerRef.current.getBoundingClientRect().left; // Get container's left edge
            const newX = event.clientX - containerLeft;
            const newWidth = (newX / containerWidth) * 100;

            throttledSetEditorWidth(Math.max(20, Math.min(80, newWidth))); // Min 20%, Max 80%
        }

        function handleHorizontalMouseUp() {
            if (isDraggingHorizontal.current) {
                isDraggingHorizontal.current = false;
                setIsResizing(false);
            }
        }

        function handleVerticalMouseMove(e) {
            if (!isDraggingVertical.current || !containerRef.current) {
                return;
            }

            if (isPreviewVisible) {
                const containerRect =
                    previewContainerRef.current.getBoundingClientRect();
                const containerHeight = containerRect.height;
                const newY = e.clientY - containerRect.top + 40;

                const newHeight =
                    ((containerHeight - newY) / containerHeight) * 100;

                throttledSetConsoleHeight(
                    Math.max(20, Math.min(50, newHeight))
                );
            } else {
                const containerRect =
                    containerRef.current?.getBoundingClientRect();
                const containerHeight = containerRect.height;
                const newY = e.clientY - containerRect.top;
                const newHeight = (newY / containerHeight) * 100;

                throttledSetInputHeight(Math.max(20, Math.min(80, newHeight)));
            }
        }

        function handleVerticalMouseUp() {
            if (isDraggingVertical.current) {
                isDraggingVertical.current = false;
                setIsResizing(false);
            }
        }

        function handleMouseLeave() {
            isDraggingHorizontal.current = false;
            isDraggingVertical.current = false;
            setIsResizing(false);
        }

        // Listeners
        containerRef.current?.addEventListener(
            'mousemove',
            handleHorizontalMouseMove
        );
        containerRef.current?.addEventListener(
            'mouseup',
            handleHorizontalMouseUp
        );
        containerRef.current?.addEventListener(
            'mousemove',
            handleVerticalMouseMove
        );
        containerRef.current?.addEventListener(
            'mouseup',
            handleVerticalMouseUp
        );
        containerRef.current?.addEventListener('mouseleave', handleMouseLeave);

        const containerRefCopy = containerRef.current;

        // Cleanup
        return () => {
            containerRefCopy?.removeEventListener(
                'mousemove',
                handleHorizontalMouseMove
            );
            containerRefCopy?.removeEventListener(
                'mouseup',
                handleHorizontalMouseUp
            );
            containerRefCopy?.removeEventListener(
                'mousemove',
                handleVerticalMouseMove
            );
            containerRefCopy?.removeEventListener(
                'mouseup',
                handleVerticalMouseUp
            );
            containerRefCopy?.removeEventListener(
                'mouseleave',
                handleMouseLeave
            );
        };
    }, [
        containerRef,
        isDraggingHorizontal,
        isDraggingVertical,
        isPreviewVisible,
        previewContainerRef,
        setConsoleHeight,
        setEditorWidth,
        setInputHeight,
        setIsResizing,
        throttledSetConsoleHeight,
        throttledSetEditorWidth,
        throttledSetInputHeight,
    ]);

    return { handleHorizontalMouseDown, handleVerticalMouseDown };
}
