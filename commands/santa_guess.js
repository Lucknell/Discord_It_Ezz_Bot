const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');

const { DateTime } = require("luxon");

const cassandra = require('cassandra-driver');

const util = require('../util.js');

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});

const replies = ["Christmas is ruined because you ran the commands out of order.", "Hold your horses, you can't hear Mariah Carey's singing just yet..."]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Let\'s play a game of who got who')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who do you think got you for secret santa?')
                .setRequired(true)),
    async execute(interaction) {
        the_table = `table_${interaction.guildId}.santa`
        query = `SELECT * FROM ${the_table} where guild_id='${interaction.guildId}'`
        var resultSelectWhere = await cassie.execute(query).catch((err) => {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        });
        const santa_entry = resultSelectWhere;
        console.log(santa_entry);
        if (santa_entry === null) {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        }
        if (santa_entry.rows.length === 0) {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        }
        if (santa_entry.rows[0].year !== DateTime.now().setZone("America/Los_Angeles").year) {
            return interaction.reply("no secret santa for this year")
        }
        if (!santa_entry.rows[0].users.includes(interaction.user.id)) {
            return interaction.reply("LOOK THIS GUY, NOT SECRET SANTA AND WANTED TO GUESS WHO THEY GOT. YOU THOUGHT.\n :rofl::rofl::rofl:")
        }
        the_table = `table_${interaction.guildId}.santa_guess`;
        guessed_user = interaction.options.getUser('user');
        if (guessed_user.bot) {
            return interaction.reply('Bots are not part of secret santa.')
        }
        interaction.reply({content: 'I have added your guess. Good luck!\n click the *Check* button on the game to get there results live in the channel!', ephemeral: true})
        query = `CREATE TABLE IF NOT EXISTS ${the_table} (user_id text PRIMARY KEY, year int, guessed_user text)`;
        await cassie.execute(query);
        query = `INSERT INTO ${the_table} ("user_id", "year", "guessed_user") VALUES ('${interaction.user.id}', ${DateTime.now().setZone("America/Los_Angeles").year}, '${guessed_user.id}')`;
        await cassie.execute(query);
        console.log("done")
    },
};
