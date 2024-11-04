const fs = require('fs');
const path = require('path');

const { DateTime } = require("luxon");

const cassandra = require('cassandra-driver');

const clientID = "749089105241178173";

const wait = require('node:timers/promises').setTimeout;

const replies = ["Christmas is ruined because you ran the commands out of order.", "Hold your horses, you can't hear Mariah Carey's singing just yet..."]

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});
//Thank you Mozilla
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function isEqualIgnoreCase(str1, str2) {
    return (str1 + '').toUpperCase().trim() === (str2 + '').toUpperCase().trim();
}

function itEzzReply(pattern, reply, msg, message) {
    regex = new RegExp(pattern, 'gi');
    if (regex.test(msg)) {
        message.reply(reply);
        return;
    }
}

function itEzzMessage(pattern, reply, msg, message) {
    regex = new RegExp(pattern, 'gi');
    if (regex.test(msg)) {
        message.channel.send(reply);
        if (message.mentions.users.size > 0) {
            let user = message.mentions.users.first();
            userId = user ? user.id : undefined;
            message.channel.send("<@!" + userId + ">");
        }
        return;
    }
}

function encode(string) {
    return string.replaceAll("’", "&#39").replaceAll("'", "&#39").replaceAll("!", "&#33").replaceAll("?", "&#63").replaceAll("\"", "&#34").replaceAll("%", "&#37").replaceAll("-", "&#45").replaceAll("=", "&#61").replaceAll(":", "&#58")
}
function decode(string) {
    return string.replaceAll("&#39", "'").replaceAll("&#33", "!").replaceAll("&#63", "?").replaceAll("&#34", "\"").replaceAll("&#37", "%").replaceAll("&#45", "-").replaceAll("&#61", "=").replaceAll("&#58", ":")
}

async function process_messages(message) {
    let msg = message.content
    let strings = msg.split(" ");
    let words = [];
    for (index in strings) {
        words.push(encode(strings[index].toUpperCase()))
    }
    query = `SELECT * FROM table_${message.guild.id}.word`;
    resultSelectWhere = await cassie.execute(query);
    for (const row of resultSelectWhere.rows) {
        if (words.indexOf(row.trigger.toUpperCase()) >= 0) {
            itEzzMessage(row.trigger, decode(row.reply), msg, message);
        }
    }
    query = `SELECT * FROM table_${message.guild.id}.phrases`;
    resultSelectWhere = await cassie.execute(query);
    for (const row of resultSelectWhere.rows) {
        itEzzMessage(row.trigger, decode(row.reply), encode(msg), message);
    }
    the_table = `table_${message.guild.id}.grades`
    query = `SELECT * FROM ${the_table} where requestor='${message.author.id}'`
    resultSelectWhere = await cassie.execute(query);
    if (resultSelectWhere.rows.length === 0) {
        let score = 0;
        let math = 0;
        let reading = 0;
        let english = 0;
        let history = 0;
        let science = 0;
        let music = 0;
        let requestor = message.author.id;
        query = `INSERT INTO ${the_table} ("requestor", "score" , "math", "reading", "english", "history", "science", "music") VALUES ('${requestor}', ${score}, ${math}, ${reading}, ${english}, ${history}, ${science}, ${music})`;
        cassie.execute(query);
    } else {
        let score = resultSelectWhere.rows[0].score + 1;
        let math = resultSelectWhere.rows[0].math;
        let reading = resultSelectWhere.rows[0].reading;
        let english = resultSelectWhere.rows[0].english;
        let history = resultSelectWhere.rows[0].history;
        let science = resultSelectWhere.rows[0].science;
        let music = resultSelectWhere.rows[0].music;
        let requestor = message.author.id;
        query = `INSERT INTO ${the_table} ("requestor", "score" , "math", "reading", "english", "history", "science", "music") VALUES ('${requestor}', ${score}, ${math}, ${reading}, ${english}, ${history}, ${science}, ${music})`;
        cassie.execute(query);
    }
}

