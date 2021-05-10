const Discord = require('discord.js');

const token = require('./token.js');

const gTTS = require('gtts');

const fs = require('fs');

const utf8 = require('utf8')

const client = new Discord.Client();

const queue = new Map();

var bot = '';

const bad_boy = ['harder daddy', 'Say it for the people in the back', 'only for you daddy', 'you are suppose to only say that in the bedroom'];

const bad_bot = ['Oh yea? well fuck you too', 'fucking bullshit', 'everyone look, this guy thought I would care.', 'Error:ID10T fuck not found', 'too bad for you to handle'];

const helpMessage = new Discord.MessageEmbed()
    .setColor('#aa99ff')
    .setTitle('by lucknell')
    .setURL('https://lucknell.github.io')
    .setDescription('I am a bot that says things and post pictures. I can also speak now')
    .setTimestamp()
    .setFooter('send help plz\nI was last restarted');

client.once('ready', () => {
    console.log('It ezz what it ezz')
    client.user.setPresence({
        status: "online",
        activity: {
            name: 'You know what they say',
            type: 'PLAYING'
        }
    });
    bot = '<@!' + client.user.id + '>';
    mbot = '<@' + client.user.id + '>';
    helpMessage.addFields({
        name: 'Help',
        value: 'at me and say help'
    }, {
        name: 'What triggers me',
        value: bot + ' add,some phrase,reply\n' +
            bot + ' remove,some phrase\n' + bot + ' wordlist\n' + bot + ' phraselist\n' + bot + ' removelist\n' + bot + ' say some wild shit\n' + bot + ' parler omelette du fromage\n' +
            bot + ' hablar tengo un gato en mis pantalones\n' + bot + ' skazat медведь на одноколесном велосипеде\n' + bot + ' dc'
    })
    avatar = "https://cdn.discordapp.com/attachments/687125195106156547/749283650033680895/image0.png"
    client.user.setAvatar(avatar).catch((err) => { console.log("avatar is being updated too often") });
});
client.on('guildCreate', guild => {

    guild.systemChannel.send(helpMessage);
    createServerFile(guild.id);

});
client.on('message', async message => {
    if (message.author.bot) return;
    const msg = message.content;
    if (mention_bot(msg, 'say')) {
        return TTSTime(message, 'say', 'en');
    }
    if (mention_bot(msg, 'parler')) {
        return TTSTime(message, 'parler', 'fr');
    }
    if (mention_bot(msg, 'hablar')) {
        return TTSTime(message, 'hablar', 'es');
    }
    if (mention_bot(msg, 'skazat')) {
        return TTSTime(message, 'skazat', 'ru');
    }
    if (mention_bot(msg, 'dc')) {
        return disconnect(message);
    }
    if (mention_bot(msg, 'help')) {
        return message.channel.send(helpMessage);
    }
    if (mention_bot(msg, 'removelist')) {
        return printFile("config/" + message.guild.id + ".json", 'Remove list', message);
    }
    if (mention_bot(msg, 'phraselist')) {
        return printFile("config/" + message.guild.id + ".json", 'User contributed phrases', message);
    }
    if (mention_bot(msg, 'wordlist')) {
        return printFile("config/" + message.guild.id + ".json", 'User contributed words', message);
    }
    if (mention_bot(msg, 'add')) {
        addMessage(msg, message);
        return;
    }
    if (mention_bot(msg, 'remove')) {
        removeMessage(msg, message);
        return;
    }
    if (mention_bot(msg, "good bot")) {
        message.react('😄');
        return;
    }
    if (mention_bot(msg, "bad bot")) {
        message.react('🖕');
        message.react('👍');
        message.channel.send(bad_bot[getRandomInt(0, bad_bot.length)]);
        return;
    }
    if (mention_bot(msg, "bad boy")) {
        message.channel.send(bad_boy[getRandomInt(0, bad_boy.length)]);
        message.react('😉');
        return;
    }

    fs.readFile("config/" + message.guild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Help me\n' + err)
            return
        }
        obj = JSON.parse(data);
        if (obj.word) {
            let strings = msg.split(" ");
            let words = [];
            for (index in strings) {
                words.push(strings[index].toUpperCase().replaceAll("’", "&#39").replaceAll("'", "&#39").replaceAll("\n", "\\n"))
            }
            for (index in obj.word) {
                word = obj.word[index];
                if (words.indexOf(word.trigger.toUpperCase()) >= 0) {
                    itEzzMessage(word.trigger, word.reply.replaceAll("&#39", "'").replaceAll("\\n", "\n"), msg, message);
                }
            }
        }
    });
    fs.readFile("config/" + message.guild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Help me\n' + err)
            return
        }
        obj = JSON.parse(data);
        for (i in obj.itezz) {
            item = obj.itezz[i]
            itEzzMessage(item.trigger, item.reply.replaceAll("&#39", "'").replaceAll("\\n", "\n"), msg.replaceAll("’", "&#39").replaceAll("'", "&#39").replaceAll("\n", "\\n"), message);
        }
    });
});

