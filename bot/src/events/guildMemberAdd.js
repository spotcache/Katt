const {
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
    EmbedBuilder,
	Client,
    GuildMember
} = require("discord.js");
const Database = require("../data/database");

module.exports = {
    name: "guildMemberAdd",

    /**
    * 
    * @param {Client} client
    * @param {GuildMember} member
    */
    async execute(client, member) {
        var nicknames = await Database.query(`SELECT nickname FROM nicknames WHERE userId = '${member.id}' AND guildId = '${member.guild.id}'`, { plain: false, logging: false });
        if (nicknames) {
            await member.setNickname(nicknames.nickname);
        }

        var servers = await Database.query(`SELECT pendingChannel, verificationAdmin FROM servers WHERE guildId = '${member.guild.id}'`, { plain: true, logging: false });

		if (servers.pendingChannel) {
            var pendingChannel = await member.guild.channels.fetch(servers.pendingChannel);

            var adminPing;
            if (servers.verificationAdmin) {
                adminPing = `<@&${servers.verificationAdmin}>`;
            }

            var em = new EmbedBuilder()
                .setTitle(member.user.username + "#" + member.user.discriminator)
                .setThumbnail(member.user.avatarURL())
                .setFields(
                    { name: "Mention", value: `<@${member.user.id}>`},
                    { name: "Created", value: member.user.createdAt.toDateString() }
                )
                .setColor(0xADD8E6);

            var acceptButton = new ButtonBuilder()
				.setCustomId('accept-member_' + member.user.id)
				.setLabel("Accept")
				.setStyle(ButtonStyle.Success);

            var ignoreButton = new ButtonBuilder()
				.setCustomId('ignore-member_' + member.user.id)
				.setLabel("Ignore")
				.setStyle(ButtonStyle.Danger);

            var row = new ActionRowBuilder()
                .addComponents([acceptButton, ignoreButton])

            await pendingChannel.send({
                content: adminPing,
                embeds: [em],
                components: [row]
            });
        }
    }
}