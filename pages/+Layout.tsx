import { ReactNode } from "react";
import "../assets/global.css";
import { Background } from "../components/background";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <Background />
            {children}
        </>
    );
}
