const fs = require('fs');

const utf8 = require('utf8');

const util = require('./util.js');

const { DateTime } = require("luxon");

const { EmbedBuilder } = require('discord.js');

const cassandra = require('cassandra-driver');

async function getMessage(interaction) {
    trigger = interaction.options.getString('trigger');
    
    const client = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
    });

    query = `SELECT * FROM table_${interaction.guildId}.word where trigger='${trigger}'`;
    var resultSelectWhere = await client.execute(query);
    let output = "Found: \n"
    for (const row of resultSelectWhere.rows) {
        console.log(
            "Obtained row: %s | %s | %s ",
            row.trigger,
            row.reply,
            row.requestor
        );
        output += `row: ${row.trigger} | ${row.reply} | ${row.requestor} `;
    }
    interaction.reply(output);
    query = `SELECT * FROM table_${interaction.guildId}.word`;
    resultSelectWhere = await client.execute(query);
    for (const row of resultSelectWhere.rows) {
        console.log(
            "Obtained row: %s | %s | %s ",
            row.trigger,
            row.reply,
            row.requestor
        );
    }
    query = `SELECT * FROM table_${interaction.guildId}.phrases`;
    resultSelectWhere = await client.execute(query);
    for (const row of resultSelectWhere.rows) {
        console.log(
            "Obtained row: %s | %s | %s ",
            row.trigger,
            row.reply,
            row.requestor
        );
    }
    query = `SELECT * FROM table_${interaction.guildId}.grades`;
    resultSelectWhere = await client.execute(query);
    for (const row of resultSelectWhere.rows) {
        console.log(
            "Obtained row: %s | %d | %d | %d | %d | %d | %d | %d |",
            row.requestor,
            row.score,
            row.math,
            row.reading,
            row.english,
            row.history,
            row.science,
            row.music
        );
    }
    query = `SELECT * FROM table_${interaction.guildId}.birthday`;
    resultSelectWhere = await client.execute(query);
    for (const row of resultSelectWhere.rows) {
        console.log(
            "Obtained row: %s | %s | %s ",
            row.user,
            row.user_id,
            row.birthday,
            row.requestor
        );
    }
    query = `SELECT * FROM table_${interaction.guildId}.remove`;
    resultSelectWhere = await client.execute(query);
    for (const row of resultSelectWhere.rows) {
        console.log(
            "Obtained row: %s | %s | %s ",
            row.trigger,
            row.reply,
            row.requestor
        );
    }

}

module.exports = { getMessage }