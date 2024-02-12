import OpenAI from "openai";

export type Bindings = {
	USERNAME: string;
	PASSWORD: string;
	OPENAI_API_KEY: string;
	DB: D1Database;
};
export type Variables = {
	openai: OpenAI;
};
export type AppEnv = {
	Bindings: Bindings;
	Variables: Variables;
};
