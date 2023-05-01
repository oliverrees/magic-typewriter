import React from 'react';
interface ContainerProps {
    message: String;
    onComplete?: Function;
    splitLines?: Boolean;
    isLoading?: Boolean;
    splitString?: RegExp;
    lineDelay?: number | undefined;
    charDelay?: number | undefined;
}
export declare const MagicTypewriter: React.FC<ContainerProps>;
export {};
