const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	Interaction,
	Client
} = require("discord.js");
const Database = require("../data/database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('save-nickname')
		.setDescription('Saves the nickname for a user to the database')
		.addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to save the nickname for')
                .setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	/**
    * 
    * @param {Interaction} interaction
    * @param {Client} client
    */
	async execute(interaction, client) {
		var user = interaction.options.getUser("user");

		if (user.nickname) {
			var exist = await Database.query(`SELECT * FROM nicknames WHERE userId = '${user.id}' AND guildId = '${user.guild.id}'`, { plain: false, logging: false });
			if (exist) {
				await Database.query(`UPDATE nicknames SET nickname = '${user.nickname}' WHERE userId = '${user.id}' AND guildId = '${user.guild.id}'`, { logging: false });
			} else {
				await Database.query(`INSERT INTO nicknames (userId, guildId, nickname) VALUES ('${user.id}', '${user.guild.id}', '${user.nickname}')`, { logging: false });
			}
		}

		await interaction.reply({
			content: `Saved **${user.username}**'s nickname`,
			ephemeral: true
		});
	},
}