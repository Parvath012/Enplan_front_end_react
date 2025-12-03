import React, { useEffect, useRef, useState } from 'react';

const PlainTextEditor = (props: any) => {
    const [value, setValue] = useState(props.value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus input on mount
        if (inputRef.current) inputRef.current.focus();
    }, []);

    useEffect(() => {
        // Inform AG Grid about changes
        props.api.stopEditing();
    }, [value]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            props.stopEditing();
        }
    };

    return (
        <input
            ref={inputRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                font: 'inherit',
                background: 'transparent',
                padding: 0,
            }}
        />
    );
};

export default PlainTextEditor;