async function createServerFile(id) {
    phrases = ['you know what they say']
    replies = ['It ezz what it ezz']
    var query = `CREATE KEYSPACE IF NOT EXISTS table_${id} WITH replication = {'class': 'NetworkTopologyStrategy'}`;
    await cassie.execute(query);
    the_table = `table_${id}.word`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (trigger text PRIMARY KEY, reply text, requestor text)`;
    await cassie.execute(query);
    the_table = `table_${id}.remove`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (trigger text PRIMARY KEY, reply text, requestor text)`;
    await cassie.execute(query);
    the_table = `table_${id}.phrases`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (trigger text PRIMARY KEY, reply text, requestor text)`;
    await cassie.execute(query);
    the_table = `table_${id}.grades`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (requestor text PRIMARY KEY, english int, history int , math int, music int, reading int, science int , score int)`;
    await cassie.execute(query);
    the_table = `table_${id}.birthdays`
    query = `CREATE TABLE IF NOT EXISTS ${the_table} (user_id text PRIMARY KEY, announced int, birthday text, day int, month int, requestor text, user text, year int)`;
    await cassie.execute(query);
    for (index in phrases) {
        if (phrases[index].trim().split(" ").length > 1) {
            the_table = `table_${id}.phrases`
            query = `INSERT INTO ${the_table} ("trigger", "reply" , "requestor") VALUES ('${phrases[index].trim()}', '${replies[index].trim()}', '${"Itezz"}')`;
            await cassie.execute(query);
        } else {
            the_table = `table_${id}.word`
            query = `INSERT INTO ${the_table} ("trigger", "reply" , "requestor") VALUES ('${phrases[index].trim()}', '${replies[index].trim()}', '${"Itezz"}')`;
            await cassie.execute(query);
        }
    }
    console.log("new server " + id);
}
function leftToEight() {
    var d = new Date();
    return (-d + d.setHours(8, 0, 0, 0));
}
async function truncate(value)
{
    if (value < 0) return Math.ceil(value);
    return Math.floor(value);
}

async function sendFutureBirthdayMessage(client) {
    let day = DateTime.now().setZone("America/Los_Angeles").day;
    let month = DateTime.now().setZone("America/Los_Angeles").month;
    let year = DateTime.now().setZone("America/Los_Angeles").year;
    const Guilds = client.guilds.cache.map(guild => guild.id);
    for (var i in Guilds) {
        const guild_id = Guilds[i]
        //var query = `CREATE KEYSPACE IF NOT EXISTS table_${guild_id} WITH replication = {'class': 'NetworkTopologyStrategy'}`;
        //await cassie.execute(query);
        //the_table = `table_${guild_id}.birthdays`
        //query = `CREATE TABLE IF NOT EXISTS ${the_table} (user_id text PRIMARY KEY, announced int, birthday text, day int, month int, requestor text, user text, year int)`;
        //await cassie.execute(query);
        the_table = `table_${guild_id}.birthdays`
        query = `SELECT * FROM ${the_table} where month=${month} AND day=${day} ALLOW FILTERING`
        resultSelect = await cassie.execute(query);
        resultSelect.rows.forEach(async party_ppl => {
            if (party_ppl.year === year) {
                return;
            }
            the_table = `table_${guild_id}.birthdays`
            let guild = client.guilds.cache.get(guild_id);
            let channel = guild.channels.cache.find(channel => channel.name.toLowerCase() === "general");
            channel.send("Happy Birthday <@!" + party_ppl.user_id + ">!");
            query = `UPDATE ${the_table} SET "year" = ${year}, "announced" =${year}  WHERE user_id='${party_ppl.user_id}'`
            await cassie.execute(query);
        });
        query = `SELECT * FROM ${the_table}`
        resultSelectWhere = await cassie.execute(query);
        resultSelectWhere.rows.forEach(async party_ppl => {
            if (party_ppl.day === null || party_ppl.month === null) {
                query = `DELETE FROM ${the_table} WHERE user_id='${party_ppl.user_id}'`
                console.log(query)
                await cassie.execute(query);
                return;
            }
            let days = await truncate(DateTime.local(year, party_ppl.month, party_ppl.day).setZone("America/Los_Angeles").diff(DateTime.now().setZone("America/Los_Angeles"), 'days').days);
            //console.log(party_ppl.month, party_ppl.day, days)
            if (days < 7 && days > 0) {
                if (party_ppl.announced === year) {
                    return;
                }
                the_table = `table_${guild_id}.birthdays`
                let guild = client.guilds.cache.get(guild_id);
                let channel = guild.channels.cache.find(channel => channel.name.toLowerCase() === "general");
                channel.send("Up coming birthday for <@!" + party_ppl.user_id + ">! Your birthday is on " + party_ppl.month + "/" + party_ppl.day);
                query = `UPDATE ${the_table} SET "announced" = ${year} WHERE user_id='${party_ppl.user_id}'`
                await cassie.execute(query);
               }
        });
    }
}



