import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { parse } from "flowchart.js";

interface FlowchartJSSettings {
	custom_options: string;
}

const DEFAULT_SETTINGS: FlowchartJSSettings = {
	custom_options: "{}",
};

export default class FlowchartJSPlugin extends Plugin {
	settings: FlowchartJSSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("flow", (source, el, ctx) => {
			const chart = parse(source);
			let custom_options;

			try {
				custom_options = JSON.parse(this.settings.custom_options);
			} catch (e) {
				custom_options = {};
			}

			const canvas = el.createEl("canvas", custom_options);

			chart.drawSVG(canvas);
		});

		this.addSettingTab(new FlowchartJsSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class FlowchartJsSettingTab extends PluginSettingTab {
	plugin: FlowchartJSPlugin;

	constructor(app: App, plugin: FlowchartJSPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for flowchart.js" });
		containerEl.createEl("a", {
			text: "Example options",
			href: "https://github.com/adrai/flowchart.js/blob/c0f366147f8e69bf3607bc16c0c1419e38a018a6/example/index.html#L28-L66",
		});

		new Setting(containerEl)
			.setName("Custom options")
			.setDesc("Requires valid JSON")
			.addTextArea((text) => {
				text.setPlaceholder("{}")
					.setValue(this.plugin.settings.custom_options)
					.onChange(async (value) => {
						this.plugin.settings.custom_options = value;
						await this.plugin.saveSettings();
					});

				text.inputEl.rows = 8;
				text.inputEl.style.width = "100%";
			});
	}
}
