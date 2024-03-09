const { Client, GuildMember } = require("discord.js");
const Database = require("../data/database");

module.exports = {
    name: "guildMemberUpdate",

    /**
    * 
    * @param {Client} client
    * @param {GuildMember} oldMember
    * @param {GuildMember} newMember
    */
    async execute(client, oldMember, newMember) {
        if (oldMember.nickname !== newMember.nickname) {
            var exist = await Database.query(`SELECT * FROM nicknames WHERE userId = '${newMember.id}' AND guildId = '${newMember.guild.id}'`, { plain: false, logging: false });
            if (exist) {
                await Database.query(`UPDATE nicknames SET nickname = '${newMember.nickname}' WHERE userId = '${newMember.id}' AND guildId = '${newMember.guild.id}'`, { logging: false });
            } else {
                await Database.query(`INSERT INTO nicknames (userId, guildId, nickname) VALUES ('${newMember.id}', '${newMember.guild.id}', '${newMember.nickname}')`, { logging: false });
            }
        }

        if (oldMember.roles.cache.size > newMember.roles.cache.size) {
            oldMember.roles.cache.forEach(role => {
                if (!newMember.roles.cache.has(role.id)) {
                    Database.query(`DELETE FROM userRoles WHERE userId = '${newMember.id}' AND guildId = '${newMember.guild.id}' AND roleId = '${role.id}'`, { logging: false });
                }
            });
        } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
            newMember.roles.cache.forEach(async role => {
                if (!oldMember.roles.cache.has(role.id)) {
                    if (role.name !== "@everyone") {
                        var exist = await Database.query(`SELECT roleId FROM userRoles WHERE userId = '${newMember.user.id}' AND guildId = '${newMember.guild.id}' AND roleId = '${role.id}'`, { plain: false, logging: false });
                        if (!exist) {
                            Database.query(`INSERT INTO userRoles (userId, guildId, roleId) values ('${newMember.id}', '${newMember.guild.id}', '${role.id}')`, { logging: false })
                        }
                    }
                }
            });
        }
    }
}