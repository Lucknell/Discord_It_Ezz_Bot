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
        .setName('santastats')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers)
        .setDescription('I wish to check the secret santa status')
		.addStringOption(option =>
			option.setName('level')
				.setDescription('How much detail do you want to see?')
				.setRequired(true)
				.addChoices(
					{ name: 'Standard', value: 'standard' },
					{ name: 'Detail', value: 'detail' },)),
    async execute(interaction) {
        let type = interaction.options.getString('level');
        the_table = `table_${interaction.guildId}.santa`
        query = `SELECT * FROM ${the_table} where guild_id='${interaction.guildId}'`
        const cqlshList = elem => ` '${elem}' `;
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
        if (type === 'standard') {
            text = "Secret Santa Stats\n"
            var users = user_entry.users.length;
            var sent = 0;
            if (user_entry.sent) sent = user_entry.sent.length;
            var received = 0;
            if (user_entry.received) received = user_entry.received.length;
            text += "Sent: " + sent + "/"+ users +"\nReceived: " +
                        received + "/" + users;
            return interaction.reply(text);
        }
        if (user_entry.creator === interaction.user.id) {
            text = "Secret Santa Stats\n"
            for (i in user_entry.users) {
                record = user_entry.users[i];
                text += "<@!" + record +"> ";
                if (user_entry.sent && user_entry.sent.includes(record)) {
                        text += "has sent a gift";
                } else {
                    text += "has not sent a gift";
                }
                if (user_entry.received && user_entry.received.includes(record)) {
                        text += " and has received a gift\n";
                } else {
                    text += " and has not received a gift\n";
                }
            }
            var users = user_entry.users.length;
            var sent = 0;
            if (user_entry.sent) sent = user_entry.sent.length;
            var received = 0;
            if (user_entry.received) received = user_entry.received.length;
                        text += "Sent: " + sent + "/"+ users +"\nReceieved: " +
                        received + "/" + users;
            return interaction.reply(text);
        } else {
            return interaction.reply("Only <@!" + user_entry.creator + "> can show detail.")
        }
    }
};
