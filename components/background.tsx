import { useEffect, useState } from "react";
import stoneUrl from "../assets/stone.png";

export function Background() {
    return <div className="background"></div>;
}

export function Stone() {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const d = 20;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * d;
            const y = (e.clientY / window.innerHeight - 0.5) * d;
            setOffset({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <img
            src={stoneUrl}
            className="stone"
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
            aria-hidden="true"
        />
    );
}
