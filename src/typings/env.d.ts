/// <reference types="vite/client" />

interface Window {
	__APP_RUNTIME_CONFIG__?: {
		baseURL?: string;
		loadingType?: "dots" | "ring" | "pulse";
	};
}

declare module "ym-jsbridge" {
	interface YmJsBridge {
		inApp: boolean;
		ready(callback: () => void): void;
		getStatusBar(callback: (success: boolean, statusBar: unknown) => void): void;
		setStatusBar(
			options: {
				visible?: boolean;
				contentStyle?: "default" | "light" | "dark";
				backgroundColor?: string;
				overlays?: boolean;
			},
			callback?: (success: boolean, result: unknown) => void
		): void;
	}

	const jsBridge: YmJsBridge;
	export default jsBridge;
}

declare module "*.vue" {
	import type { DefineComponent } from "vue";

	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
	export default component;
}
