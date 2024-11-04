const fs = require('fs');

const utf8 = require('utf8');

const util = require('./util.js');

const { DateTime } = require("luxon");

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');

const cassandra = require('cassandra-driver');

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});

async function addMessage(interaction) {
    trigger = interaction.options.getString('trigger');
    reply = interaction.options.getString('reply');
    trigger = trigger.trim();
    reply = reply.trim();
    phrase = trigger.split(' ');
    if (phrase.length < 2) {
        return addWord(interaction, trigger, reply);
    }
    return addPhrase(interaction, trigger, reply);
}

async function modifyMessage(interaction) {
    trigger = interaction.options.getString('trigger');
    reply = interaction.options.getString('reply');
    trigger = trigger.trim();
    reply = reply.trim();
    phrase = trigger.split(' ');
    if (phrase.length < 2) {
        return modifyWord(interaction, trigger, reply);
    }
    return modifyPhrase(interaction, trigger, reply);
}

function returnUserID(user) {
    return user.trim().replaceAll("<", "").replaceAll("@", "").replaceAll("!", "").replaceAll("&", "").replaceAll("#", "").replaceAll(">", "")
}

async function addBirthday(interaction) {
    date = interaction.options.getString('date');
    user = interaction.options.getString('user');
    if (!(date.includes("/"))) {
        return interaction.reply("Please add a valid date in MM/DD");
    }
    thedate = date.split("/");
    if (isNaN(thedate[0]) || isNaN(thedate[1]) || thedate.length !== 2) {
        return interaction.reply("Please provide valid numbers for the date.")
    }
    if (!(DateTime.fromObject({ month: parseInt(thedate[0]), day: parseInt(thedate[1]) }).isValid)) {
        return interaction.reply("Please add a valid date in the format MM/DD");
    }
    if (user !== null) {
        interaction.guild.members.fetch(returnUserID(user)).catch((error) => {
            return interaction.reply("invalid user id given\n" + error + "\n" + user);
        });
    }
    the_table = `table_${interaction.guildId}.birthdays`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (user_id text PRIMARY KEY, user text, birthday text, requestor text)`;
    cassie.execute(query);
    var userID = interaction.user.id;
    if (user !== null) {
        userID = returnUserID(user);
    }
    query = `SELECT * FROM ${the_table} where user_id='${userID}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length > 0) {
        return interaction.reply("Birthday is already stored please remove.");
    }
    interaction.guild.members.fetch(userID).then((member => {
        query = `INSERT INTO ${the_table} ("user", "user_id" , "birthday", "requestor", "month", "day") VALUES ('${member.user.tag}', '${member.user.id}', '${date}', '${interaction.user.id}', ${thedate[0]}, ${thedate[1]})`;
        cassie.execute(query);
        interaction.reply('Saved.');
    }));
}

async function addPhrase(interaction, trigger, reply) {
    the_table = `table_${interaction.guildId}.phrases`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (trigger text PRIMARY KEY, reply text, requestor text)`;
    await cassie.execute(query);
    query = `SELECT * FROM ${the_table} where trigger='${trigger.toUpperCase()}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length > 0) {
        return interaction.reply("phrase is already stored please remove.");
    }
    query = `INSERT INTO ${the_table} ("trigger", "reply" , "requestor") VALUES ('${trigger.toUpperCase()}', '${reply}', '${interaction.user.username}')`;
    await cassie.execute(query);
    interaction.reply({ content: 'Saved.', ephemeral: true });
}

async function addWord(interaction, trigger, reply) {
    the_table = `table_${interaction.guildId}.word`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (trigger text PRIMARY KEY, reply text, requestor text)`;
    await cassie.execute(query);
    query = `SELECT * FROM ${the_table} where trigger='${trigger.toUpperCase()}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length > 0) {
        return interaction.reply("word is already stored please remove.");
    }
    query = `INSERT INTO ${the_table} ("trigger", "reply" , "requestor") VALUES ('${trigger.toUpperCase()}', '${reply}', '${interaction.user.username}')`;
    await cassie.execute(query);
    interaction.reply({ content: 'Saved.', ephemeral: true });
}

async function modifyPhrase(interaction, trigger, reply) {
    let phrase_file = "config/" + interaction.guildId + "/phrase.json";
    let remove_file = "config/" + interaction.guildId + "/remove.json"
    return remove_modify_Phrase(interaction, trigger, reply, phrase_file, remove_file, false);
}

