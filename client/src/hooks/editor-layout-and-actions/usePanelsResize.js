import { useEffect } from 'react';

/**
 * Custom hook to enable panel resizing (horizontal and vertical) using mouse events.
 *
 * - Horizontal: Resizes between the CodeEditor and the Input/Output panel.
 * - Vertical: Resizes between InputPanel and OutputPanel within the right panel.
 *
 * Attaches `mousemove` and `mouseup` event listeners to handle live resizing and cleanup on unmount.
 *
 * @param {Object} params Parameters for resizing logic.
 * @param {React.MutableRefObject<boolean>} params.isDraggingHorizontal Ref indicating horizontal drag state.
 * @param {React.MutableRefObject<boolean>} params.isDraggingVertical Ref indicating vertical drag state.
 * @param {React.MutableRefObject<HTMLElement|null>} params.containerRef Ref to the container used for resizing calculations.
 * @param {React.SetStateAction<Function>} params.setEditorWidth State setter to update editor width in percentage (20% - 80%).
 * @param {React.SetStateAction<Function>} params.setInputHeight State setter to update input panel height in percentage (20% - 80%).
 * @param {React.SetStateAction<Function>} params.setIsResizing State setter to toggle the resizing UI state.
 *
 */

export function usePanelsResize({
    editorWidth,
    inputHeight,
    isDraggingHorizontal,
    containerRef,
    setEditorWidth,
    setIsResizing,
    isDraggingVertical,
    setInputHeight,
}) {
    /**
     * Horizontal resize (CodeEditor vs Right Panel)
     */
    function handleHorizontalMouseDown() {
        if (window.innerWidth < 768) return; // Disable resizing on mobile
        isDraggingHorizontal.current = true;
        setIsResizing(true);
    }

    /**
     * Vertical resize (OutputPanel vs InputPanel)
     */
    function handleVerticalMouseDown() {
        if (window.innerWidth < 768) return; // Disable resizing on mobile
        isDraggingVertical.current = true;
        setIsResizing(true);
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
        }
    }, [containerRef, editorWidth, inputHeight]);

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
                const containerHeight = containerRef.current.offsetHeight;
                const newY =
                    e.clientY -
                    containerRef.current.getBoundingClientRect().top;
                const newHeight = (newY / containerHeight) * 100;
                setInputHeight(Math.max(20, Math.min(80, newHeight))); // Min 20%, Max 80%
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

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleHorizontalMouseMove);
            window.removeEventListener('mouseup', handleHorizontalMouseUp);
            window.removeEventListener('mousemove', handleVerticalMouseMove);
            window.removeEventListener('mouseup', handleVerticalMouseUp);
        };
    }, [
        containerRef,
        isDraggingHorizontal,
        isDraggingVertical,
        setEditorWidth,
        setInputHeight,
        setIsResizing,
    ]);

    return { handleHorizontalMouseDown, handleVerticalMouseDown };
}
