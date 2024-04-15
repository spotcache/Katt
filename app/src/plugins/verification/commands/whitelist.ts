import {
    ChatInputCommandInteraction
} from "discord.js";

import { 
    CommandTypes,
    SlashCommandContexts,
    IntegrationTypes,
    OptionTypes,
    Permissions,
    Command
} from "../../../types/command";
import { KiwiClient } from "../../../client";

import { dataSource } from "../../../data/datasource";
import { Whitelist } from "../../../data/entities/Whitelist";

export const WhitelistCmd: Command = {
    config: {
        name: "whitelist",
        description: "Whitelist Commands",
        type: CommandTypes.CHAT_INPUT,
        default_member_permissions: Permissions.ManageGuild,
        contexts: [SlashCommandContexts.GUILD],
        integration_types: [IntegrationTypes.GUILD],
        options: [
            {
                type: OptionTypes.SUB_COMMAND,
                name: "add",
                description: "Add a user to the whitelist",
                options: [
                    {
                        type: OptionTypes.USER,
                        name: "user",
                        description: "The user to be added to the whitelist",
                        required: true
                    },
                    {
                        type: OptionTypes.STRING,
                        name: "level",
                        description: "The level of the users whitelist",
                        required: true,
                        choices: [
                            { name: "Guest", value: "1" },
                            { name: "Member", value: "2" },
                            { name: "Bot", value: "3" },
                            { name: "Admin", value: "4" }
                        ]
                    }
                ]
            },
            {
                type: OptionTypes.SUB_COMMAND,
                name: "remove",
                description: "Remove a user from the whitelist",
                options: [
                    {
                        type: OptionTypes.USER,
                        name: "user",
                        description: "The user to remove from the whitelist",
                        required: true
                    }
                ]
            },
            {
                type: OptionTypes.SUB_COMMAND,
                name: "view",
                description: "View the whitelist",
            }
        ]
    },

    /**
    * @param {ChatInputCommandInteraction} interaction
    * @param {KiwiClient} client
    */
    async execute(interaction: ChatInputCommandInteraction, client: KiwiClient): Promise<void> {
        const WhitelistRepository = await dataSource.getRepository(Whitelist);

        switch (interaction.options.getSubcommand()) {
            case "add": {
                var user = interaction.options.getUser("user");
                if (!user) {
                    interaction.reply("User not found");
                    return;
                }
                var userTag = await client.getTag({name: user.username, discriminator: user.discriminator});
                var lvl = interaction.options.getString("level");

                if (user.bot && lvl !== "3") {
                    interaction.reply("You can only whitelist bots as bots");
                    return;
                }

                if (!user.bot && lvl === "3") {
                    interaction.reply("You can not whitelist users as bots");
                    return;
                }

                if (lvl === "3" && interaction.guild.ownerId !== interaction.user.id) {
                    interaction.reply("You must be the owner of the server to whitelist bots");
                    return;
                }
                
                const whitelistUser = await WhitelistRepository.findOne(
                    { where: { guildId: interaction.guild.id, userId: user.id } }
                );
                if (whitelistUser && whitelistUser.level <= lvl) {
                    interaction.reply(`**${userTag}** is already whitelisted`);

                } else if (whitelistUser && whitelistUser.level !== lvl) {
                    await WhitelistRepository.update(
                        { guildId: interaction.guild.id, userId: user.id },
                        { level: lvl }
                    );
                    interaction.reply(`**${userTag}** whitelist has been updated`);

                } else {
                    await WhitelistRepository.insert({
                        guildId: interaction.guild.id,
                        userId: user.id,
                        username: user.username,
                        level: lvl,
                        createdBy: interaction.user.id
                    });
                    interaction.reply(`**${userTag}** has been whitelisted`);
                };
                break;
            }
            case "remove": {
                var user = interaction.options.getUser("user");
                if (!user) {
                    interaction.reply("User not found");
                    return;
                };
                var userTag = await client.getTag({name: user.username, discriminator: user.discriminator});

                const whitelistUser = await WhitelistRepository.findOne(
                    { where: { guildId: interaction.guild.id, userId: user.id } }
                );
                if (!whitelistUser) {
                    interaction.reply(`**${userTag}** is not whitelisted`);
                    return;
                };
                
                await WhitelistRepository.delete({ guildId: interaction.guild.id, userId: user.id })
                interaction.reply(`**${userTag}** has been removed from the whitelist`);
                break;
            }
            case "view": {
                const whitelistUsers = await WhitelistRepository.find(
                    { where: { guildId: interaction.guild.id } }
                );
                if (!whitelistUsers) {
                    interaction.reply("No users have been whitelisted");
                    return;
                }

                interaction.reply(`**Whitelisted Users**\n${whitelistUsers.map(user => `${user.username}`).join("\n")}`);
                break;
            }
        }
    }
}