const util = require('./util.js');
const fs = require('fs');
const Discord = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const grades = ["Z", "F", "E", "D", "C-", "C", "C+", "B-", "B", "B+", "A--", "A---", "A", ":poop:", "A+"];

const cassandra = require('cassandra-driver');

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});

async function reportCard(interaction) {
    the_table = `table_${interaction.guildId}.grades`
    query = `SELECT * FROM ${the_table} where requestor='${interaction.user.id}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length === 0) {
        query = `INSERT INTO ${the_table} ("requestor", "english", "history", "math", "music", "reading", "science", "score") VALUES ('${interaction.user.id}', 0, 0, 0, 0, 0, 0, 0)`;
        await cassie.execute(query);
        const embedMessage = new EmbedBuilder().setColor('#ff0000');
        embedMessage.setTitle("Report card for " + interaction.user.username + " in " + interaction.guild.name);
        embedMessage.addFields({ name: "Math", value: "Z" });
        embedMessage.addFields({ name: "Reading", value: "Z" });
        embedMessage.addFields({ name: "English", value: "Z" });
        embedMessage.addFields({ name: "History", value: "Z" });
        embedMessage.addFields({ name: "Science", value: "Z" });
        embedMessage.addFields({ name: "Music", value: "Z" });
        embedMessage.addFields({ name: "Score", value: "0" });
        try {
            interaction.reply({ embeds: [embedMessage] });
        } catch (err) {
            interaction.followup({ embeds: [embedMessage] });
        }

    } else {
        const embedMessage = new EmbedBuilder().setColor('#ff00ff');
        entry = resultSelectWhere.rows[0]
        embedMessage.setTitle("Report card for " + interaction.user.username + " in " + interaction.guild.name);
        grade = grades[entry.math];
        embedMessage.addFields({ name: "Math", value: grade });
        grade = grades[entry.reading];
        embedMessage.addFields({ name: "Reading", value: grade });
        grade = grades[entry.english];
        embedMessage.addFields({ name: "English", value: grade });
        grade = grades[entry.history];
        embedMessage.addFields({ name: "History", value: grade });
        grade = grades[entry.science];
        embedMessage.addFields({ name: "Science", value: grade });
        grade = grades[entry.music];
        embedMessage.addFields({ name: "Music", value: grade });
        embedMessage.addFields({ name: "Score", value: entry.score + "" });
        try {
            interaction.reply({ embeds: [embedMessage] });
        } catch (err) {
            interaction.followup({ embeds: [embedMessage] });
        }

    }
}

async function turnIn(interaction) {
    const grade = interaction.options.getString('grade').toUpperCase();
    if (grade === 'MATH') {
        updateGrade("Math", interaction);
    } else if (grade === 'READING') {
        updateGrade("Reading", interaction);
    } else if (grade === 'ENGLISH') {
        updateGrade("English", interaction);
    } else if (grade === 'HISTORY') {
        updateGrade("History", interaction);
    } else if (grade === 'SCIENCE') {
        updateGrade("Science", interaction);
    } else if (grade === 'MUSIC') {
        updateGrade("Music", interaction);
    } else {
        interaction.reply(`This is impossible to see`)
    }
}

function maxOutGrades(interaction) {
    return maxGrade(interaction);
}

async function updateGrade(subject, interaction) {
    the_table = `table_${interaction.guildId}.grades`
    query = `SELECT * FROM ${the_table} where requestor='${interaction.user.id}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length === 0) {
        query = `INSERT INTO ${the_table} ("requestor", "english", "history", "math", "music", "reading", "science", "score") VALUES ('${interaction.user.id}', 0, 0, 0, 0, 0, 0, 0)`;
        return await cassie.execute(query);
    }
    item = resultSelectWhere.rows[0];
    switch (subject) {
        case "Math":
            list = checkGrade(item.math, item.score, interaction, true);
            item.math = list[0];
            item.score = list[1];
            break;
        case "Reading":
            list = checkGrade(item.reading, item.score, interaction, true);
            item.reading = list[0];
            item.score = list[1];
            break;
        case "English":
            list = checkGrade(item.english, item.score, interaction, true);
            item.english = list[0];
            item.score = list[1];
            break;
        case "History":
            list = checkGrade(item.history, item.score, interaction, true);
            item.history = list[0];
            item.score = list[1];
            break;
        case "Science":
            list = checkGrade(item.science, item.score, interaction, true);
            item.science = list[0];
            item.score = list[1];
            break;
        case "Music":
            list = checkGrade(item.music, item.score, interaction, true);
            item.music = list[0];
            item.score = list[1];
            break;
        default:
            interaction.reply("You really shouldn't be seeing this...");
            return;
    }
    query = `DELETE FROM ${the_table} where requestor='${interaction.user.id}'`
    await cassie.execute(query);
    query = `INSERT INTO ${the_table} ("requestor", "english", "history", "math", "music", "reading", "science", "score") VALUES ('${interaction.user.id}', ${item.english}, ${item.history},${item.math}, ${item.music}, ${item.reading}, ${item.science}, ${item.score})`;
    await cassie.execute(query);
    reportCard(interaction);
}


