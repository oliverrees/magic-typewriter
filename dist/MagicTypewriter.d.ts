import React from "react";
interface ContainerProps {
    message: string;
    onComplete?: Function;
    splitLines?: boolean;
    isLoading?: boolean;
    splitString?: RegExp;
    lineDelay?: number | undefined;
    charDelay?: number | undefined;
}
export declare const MagicTypewriter: React.FC<ContainerProps>;
export {};
