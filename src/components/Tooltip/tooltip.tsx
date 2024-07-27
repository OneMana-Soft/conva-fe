import React, { useState } from "react";

interface TooltipProp {
    infoText: string,
    children: React.ReactElement,
}

const Tooltip: React.FC<TooltipProp> = ({ infoText, children }) => {
    // State to manage tooltip visibility
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="flex flex-col gap-2 items-center justify-center relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}

            {/* Tooltip content */}
            <div className={`w-32 bg-gray-300 text-center p-1 rounded-2xl text-xs border border-gray-400 absolute transition ease-in-out bottom-full opacity-0 mb-4 ${showTooltip ? "opacity-100 transform translate-y-2" : "hidden"}`}>
                {infoText}
                {/* Arrow indicator */}
                <div className="w-0 h-0 border-l-transparent border-l-8 border-r-transparent border-r-8 border-t-8 border-t-gray-400 absolute -bottom-2 left-1/2 transform -translate-x-1/2" />
            </div>
        </div>
    );
};

export default Tooltip;
