import { Plugin } from "../../types/plugin";

import { PromoteSlash } from "./commands/promote";

import { GuildCreate } from "./events/guildCreate";
import { GuildMemberUpdate } from "./events/guildMemberUpdate";
import { GuildReady } from "./events/guildReady";
import { GuildUpdate } from "./events/guildUpdate";

/**
 * @type {Plugin}
 */
export const RolesPlugin: Plugin = {
    config: {
        name: "Roles",
        disableable: true
    },
    SlashCommands: [
        PromoteSlash
    ],
    events: [
        GuildCreate,
        GuildMemberUpdate,
        GuildReady,
        GuildUpdate
    ],
    afterLoad: async () => {
        console.log(`Loaded Roles Plugin`)
    }
}