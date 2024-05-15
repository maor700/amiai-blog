import React, { useState, useRef, useEffect, PropsWithChildren } from 'react';

interface ExpanderProps {
    isOpened?: boolean;
    maxHeight?: number;
    showHintEdgeGradient?: boolean;
    ButtonText?: { expand: string; collapse: string };
}

export const Expander = ({
    children,
    isOpened = false,
    maxHeight = 300,
    showHintEdgeGradient = true,
    ButtonText = { expand: 'הרחב', collapse: 'צמצם' },
}: PropsWithChildren<ExpanderProps>) => {
    const [isExpanded, setIsExpanded] = useState(isOpened);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsExpanded(isOpened);
    }, [isOpened]);

    const toggleExpansion = () => {
        setIsExpanded((prevState) => !prevState);
    };

    const renderContent = () => {
        if (isExpanded || !maxHeight) {
            return children;
        }

        const contentStyle: React.CSSProperties = {
            maxHeight: `${maxHeight}px`,
            overflow: 'hidden',
            position: 'relative',
        };

        return (
            <div style={contentStyle} ref={contentRef}>
                <>
                    {children}
                    {showHintEdgeGradient && (
                        <div
                            style={{ background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0), hsl(var(--background)))' }}
                            className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b"
                        />
                    )}
                </>
            </div>
        );
    };

    return (
        <div>
            {renderContent()}
            {maxHeight && (
                // full-width button magenta bg, tailwind classes outlined
                <button className={`w-full bg-blue-900 text-white py-2 px-4 rounded-sm hover:bg-blue-800 cursor-pointer focus:outline-none
            ${isExpanded ? 'mt-4' : 'mt-0'}
        `} onClick={toggleExpansion}>
                    {isExpanded ? ButtonText.collapse : ButtonText.expand}
                </button>
            )}
        </div>
    );
};