async function modifyWord(interaction, trigger, reply) {
    let word_file = "config/" + interaction.guildId + "/word.json";
    let remove_file = "config/" + interaction.guildId + "/remove.json";
    return remove_modify_word(interaction, trigger, reply, word_file, remove_file, false);
}

async function removeWord(interaction, trigger) {
    let word_file = "config/" + interaction.guildId + "/word.json";
    let remove_file = "config/" + interaction.guildId + "/remove.json";
    return remove_modify_word(interaction, trigger, undefined, word_file, remove_file, true);
}

async function removePhrase(interaction, trigger) {
    let phrase_file = "config/" + interaction.guildId + "/phrase.json";
    let remove_file = "config/" + interaction.guildId + "/remove.json"
    return remove_modify_Phrase(interaction, trigger, undefined, phrase_file, remove_file, true);
}

async function removeMessage(interaction) {
    trigger = interaction.options.getString('trigger');
    if (trigger.split(" ").length === 1) {
        removeWord(interaction, trigger);
    } else {
        removePhrase(interaction, trigger);
    }
}

async function remove_modify_word(interaction, trigger, reply, word_file, remove_file, remove) {
    the_table = `table_${interaction.guildId}.word`
    query = `SELECT * FROM ${the_table} where trigger='${trigger.toUpperCase()}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length === 0) {
        return interaction.reply('You did something wrong because \'' + trigger + '\' was not found...');
    } else if (!remove) {
        query = `DELETE FROM ${the_table} WHERE trigger='${trigger.toUpperCase()}'`
        await cassie.execute(query);
        query = `INSERT INTO ${the_table} ("trigger", "reply" , "requestor") VALUES ('${trigger.toUpperCase()}', '${reply}', '${interaction.user.username}')`;
        await cassie.execute(query);
        return interaction.reply({ content: 'Found and edited!', ephemeral: true });
    } else {
        query = `DELETE FROM ${the_table} WHERE trigger='${trigger.toUpperCase()}'`
        await cassie.execute(query);
        return interaction.reply('Found and removed!');
    }
}

async function remove_modify_Phrase(interaction, trigger, reply, phrase_file, remove_file, remove) {
    the_table = `table_${interaction.guildId}.phrases`
    query = `SELECT * FROM ${the_table} where trigger='${trigger.toUpperCase()}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length === 0) {
        return interaction.reply('You did something wrong because \'' + trigger + '\' was not found...');
    } else if (!remove) {
        query = `DELETE FROM ${the_table} WHERE trigger='${trigger.toUpperCase()}'`
        await cassie.execute(query);
        query = `INSERT INTO ${the_table} ("trigger", "reply" , "requestor") VALUES ('${trigger.toUpperCase()}', '${reply}', '${interaction.user.username}')`;
        await cassie.execute(query);
        return interaction.reply({ content: 'Found and edited!', ephemeral: true });
    } else {
        query = `DELETE FROM ${the_table} WHERE trigger='${trigger.toUpperCase()}'`
        await cassie.execute(query);
        return interaction.reply('Found and removed!');
    }
}

