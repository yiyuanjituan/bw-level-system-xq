/// <reference types="vite/client" />

interface AppContainerBridgeConfig {
	scriptUrl?: string;
	globalName?: string;
	inAppProperty?: string;
	openInBrowserMethod?: string;
	loadTimeout?: number;
}

interface AppContainerRuntimeConfig {
	enabled?: boolean;
	userAgentPattern?: string;
	bridge?: AppContainerBridgeConfig;
	statusBar?: {
		enabled?: boolean;
		setMethod?: string;
		getMethod?: string;
		heightProperty?: string;
		callbackTimeout?: number;
		fallbackHeight?: number;
		options?: Record<string, unknown>;
	};
	launch?: {
		scheme?: string;
		path?: string;
		urlParam?: string;
	};
	browserFallback?: {
		queryParam?: string;
		queryValue?: string;
	};
}

interface Window {
	__APP_RUNTIME_CONFIG__?: {
		baseURL?: string;
		appContainer?: AppContainerRuntimeConfig;
	};
}

declare module "*.vue" {
	import type { DefineComponent } from "vue";

	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
	export default component;
}
