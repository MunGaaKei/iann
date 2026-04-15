import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
// Default config (can be overridden by pages)
// https://vike.dev/config

const isDev = process.env.NODE_ENV === "development";

const config: Config = {
    // https://vike.dev/head-tags
    title: "Iann",
    description: "",
    prerender: true,
    favicon: isDev ? "/ico.ico" : "/iann/ico.ico",

    extends: [vikeReact],
};

export default config;