function mention_bot(msg, str) {
    return (msg.toLowerCase().startsWith(bot + " " + str) || msg.toLowerCase().startsWith(mbot + " " + str))
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

//Thank you Mozilla
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function isEqualIgnoreCase(str1, str2) {
    return (str1 + '').toUpperCase().trim() === (str2 + '').toUpperCase().trim();
}

function createServerFile(id) {
    phrases = ['you know what they say']
    replies = ['It ezz what it ezz']
    let obj = {};
    obj.itezz = [];
    obj.word = [];
    obj.remove = [];
    for (index in phrases) {
        var json = {
            trigger: phrases[index].trim(),
            reply: replies[index].trim(),
            requestor: client.user.tag
        };
        if (phrases[index].split(" ").length > 1) {
            obj.itezz.push(json);
        } else {
            obj.word.push(json);
        }
    }
    fs.writeFile("config/" + id + ".json", JSON.stringify(obj), 'ascii', function (err) {
        if (err) return console.log(err);
    });
}

function removeEmojis(str) {
    let regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g
    return String(str).replaceAll(regex, '');
}


function validJSONString(str) {
    let regex = /^[a-zA-Z0-9$@$!%*?&#<>^\-:/_., +]+$/g;
    return regex.test(str);
}

function addMessage(msg, message) {
    if (/’/g.test(msg) || /'/g.test(msg)) {
        msg = msg.replaceAll("’", "&#39").replaceAll("'", "&#39");
    }
    let arg = removeEmojis(msg).trim().replaceAll("\n", "\\n").replaceAll("\r", "");
    if (!validJSONString(utf8.encode(arg))) {
        return message.channel.send("Invalid characters are detected. I am sorry I cannot add that")
    }
    let args = arg.split(',');

    if (args.length !== 3 || args[1].length < 1) {
        return message.channel.send('https://cdn.discordapp.com/attachments/709939039033098272/771480694483976192/chris.gif');
    }
    if (args[2].length < 1) {
        return message.channel.send('I need some kind of reply for ' + args[1]);
    }
    phrase = args[1].trim().split(' ');
    if (phrase.length < 2) {
        return addWord(message, args)
    }
    return addPhrase(message, args);
}


function addPhrase(message, args) {
    fs.readFile("config/" + message.guild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            return message.channel.send(err);
        }
        var obj = JSON.parse(data);
        for (i in obj.itezz) {
            item = obj.itezz[i];
            if (isEqualIgnoreCase(item.trigger, args[1].trim())) {
                return message.channel.send("Phrase is already stored please remove.");
            }
        }
        var json = {
            trigger: args[1].trim(),
            reply: args[2].trim(),
            requestor: message.author.tag
        };
        obj.itezz.push(json);
        JSON.parse(JSON.stringify(obj));
        fs.writeFile("config/" + message.guild.id + ".json", JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });
        message.channel.send('Saved.');
    });
}