async function maxGrade(interaction) {
    const subject = interaction.options.getString('grade').toUpperCase();
    the_table = `table_${interaction.guildId}.grades`
    query = `SELECT * FROM ${the_table} where requestor='${interaction.user.id}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length === 0) {
        query = `INSERT INTO ${the_table} ("requestor", "english", "history", "math", "music", "reading", "science", "score") VALUES ('${interaction.user.id}', 0, 0, 0, 0, 0, 0, 0)`;
        interaction.reply("say something first then max out.")
        return await cassie.execute(query);
    }
    item = resultSelectWhere.rows[0];
    items = [-1, -1];
    switch (subject) {
        case "MATH":
            list = checkGrade(item.math, item.score, interaction, false);
            while (list[0] !== items[0] && list[1] !== items[1]) {
                items[0] = list[0];
                items[1] = list[1];
                item.math = list[0];
                item.score = list[1];
                list = checkGrade(item.math, item.score, interaction, false);
            }
            break;
        case "READING":
            list = checkGrade(item.reading, item.score, interaction, false);
            while (list[0] !== items[0] && list[1] !== items[1]) {
                items[0] = list[0];
                items[1] = list[1];
                item.reading = list[0];
                item.score = list[1];
                list = checkGrade(item.reading, item.score, interaction, false);
            }
            break;
        case "ENGLISH":
            list = checkGrade(item.english, item.score, interaction, false);
            while (list[0] !== items[0] && list[1] !== items[1]) {
                items[0] = list[0];
                items[1] = list[1];
                item.english = list[0];
                item.score = list[1];
                list = checkGrade(item.english, item.score, interaction, false);
            }
            break;
        case "HISTORY":
            list = checkGrade(item.history, item.score, interaction, false);
            while (list[0] !== items[0] && list[1] !== items[1]) {
                items[0] = list[0];
                items[1] = list[1];
                item.history = list[0];
                item.score = list[1];
                list = checkGrade(item.history, item.score, interaction, false);
            }
            break;
        case "SCIENCE":
            list = checkGrade(item.science, item.score, interaction, false);
            while (list[0] !== items[0] && list[1] !== items[1]) {
                items[0] = list[0];
                items[1] = list[1]; item.science = list[0];
                item.score = list[1];
                list = checkGrade(item.science, item.score, interaction, false);
            }
            break;
        case "MUSIC":
            list = checkGrade(item.music, item.score, interaction, false);
            while (list[0] !== items[0] && list[1] !== items[1]) {
                items[0] = list[0];
                items[1] = list[1];
                item.music = list[0];
                item.score = list[1];
                list = checkGrade(item.music, item.score, interaction, false);
            }
            break;
        default:
            interaction.reply("You really shouldn't be seeing this...");
            return;
    }
    query = `DELETE FROM ${the_table} where requestor='${interaction.user.id}'`
    await cassie.execute(query);
    query = `INSERT INTO ${the_table} ("requestor", "english", "history", "math", "music", "reading", "science", "score") VALUES ('${interaction.user.id}', ${item.english}, ${item.history},${item.math}, ${item.music}, ${item.reading}, ${item.science}, ${item.score})`;
    await cassie.execute(query);
    reportCard(interaction);
}

function checkGrade(item, score, interaction, notify) {
    if (item >= grades.length - 1) {
        if (notify) {
            interaction.reply("You are already maxed out");
        }
        return [item, score];
    }
    multipilier = 7
    if (score < ((item + 1) * multipilier)) {
        if (notify) {
            interaction.reply("Your score is too low.");
        }
        return [item, score]
    }
    item += 1;
    score -= item * multipilier;
    return [item, score];
}

async function resetGrades(interaction) {
    the_table = `table_${interaction.guildId}.grades`
    query = `DELETE FROM ${the_table} where requestor='${interaction.user.id}'`
    await cassie.execute(query);
    query = `INSERT INTO ${the_table} ("requestor", "english", "history", "math", "music", "reading", "science", "score") VALUES ('${interaction.user.id}', 0, 0, 0, 0, 0, 0, 0)`;
    await cassie.execute(query);
    interaction.reply("The deed is done");
}

async function goodbyeTien(interaction) {
    the_table = `table_${interaction.guildId}.grades`
    query = `DROP TABLE ${the_table}`
    await cassie.execute(query);
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (requestor text PRIMARY KEY, english int, history int , math int, music int, reading int, science int , score int)`;
    await cassie.execute(query);
    console.log(interaction.user.username + " has reset all grades in " + interaction.guild.name)
    interaction.reply("I could destroy the whole world with this one.")
}

module.exports = { reportCard, turnIn, resetGrades, maxOutGrades, goodbyeTien }