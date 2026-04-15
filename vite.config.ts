import react from "@vitejs/plugin-react";

import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
    plugins: [vike(), react()],
    base: command === "build" ? "/iann/" : "/",
}));
