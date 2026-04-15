import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

// Default config (can be overridden by pages)
// https://vike.dev/config

const config: Config = {
    // https://vike.dev/head-tags
    title: "Iann",
    description: "",
    prerender: true,
    favicon: "/ico.ico",

    extends: [vikeReact],
};

export default config;
