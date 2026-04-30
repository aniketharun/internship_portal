import { useState, useEffect, useRef } from 'react';

const TypingHeadline = ({
    text: fullText = "Find your dream internship",
    onComplete,
    style: overrideStyles = {},
    className = "",
    highlightText = "dream",
    typingSpeed = 50,
    startTyping = true
}) => {
    const [text, setText] = useState('');
    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!startTyping) {
            setText(fullText);
            return;
        }

        // Reset to empty then re-type
        setText('');
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, index + 1));
            index++;
            if (index >= fullText.length) {
                clearInterval(interval);
                if (onCompleteRef.current) {
                    onCompleteRef.current();
                }
            }
        }, typingSpeed);

        return () => clearInterval(interval);
    }, [fullText, typingSpeed, startTyping]);

    const renderText = () => {
        if (!highlightText || !text.toLowerCase().includes(highlightText.toLowerCase())) {
            return <span>{text}</span>;
        }

        const lowerText = text.toLowerCase();
        const lowerHighlight = highlightText.toLowerCase();
        const highlightIndex = lowerText.indexOf(lowerHighlight);

        if (highlightIndex === -1) return <span>{text}</span>;

        const before = text.slice(0, highlightIndex);
        const highlighted = text.slice(highlightIndex, highlightIndex + highlightText.length);
        const after = text.slice(highlightIndex + highlightText.length);

        return (
            <>
                {before}
                <span style={{ color: 'var(--primary-color)' }}>{highlighted}</span>
                {after}
            </>
        );
    };

    return (
        <h1 className={className} style={{ ...styles.hugeText, ...overrideStyles }}>
            {renderText()}
            <span style={styles.cursor}>|</span>
        </h1>
    );
};

const styles = {
    hugeText: {
        fontSize: '4.5rem',
        fontWeight: '900',
        lineHeight: '1.1',
        color: 'var(--text-color)',
        marginBottom: '1.5rem',
        fontFamily: "'Outfit', sans-serif",
        minHeight: '10rem',
    },
    cursor: {
        display: 'inline-block',
        width: '4px',
        marginLeft: '4px',
        color: 'var(--typing-cursor)',
        animation: 'blink 1s step-end infinite',
        verticalAlign: 'baseline',
    }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes blink {
        from, to { opacity: 1; }
        50% { opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

export default TypingHeadline;
