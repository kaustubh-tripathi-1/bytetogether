import { useEffect } from 'react';

/**
 * Custom hook to enable panel resizing (horizontal and vertical) using mouse events.
 *
 * - Horizontal: Resizes between the CodeEditor and the Input/Output panel.
 * - Vertical: Resizes between InputPanel and OutputPanel within the right panel.
 *
 * Attaches `mousemove` and `mouseup` event listeners to handle live resizing and cleanup on unmount.
 *
 * @param {Object} para
 * @param {number} params.editorWidth - Editor width in percentage.
 * @param {number} params.inputHeight - Input panel height in percentage.ms Parameters for resizing logic.
 * @param {React.RefObject<HTMLElement|null>} params.containerRef Ref to the container used for resizing calculations.
 * @param {React.RefObject<boolean>} params.isDraggingHorizontal Ref indicating horizontal drag state.
 * @param {React.RefObject<boolean>} params.isDraggingVertical Ref indicating vertical drag state.
 * @param {React.SetStateAction<Function>} params.setEditorWidth State setter to update editor width in percentage (20% - 80%).
 * @param {React.SetStateAction<Function>} params.setInputHeight State setter to update input panel height in percentage (20% - 80%).
 * @param {React.SetStateAction<Function>} params.setIsResizing State setter to toggle the resizing UI state.
 * @param {number} params.consoleHeight - Console height in pixels (for PreviewPanel).
 * @param {React.SetStateAction<Function>} params.setConsoleHeight - Set console height.
 * @param {boolean} params.showPreview - Whether PreviewPanel is visible.
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
    showPreview,
}) {
    /**
     * Horizontal resize (CodeEditor vs Right Panel)
     */
    function handleHorizontalMouseDown(event) {
        if (window.innerWidth < 768) return; // Disable resizing on mobile
        isDraggingHorizontal.current = true;
        setIsResizing(true);
        event.preventDefault();
    }

    /**
     * Vertical resize (OutputPanel vs InputPanel)
     */
    function handleVerticalMouseDown(event) {
        if (window.innerWidth < 768) return; // Disable resizing on mobile
        isDraggingVertical.current = true;
        setIsResizing(true);
        event.preventDefault();
    }

    // Update container styles dynamically
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty(
                '--editor-width',
                `${editorWidth}%`
            );
            containerRef.current.style.setProperty(
                '--input-height',
                `${inputHeight}%`
            );
            containerRef.current.style.setProperty(
                '--console-height',
                `${consoleHeight}px`
            );
        }
    }, [consoleHeight, containerRef, editorWidth, inputHeight]);

    // Add global event listeners for dragging
    useEffect(() => {
        function handleHorizontalMouseMove(event) {
            if (isDraggingHorizontal.current && containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const newX = event.clientX;
                const newWidth = (newX / containerWidth) * 100;
                setEditorWidth(Math.max(20, Math.min(80, newWidth))); // Min 20%, Max 80%
            }
        }

        function handleHorizontalMouseUp() {
            isDraggingHorizontal.current = false;
            setIsResizing(false);
        }

        function handleVerticalMouseMove(e) {
            if (isDraggingVertical.current && containerRef.current) {
                const containerRect =
                    containerRef.current.getBoundingClientRect();
                const containerHeight = containerRect.height;
                const newY = e.clientY - containerRect.top;
                if (showPreview) {
                    const newHeight = Math.max(100, Math.min(400, newY));
                    setConsoleHeight(newHeight);
                } else {
                    const newHeight = (newY / containerHeight) * 100;
                    setInputHeight(Math.max(20, Math.min(80, newHeight)));
                }
            }
        }

        function handleVerticalMouseUp() {
            isDraggingVertical.current = false;
            setIsResizing(false);
        }

        // Listeners
        window.addEventListener('mousemove', handleHorizontalMouseMove);
        window.addEventListener('mouseup', handleHorizontalMouseUp);
        window.addEventListener('mousemove', handleVerticalMouseMove);
        window.addEventListener('mouseup', handleVerticalMouseUp);

        // Touch events for mobile
        /* function handleTouchMove(e) {
            if (isDraggingHorizontal.current && containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const newX = e.touches[0].clientX;
                const newWidth = (newX / containerWidth) * 100;
                setEditorWidth(Math.max(20, Math.min(80, newWidth)));
            } else if (isDraggingVertical.current && containerRef.current) {
                const containerRect =
                    containerRef.current.getBoundingClientRect();
                const containerHeight = containerRect.height;
                const newY = e.touches[0].clientY - containerRect.top;
                if (showPreview) {
                    const newHeight = Math.max(100, Math.min(400, newY));
                    setConsoleHeight(newHeight);
                } else {
                    const newHeight = (newY / containerHeight) * 100;
                    setInputHeight(Math.max(20, Math.min(80, newHeight)));
                }
            }
        }

        function handleTouchEnd() {
            isDraggingHorizontal.current = false;
            isDraggingVertical.current = false;
            setIsResizing(false);
        }

        window.addEventListener('touchmove', handleTouchMove, {
            passive: false,
        });
        window.addEventListener('touchend', handleTouchEnd); */

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleHorizontalMouseMove);
            window.removeEventListener('mouseup', handleHorizontalMouseUp);
            window.removeEventListener('mousemove', handleVerticalMouseMove);
            window.removeEventListener('mouseup', handleVerticalMouseUp);
            // window.removeEventListener('touchmove', handleTouchMove);
            // window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [
        containerRef,
        isDraggingHorizontal,
        isDraggingVertical,
        setConsoleHeight,
        setEditorWidth,
        setInputHeight,
        setIsResizing,
        showPreview,
    ]);

    return { handleHorizontalMouseDown, handleVerticalMouseDown };
}