function addWord(message, args) {
    fs.readFile("config/" + message.guild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            return message.channel.send(err);
        }
        var obj = JSON.parse(data);
        var json = {
            trigger: args[1].trim(),
            reply: args[2].trim(),
            requestor: message.author.tag
        };
        if (!obj.word) {
            obj.word = [];
            obj.word.push(json);
            fs.writeFile("config/" + message.guild.id + ".json", JSON.stringify(obj), 'ascii', function (err) {
                if (err) return console.log(err);
            });
            return;
        }
        for (i in obj.word) {
            item = obj.word[i];
            if (isEqualIgnoreCase(item.trigger, args[1].trim())) {
                return message.channel.send("Word is already stored please remove.");
            }
        }
        obj.word.push(json);
        fs.writeFile("config/" + message.guild.id + ".json", JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });
        message.channel.send('Saved.');
    });
}

function removeMessage(msg, message) {
    phrase = msg.replaceAll("\n", "\\n").replaceAll("\r", "").replaceAll("’", "&#39").replaceAll("'", "&#39").split(',');
    var found = false;
    if (phrase.length !== 2) {
        return message.channel.send('https://cdn.discordapp.com/attachments/738539415843897435/771594423213621248/wtf.gif');
    }
    if (phrase[1].split(" ").length === 1) {
        removeWord(message, phrase);
    } else {
        removePhrase(message, phrase);
    }
}

function removePhrase(message, phrase) {
    fs.readFile("config/" + message.guild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Help me\n' + err)
            return
        }
        var found = false;
        var obj = JSON.parse(data);
        for (i in obj.itezz) {
            if (isEqualIgnoreCase(obj.itezz[i].trigger, phrase[1].trim())) {
                rmEntry = {
                    trigger: obj.itezz[i].trigger,
                    reply: obj.itezz[i].reply,
                    requestor: message.author.tag
                }
                if (obj.remove) {
                    obj.remove.push(rmEntry);
                } else {
                    console.log("server not found adding to server")
                    var json = {
                        trigger: obj.itezz[i].trigger,
                        reply: obj.itezz[i].reply,
                        requestor: message.author.tag
                    };
                    obj.remove = [];
                    obj.remove.push(JSON.stringify(json));
                }
                obj.itezz.splice(i, 1);
                //Write after removal to prevent a bug caused by a race condition.
                fs.writeFile("config/" + message.guild.id + ".json", JSON.stringify(obj), 'ascii', function (err) {
                    if (err) return console.log(err);
                });
                found = true;
                break;
            }
        }
        if (found) {
            message.channel.send('Found it and removed!');
        } else {
            message.channel.send('You did something wrong because ' + phrase[1] + ' was not found...');
        }
    });
}

function removeWord(message, phrase) {
    fs.readFile("config/" + message.guild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Help me\n' + err)
            return
        }
        var found = false;
        var obj = JSON.parse(data);
        for (i in obj.word) {
            if (isEqualIgnoreCase(obj.word[i].trigger, phrase[1].trim())) {
                rmEntry = {
                    trigger: obj.word[i].trigger,
                    reply: obj.word[i].reply,
                    requestor: message.author.tag
                }
                if (obj.remove) {
                    obj.remove.push(rmEntry);
                } else {
                    console.log("server not found adding to server")
                    var json = `{
                                "trigger": "${obj.word[i].trigger}",
                                "reply": "${obj.word[i].reply}",
                                "requestor": "${message.author.tag}"
                            }`;
                    obj.remove = [];
                    obj.remove.push(JSON.stringify(json));
                }
                obj.word.splice(i, 1);
                //Write after removal to prevent a bug caused by a race condition.
                fs.writeFile("config/" + message.guild.id + ".json", JSON.stringify(obj), 'ascii', function (err) {
                    if (err) return console.log(err);
                });
                found = true;
                break;
            }
        }
        if (found) {
            message.channel.send('Found it and removed!');
        } else {
            message.channel.send('You did something wrong because ' + phrase[1] + ' was not found...');
        }
    });
}
function printServerData(server, index) {
    const embedMessage = new Discord.MessageEmbed().setColor('#ff00ff')
    for (var j = 10 * index; j < 10 * (index + 1); j++) {
        if (server[j] === undefined) {
            continue;
        }
        if (server[j].trigger && server[j].reply && server[j].requestor) {
            name = 'Trigger: ' + server[j].trigger + '\nReply: ' + server[j].reply;
            value = 'Requested by: ' + server[j].requestor;
            embedMessage.addFields({
                name: name,
                value: value
            });
        }
    }
    return embedMessage;
}

