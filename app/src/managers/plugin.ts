import { KiwiClient } from "../client";
import { SlashCommand } from "../types/command";
import { Events } from "../types/event";
import { Plugin } from "../types/plugin";

export class PluginManager {
    public client: KiwiClient
    public plugins: Plugin[];
    public EventHandlersSet: boolean;

    constructor(client: KiwiClient) {
        this.client = client;
        this.plugins = [];
        this.EventHandlersSet = false;
    }

    load(plugin: Plugin) {
        plugin.beforeLoad?.(this.client);
        this.plugins.push(plugin);

        if (plugin.SlashCommands) {
            var SlashCommands = new Array();
            for (let command of plugin.SlashCommands) {
                command.plugin = plugin.config.name;
                SlashCommands.push(command);
            }
            this.client.CommandManager.load(SlashCommands);

            if (!this.EventHandlersSet) {
                this.client.on(Events.InteractionCreate, (interaction: any) => this.client.CommandManager.onInteraction(interaction));
            }
        }

        if (plugin.buttons) {
            var buttons = new Array();
            for (let button of plugin.buttons) {
                button.plugin = plugin.config.name;
                buttons.push(button);
            }
            this.client.ComponentManager.loadButtons(buttons);

            if (!this.EventHandlersSet) {
                this.client.on(Events.InteractionCreate, (interaction: any) => this.client.ComponentManager.onInteraction(interaction));
            }
        }

        if (plugin.events) {
            var events = new Array();
            for (let event of plugin.events) {
                event.plugin = plugin.config.name;
                events.push(event);
            }
            this.client.EventManager.load(events);
        }

        if (plugin.loops) {
            var loops = new Array();
            for (let loop of plugin.loops) {
                loop.plugin = plugin.config.name;
                loops.push(loop);
            }
            this.client.LoopManager.load(loops);
        }

        plugin.afterLoad?.(this.client);
    }
    
    loadAll(plugins: Plugin[]) {
        for (let plugin of plugins) {
            this.load(plugin);
        }
    }
}