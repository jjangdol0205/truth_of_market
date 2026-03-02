"use client";

import { useEffect } from "react";

export default function DisableCopy() {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault(); // Prevent copying
            if (e.clipboardData) {
                e.clipboardData.setData("text/plain", "Screen capture is disabled.");
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Allow normal interactions in input fields and textareas
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            // Prevent shortcuts: Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+S, Ctrl+P, Ctrl+U
            if (
                (e.ctrlKey || e.metaKey) &&
                ["c", "a", "x", "s", "p", "u", "i"].includes(e.key.toLowerCase())
            ) {
                e.preventDefault();
            }

            // Screenshots/Snipping Tools Shortcuts
            // Win+Shift+S (Windows)
            if (e.shiftKey && e.metaKey && e.key.toLowerCase() === "s") {
                e.preventDefault();
                blankScreen();
            }

            // Mac Shift+Cmd+3, 4, 5
            if (e.shiftKey && e.metaKey && ["3", "4", "5"].includes(e.key)) {
                e.preventDefault();
                blankScreen();
            }

            // Prevent developer tools shortcuts like F12
            if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
                e.preventDefault();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "PrintScreen") {
                navigator.clipboard.writeText("Screen capture is disabled.");
                blankScreen();
            }
        };

        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName !== "IMG") {
                e.preventDefault();
            }
        };

        // A lot of snipping tools cause the window to lose focus when activated
        const handleWindowBlur = () => {
            // Disable the dark screen blur effect per user request
            // document.body.style.filter = "blur(8px)";
            // document.body.style.opacity = "0.05";
        };

        const handleWindowFocus = () => {
            // Restore normal view if previously blanked
            document.body.style.filter = "blur(0px)";
            document.body.style.opacity = "1";
        };

        let blankTimeout: NodeJS.Timeout;
        const blankScreen = () => {
            // document.body.style.display = "none";
            // clearTimeout(blankTimeout);
            // blankTimeout = setTimeout(() => {
            //     document.body.style.display = "block";
            // }, 500); // Hide for 500ms when print screen is pressed
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("copy", handleCopy);
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("dragstart", handleDragStart);
        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            document.removeEventListener("dragstart", handleDragStart);
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);
        };
    }, []);

    return null;
}
