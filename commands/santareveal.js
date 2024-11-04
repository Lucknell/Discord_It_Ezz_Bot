const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const { DateTime } = require("luxon");

const fs = require('fs');

const util = require('../util.js');

const replies = ["Christmas is ruined because you ran the commands out of order.", "Hold your horses, you can't hear Mariah Carey's singing just yet..."]

const cassandra = require('cassandra-driver');

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('santareveal')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers)
        .setDescription('I wish to show who got who'),
    async execute(interaction) {
        the_table = `table_${interaction.guildId}.santa`
        query = `SELECT * FROM ${the_table} where guild_id='${interaction.guildId}'`
        var resultSelectWhere = await cassie.execute(query).catch((err) => {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        });
        if (resultSelectWhere.rows.length === 0) {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        }
        user_entry = resultSelectWhere.rows[0];
        if (!user_entry.users.includes(interaction.user.id)) {
            return interaction.reply("LOOK THIS GUY, NOT THE CREATOR AND WANTED TO SEE STATS IN DETAIL. YOU THOUGHT.\n :rofl::rofl::rofl:")
        }
        if (user_entry.year !== DateTime.now().setZone("America/Los_Angeles").year) {
            return interaction.reply("no secret santa for this year")
        }
        text = "Secret Santa Reveal\n"
        for (i in user_entry.pairs) {
            pair = user_entry.pairs[i];
            var user1 = pair.split("\t")[0]
            var user2 = pair.split("\t")[1]
            let santa1 = interaction.guild.members.cache.get(user1).user;
            let santa2 = interaction.guild.members.cache.get(user2).user;
            text += `${santa1.username} ➡️ ${santa2.username}\n`;
            }
        return interaction.reply(text);
    } 
};
