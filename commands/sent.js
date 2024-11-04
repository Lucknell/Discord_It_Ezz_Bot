const { SlashCommandBuilder } = require('discord.js');

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
        .setName('sentgift')
        .setDescription('I sent my secret santa gift and I want the world to know it!')
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether or not the echo should be ephemeral')),
    async execute(interaction) {
        the_table = `table_${interaction.guildId}.santa`
        query = `SELECT * FROM ${the_table} where guild_id='${interaction.guildId}'`
        const cqlshList = elem => ` '${elem}' `;
        const ephemeral = interaction.options.getBoolean("ephemeral") ?? true;

        var resultSelectWhere = await cassie.execute(query).catch((err) => {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        });
        if (resultSelectWhere.rows.length === 0) {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        }
        user_entry = resultSelectWhere.rows[0];
        if (!user_entry.users.includes(interaction.user.id)) {
            return interaction.reply("LOOK THIS GUY IS NOT PART OF SECRET SANTA AND WANTED TO SAY THEY SENT A GIFT.\n :rofl::rofl::rofl:")
        }
        if (user_entry.year !== DateTime.now().setZone("America/Los_Angeles").year) {
            return interaction.reply("no secret santa for this year")
        }
        if (!user_entry.sent) {
            users = [interaction.user.id];
            query = `UPDATE ${the_table} SET "sent" = [${users.map(cqlshList)}] where guild_id = '${interaction.guildId}'`;
            await cassie.execute(query);
            return interaction.reply({content: "You are first to send a gift.", ephemeral: ephemeral })
        } else if (user_entry.sent.includes(interaction.user.id)) {
            return interaction.reply({content: "You are already counted thanks for letting us know you forgot.\n The total is " + user_entry.sent.length, ephemeral: ephemeral})
        } else {
            users = user_entry.sent
            users.push(interaction.user.id)
            query = `UPDATE ${the_table} SET "sent" = [${users.map(cqlshList)}] where guild_id = '${interaction.guildId}'`;
            await cassie.execute(query);
            return interaction.reply({content: "You are counted as a user that has sent a gift.\n The total is " + user_entry.sent.length, ephemeral: ephemeral})
        }
    }
}