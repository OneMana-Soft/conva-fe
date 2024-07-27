import React, {useCallback, useRef} from 'react';

type DebounceClickProps = {
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    wait: number;
    children: React.ReactElement;
};

const DebounceClick: React.FC<DebounceClickProps> = ({ onClick, wait, children }) => {
    const debouncedOnClick = useRef(debounce(onClick, wait)).current;

    function debounce(callback: (event: React.MouseEvent<HTMLElement>) => void, wait: number) {
        let timer:  ReturnType<typeof setTimeout>;
        return (event: React.MouseEvent<HTMLElement>) => {
            clearTimeout(timer);
            timer = setTimeout(() => callback(event), wait);
        };
    }

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        debouncedOnClick(event);
    }, [debouncedOnClick]);

    return React.cloneElement(children, { onClick: handleClick });
};

export default DebounceClick;