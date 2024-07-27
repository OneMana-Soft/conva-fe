import React, { useEffect, useState, useRef } from 'react';


type InViewComponentProps = {
    children: React.ReactElement;
};
const InViewComponent: React.FC<InViewComponentProps> = ({ children }) => {
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Update state based on intersection status
                setInView(entry.isIntersecting);
            },
            {
                root: null, // use the viewport
                rootMargin: '0px', // no margin
                threshold: 0.5, // 50% visibility
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        // Cleanup observer
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return <div ref={ref}>{inView && children}</div>;
};

export default InViewComponent;