async function migrate(client) {
    const Guilds = client.guilds.cache.map(guild => guild.id);
    query = `CREATE TABLE itezz.grades ( guild text PRIMARY KEY, multiplier map<text,int> `
    for (var guild_id of Guilds) {
        /* the_table = `table_${guild_id}.word`
         query = `SELECT * FROM ${the_table}`
         result = await cassie.execute(query)
         for (entry of result.rows) {
             query = `DELETE FROM ${the_table} WHERE trigger='${entry.trigger}'`
             await cassie.execute(query);
             query = `INSERT INTO ${the_table} ("trigger", "reply" , "requestor") VALUES ('${entry.trigger.toUpperCase()}', '${entry.reply}', '${entry.requestor}')`;
             await cassie.execute(query);    
         }
         the_table = `table_${guild_id}.phrases`
         query = `SELECT * FROM ${the_table}`
         result = await cassie.execute(query)
         for (entry of result.rows) {
             query = `DELETE FROM ${the_table} WHERE trigger='${entry.trigger}'`
             await cassie.execute(query);
             query = `INSERT INTO ${the_table} ("trigger", "reply" , "requestor") VALUES ('${entry.trigger.toUpperCase()}', '${entry.reply}', '${entry.requestor}')`;
             await cassie.execute(query);    
         }
         
         the_table = `table_${guild_id}.birthdays`
         query = `SELECT * FROM ${the_table}`
         result = await cassie.execute(query)
         for (entry of result.rows) {
             query = `DELETE FROM ${the_table} WHERE user_id='${entry.user_id}'`
             await cassie.execute(query);
             let day = entry.birthday.split("/")[1]
             let month = entry.birthday.split("/")[0]
             query = `INSERT INTO ${the_table} ("user_id", "announced", "birthday", "day", "month", "requestor", "user", "year") VALUES ('${entry.user_id}', ${entry.announced}, '${entry.birthday}', ${day}, ${month}, '${entry.requestor}', '${entry.user}', ${entry.year})`;
             await cassie.execute(query);    
         }*/

    }
    console.log("done");
}

async function resurrection(client) {
    const Guilds = client.guilds.cache.map(guild => guild.id);
    query = `CREATE TABLE itezz.grades ( guild text PRIMARY KEY, multiplier map<text,int> `
    for (var guild_id of Guilds) {
        createServerFile(guild_id)
    }
    fs.readdir("config/", (err, folders) => {
        if (err)
            return console.log(err);
        folders.forEach(dir => {
            fs.readdir(`config/${dir}`, (error, files) => {
                if (error) return console.error(error);
                files.forEach(file => {
                    if (!file.endsWith(".json")) {
                        return; // the same as continue
                    }
                    fs.readFile(`config/${dir}/${file}`, 'ascii', async function (err, data) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log(dir, file)
                        var obj;
                        try {
                            obj = JSON.parse(data);
                        } catch (err) {
                            return console.error(err);
                        }
                        if (obj.birthday) {
                            for (var birthday of obj.birthday) {
                                the_table = `table_${dir}.birthdays`
                                query = `INSERT INTO ${the_table} ("user_id", "birthday" , "day", "month", "requestor", "user") VALUES ('${birthday.user_id}', '${birthday.birthday}', ${birthday.birthday.split('/')[1]}, ${birthday.birthday.split('/')[0]}, '${birthday.requestor}', '${birthday.user}' )`;
                                await cassie.execute(query);
                            }
                        }
                        if (obj.grades) {
                            for (var grade of obj.grades) {
                                the_table = `table_${dir}.grades`
                                query = `INSERT INTO ${the_table} ("requestor", "english" , "history", "math", "music", "reading", "science", "score") VALUES ('${grade.requestor}', ${grade.English}, ${grade.History}, ${grade.Math}, ${grade.Music}, ${grade.Reading}, ${grade.Science}, ${grade.score})`;
                                await cassie.execute(query);
                            }
                        }
                        if (obj.itezz) {
                            for (var phrase of obj.itezz) {
                                the_table = `table_${dir}.phrases`
                                query = `INSERT INTO ${the_table} ("trigger", "reply", "requestor") VALUES ('${phrase.trigger.toUpperCase()}', '${phrase.reply}', '${phrase.requestor}')`;
                                await cassie.execute(query);
                            }
                        }
                        if (obj.word) {
                            for (var w of obj.word) {
                                the_table = `table_${dir}.word`
                                query = `INSERT INTO ${the_table} ("trigger", "reply", "requestor") VALUES ('${w.trigger.toUpperCase()}', '${w.reply}', '${w.requestor}')`;
                                await cassie.execute(query);
                            }
                        }
                        console.log(`Server: ${dir} done`)
                    })
                })
            })
        })
    });
}

