import { jsxRenderer } from "hono/jsx-renderer";
import { Layout } from "../views/Layout";

export const LayoutMiddleware = jsxRenderer(Layout);