async function removeBirthday(interaction) {
    user = interaction.options.getString('user');
    if (user !== null) {
        interaction.guild.members.fetch(returnUserID(user)).catch((error) => {
            return interaction.reply("invalid user id given\n" + error + "\n" + user);
        });
    }
    the_table = `table_${interaction.guildId}.birthdays`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (user_id text PRIMARY KEY, user text, birthday text, requestor text)`;
    cassie.execute(query);
    var userID = interaction.user.id;
    if (user !== null) {
        userID = returnUserID(user);
    }
    query = `SELECT * FROM ${the_table} where user_id='${userID}'`
    resultSelectWhere = await cassie.execute(query);
    console.log(query, resultSelectWhere.rows)
    if (resultSelectWhere.rows.length > 0) {
        query = `DELETE FROM ${the_table} WHERE user_id='${userID}'`
        console.log(query)
        await cassie.execute(query);
        return interaction.reply("removed!");
    } else {
        return interaction.reply("Birthday not found. No party :(");
    }
}


async function printServerData(server, index, type) {
    let pages = Math.ceil(server.length / 10)
    if (index >= pages) {
        index = pages - 1;
    } else if (index < 0) {
        index = 0;
    }
    embedMessage = new EmbedBuilder().setColor('#ff00ff').setTitle(type).setFooter({ text: "Page " + (index + 1) + "/" + pages })
    let cap = 10 * (index + 1)
    let limit = server.length > cap ? cap : server.length
    for (var j = 10 * index; j < limit; j++) {
        if (server[j] === undefined) {
            continue;
        }
        name = 'Trigger: ' + util.decode(server[j].trigger) + '\nReply: ' + util.decode(server[j].reply);
        value = 'Requested by: ' + server[j].requestor;
        embedMessage.addFields({
            name: name,
            value: value
        });
    }
    return embedMessage;
}

async function printBirthday(server, index, type) {
    let pages = Math.ceil(server.length / 10)
    if (index >= pages) {
        index = pages - 1;
    } else if (index < 0) {
        index = 0;
    }
    server.sort(function (a, b) {
        if (parseInt(a.birthday.split("/")[0]) === parseInt(b.birthday.split("/")[0])) return parseInt(a.birthday.split("/")[1]) - parseInt(b.birthday.split("/")[1]);
        else return parseInt(a.birthday.split("/")[0]) - parseInt(b.birthday.split("/")[0]);
    });
    embedMessage = new EmbedBuilder().setColor('#ff33ff').setTitle(type).setFooter({ text: "Page " + (index + 1) + "/" + pages })
    let cap = 10 * (index + 1)
    let limit = server.length > cap ? cap : server.length
    for (var j = 10 * index; j < limit; j++) {
        embedMessage.addFields({
            name: 'User: ' + server[j].user + '\nBirthday: ' + server[j].birthday,
            value: '`added by:' + server[j].requestor + "`"
        });
    }
    return embedMessage;
}

async function currPages(index, server, type, pages) {
    console.log("Index now ", index);
    if (index < 0) {
        index = 0
    } else if (index >= pages) {
        index = pages - 1
    }
    embedMessage = null;
    if (!(type === '🎉 Birthdays 🎉')) {
        embedMessage = await printServerData(server, index, type);
    } else {
        embedMessage = await printBirthday(server, index, type);
    }
    return [index, embedMessage];
}

async function printFile(interaction) {
    type = interaction.options.getString('showtime');
    index = interaction.options.getInteger('index');
    if (!index) {
        index = 0;
    } else {
        index -= 1
    }
    if (isNaN(index)) {
        return interaction.reply('Sorry but ' + index + ' is not a number.');
    }
    if (type === 'Remove list') {
        the_table = `table_${interaction.guildId}.remove`
    } else if (type === 'User contributed phrases') {
        the_table = `table_${interaction.guildId}.phrases`
    } else if (type === '🎉 Birthdays 🎉') {
        the_table = `table_${interaction.guildId}.birthdays`
    } else {
        the_table = `table_${interaction.guildId}.word`
    }
    query = `SELECT * FROM ${the_table}`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length === 0) return interaction.reply("No data available.");
    const forward = new ButtonBuilder()
        .setCustomId('forward')
        .setLabel('Next page')
        .setStyle(ButtonStyle.Primary);
    const backward = new ButtonBuilder()
        .setCustomId('backward')
        .setLabel('Prev page')
        .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder()
        .addComponents(backward, forward);
    const list_of_entries = resultSelectWhere.rows;    
    var response = undefined;
    var embedMessage = undefined;
    if (!(type === '🎉 Birthdays 🎉')) {
        embedMessage = await printServerData(list_of_entries, index, type);
    } else {
        embedMessage = await printBirthday(list_of_entries, index, type);
    }
    response = await interaction.reply({ embeds: [embedMessage], components: [row] });
        const collector = await response.createMessageComponentCollector({componentType: ComponentType.Button, time: 60_000 });
        values = undefined;
        collector.on('collect', event => {
        let pages = Math.ceil(list_of_entries.length / 10);
        if (event.customId === "forward") {
            currPages(++index, list_of_entries, type, pages).then(function(result){
                update_interaction(result, event, row);
            });
        }
        if (event.customId === "backward") {
            currPages(--index, list_of_entries, type, pages).then(function(result){
                update_interaction(result, event, row);
            });
        }
    });
    collector.on('end', collected => {
        interaction.editReply({components: [] });
    });
}

function update_interaction(values, event, row){
    console.log(values);
    index = values[0];
    embedMessage = values[1];
    event.update({ embeds: [embedMessage], components: [row] })
}

module.exports = { addMessage, removeMessage, modifyMessage, printFile, addBirthday, removeBirthday }