async function random_message(message) {
    let dir = "config/" + message.guildId + "/";
    fs.readFile(dir + "phrase.json", 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Help me\n' + err)
            return
        }
        obj = JSON.parse(data);
        if (getRandomInt(0, 1) === 0) {
            message.channel.send(decode(obj.itezz[getRandomInt(0, obj.itezz.length)].reply))
        } else {
            message.channel.send(decode(obj.word[getRandomInt(0, obj.itezz.length)].reply))
        }
    });
}
async function random(interaction) {
    if (getRandomInt(0, 1) === 0) {
        the_table = `table_${interaction.guildId}.phrases`
    } else {
        the_table = `table_${interaction.guildId}.word`
    }
    query = `SELECT * FROM ${the_table}`
    resultSelectWhere = await cassie.execute(query);
    await interaction.reply(decode(resultSelectWhere.rows[getRandomInt(0, resultSelectWhere.rows.length)].reply))
}

async function secret_santa_guess_game_process(interaction) {
    the_table = `table_${interaction.guildId}.santa_guess`;
    query = `SELECT * FROM ${the_table} where user_id='${interaction.user.id}'`
    
    var resultSelectWhere = await cassie.execute(query).catch((err) => {
        interaction.reply("Someone did not read the 1 rule.");
        return undefined
    });
    if (resultSelectWhere === undefined) {
        return;
    }
    const santa_entry = resultSelectWhere;
    if (santa_entry.rows === undefined) {
        return interaction.reply("Someone did not read the 1 rule.");
    }
    if (santa_entry.rows.length === 0) {
        return interaction.reply("Someone did not read the 1 rule.");
    }
    if (santa_entry.rows[0].year !== DateTime.now().setZone("America/Los_Angeles").year) {
        return interaction.reply("no secret santa guess for this year")
    }
    the_table = `table_${interaction.guildId}.santa`
    query = `SELECT * FROM ${the_table} where guild_id='${interaction.guildId}'`
    var resultSelectWhere = await cassie.execute(query).catch((err) => {
        return interaction.reply(replies[getRandomInt(0, replies.length)]);
    });
    const secret_santa_entry = resultSelectWhere;
    if (secret_santa_entry.rows === undefined) {
        return interaction.reply(replies[getRandomInt(0, replies.length)]);
    }
    if (secret_santa_entry.rows.length === 0) {
        return interaction.reply(replies[getRandomInt(0, replies.length)]);
    }
    if (secret_santa_entry.rows[0].year !== DateTime.now().setZone("America/Los_Angeles").year) {
        return interaction.reply("no secret santa for this year")
    }
    if (!secret_santa_entry.rows[0].users.includes(interaction.user.id)) {
        return interaction.reply("LOOK THIS GUY, NOT SECRET SANTA AND WANTED TO GUESS WHO THEY GOT. YOU THOUGHT.\n :rofl::rofl::rofl:")
    }
    var correct_user = undefined
    for (i in secret_santa_entry.rows[0].pairs) {
        pair = secret_santa_entry.rows[0].pairs[i];
        user1 = pair.split("\t")[0]
        user2 = pair.split("\t")[1]
        if (user2 === interaction.user.id){
            correct_user = user1;
            break;
        }
    }
    initialMessage = `Hey <@!${interaction.user.id}> guessed <@!${santa_entry.rows[0].guessed_user}>.`;
    await interaction.reply(initialMessage);
    if (correct_user === santa_entry.rows[0].guessed_user) {
        initialMessage += `\nWhen you really got <@!${correct_user}> which means you got it right! \nCongrats!`
        } else {
        initialMessage += `\nWhy did you offend <@!${correct_user}> like that?\n~~Congrats!~~Loser`
    }
    await wait(5000);
    return await interaction.editReply(initialMessage);
}

async function process_button_interaction(interaction) {
    if (interaction.user.bot) {
        return console.error("How did a bot click the button?")
    }
    if (interaction.customId === 'secret_santa_guess_game') {
        return await secret_santa_guess_game_process(interaction);
    }
}
module.exports = { migrate, resurrection, getRandomInt, random_message, isEqualIgnoreCase, itEzzMessage, itEzzReply, process_messages, createServerFile, leftToEight, encode, decode, random, clientID, sendFutureBirthdayMessage, process_button_interaction }