function printFile(f, type, message) {
    msg = message.content;
    let index = parseInt((msg.split(' '))[2])
    if (!index) {
        index = 0;
    } else {
        index -= 1
    }
    if (isNaN(index)) {
        return message.reply('Sorry but ' + index + ' is not a number.');
    }

    fs.readFile(f, 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Error:\n' + err)
            return
        }

        obj = JSON.parse(data);
        if (type === 'Remove list') {
            server = obj.remove;
        } else if (type === 'User contributed phrases') {
            server = obj.itezz;
        } else {
            server = obj.word;
        }
        let pages = Math.ceil(server.length / 10)
        if (index >= pages) {
            index = pages - 1;
        }
        const embedMessage = printServerData(server, index);
        embedMessage.setTitle(type);
        embedMessage.setFooter("Page " + (index + 1) + "/" + pages)
        message.channel.send(embedMessage).then(msg => {
            msg.react('⬅️');
            msg.react('➡️');
            const filter = (reaction, user) => {
                return (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') && user.id !== client.user.id;
            };

            const collector = msg.createReactionCollector(filter, { time: 30000 });

            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === '⬅️') {
                    index -= 1;
                } else if (reaction.emoji.name === '➡️') {
                    index += 1;
                }
                if (index < 0) {
                    index = 0
                } else if (index >= pages) {
                    index = pages - 1
                }
                const embedMessage = printServerData(server, index);
                embedMessage.setTitle(type);
                embedMessage.setFooter("Page " + (index + 1) + "/" + pages)
                msg.edit(embedMessage);
            });

            /*collector.on('end', collected => {
                msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
            });*/
        });
    });
}

async function TTSTime(message, speak, language) {
    var temp = message.content.split(speak);
    temp.shift();
    var speech = temp.join(speak);
    if (speech.length === 0) {
        return;
    }
    if (!message.member.voice.channel) {
        return message.channel.send(speak + ' ' + speech + ' where?:rolling_eyes:')
    }
    if (message.member.voice.selfDeaf || message.member.voice.serverDeaf) {
        message.channel.send('You won\'t hear me though :sob:');
        return;
    }
    const serverQueue = queue.get(message.guild.id);
    var gtts = new gTTS(speech, language);
    var date = Date.now();
    var filename = 'voice' + message.author.tag + date + '.mp3'

    gtts.save(filename, function (err, result) {
        if (err) { throw new Error(err); }
    });
    if (!serverQueue) {
        const queueConstruct = {
            textCh: message.channel,
            voiceCh: message.member.voice.channel,
            connection: null,
            speeches: [],
            playing: true
        };
        queue.set(message.guild.id, queueConstruct);
        queueConstruct.speeches.push(filename);

        try {
            connection = await message.member.voice.channel.join();
            queueConstruct.connection = connection;
            play(message.guild, queueConstruct.speeches[0]);
        } catch (err) {
            console.error(err);
            queue.delete(message.guild.id);
            return;
        }
    } else {
        serverQueue.speeches.push(filename);
        return;
    }
}

function play(guild, filename) {
    const serverQueue = queue.get(guild.id);
    if (!filename) {
        serverQueue.voiceCh.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection.play(filename);
    dispatcher.on('start', () => {
    });
    dispatcher.on('finish', () => {
        fs.unlink(serverQueue.speeches[0], (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
        serverQueue.speeches.shift();
        play(guild, serverQueue.speeches[0]);
    })
    dispatcher.on('error', console.error);

}

function disconnect(message) {
    if (!message.member.voice.channel) {
        return message.reply('You are not in a voice channel');
    }
    serverQueue = queue.get(message.guild.id);
    if (serverQueue) {
        serverQueue.voiceCh.leave();
        for (i = 0; i < serverQueue.speeches.length; i++) {
            fs.unlink(serverQueue.speeches[i], (err) => {
                if (err) {
                    return console.error(err);
                }
            });
        }
        queue.delete(message.guild.id);
    }
}

client.login(token.token);