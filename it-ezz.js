const Discord = require('discord.js');

const token = require('./token.js');

const gTTS = require('gtts');

const fs = require('fs');

const client = new Discord.Client();

const queue = new Map();

const file = 'itEzz.json';

const rmFile = 'remove.json';

const servers = 'servers';

var bot = '';

const bad_boy = ['harder daddy', 'Say it for the people in the back', 'only for you daddy', 'you are suppose to only say that in the bedroom'];

const bad_bot = ['Oh yea? well fuck you too', 'fucking bullshit', 'everyone look this guy thought I would care.', 'Error:ID10T fuck not found', 'too bad for you to handle'];

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
            name: 'Yo hablo español',
            type: 'PLAYING'
        }
    });
    bot = '<@!' + client.user.id + '>';
    helpMessage.addFields({
        name: 'Help',
        value: 'at me and say help'
    }, {
        name: 'What triggers me',
        value: 'you know what they say \n@user do you know what they say \nhol up\nhold up\n@user needs a hug\nI need a hug\n' +
            'fucking bullshit\nduck\nducking\ndamn\nsus\nget the beach\nwhy just why\n' + bot + ' add,some phrase,reply\n' +
            bot + ' remove,some phrase\n' + bot + ' addlist\n' + bot + ' removelist\n' + bot + ' say some wild shit\n' + bot + ' parler omelette du fromage\n' +
            bot + ' hablar tengo un gato en mis pantalones\n' + bot + ' skazat медведь на одноколесном велосипеде\n' + bot + ' dc'
    })
    avatar = "https://cdn.discordapp.com/attachments/687125195106156547/749283650033680895/image0.png"
    client.user.setAvatar(avatar);
});

client.on('message', async message => {
    if (message.author.bot) return;
    const msg = message.content;
    let user = message.mentions.users.first();
    userId = user ? user.id : undefined;
    if (userId === client.user.id) {
        if (/say/gi.test(msg)) {
            return TTSTime(message, 'say', 'en');
        }
        if (/parler/gi.test(msg)) {
            return TTSTime(message, 'parler', 'fr');
        }
        if (/hablar/gi.test(msg)) {
            return TTSTime(message, 'hablar', 'es');
        }
        if (/skazat/gi.test(msg)) {
            return TTSTime(message, 'skazat', 'ru');
        }
        if (msg.startsWith(bot + ' dc')) {
            return disconnect(message);
        }
        if (/help/gi.test(msg)) {
            return message.channel.send(helpMessage);
        }
        if (/removelist/gi.test(msg)) {
            let index = (msg.split(' '))[2]
            if (!index) {
                index = 0;
            }
            if (isNaN(index)) {
                return message.reply('Sorry but ' + index + ' is not a number.');
            }
            return printFile(rmFile, 'Remove list', message, index);
        }
        if (/addlist/gi.test(msg)) {
            let index = (msg.split(' '))[2]
            if (!index) {
                index = 0;
            }
            if (isNaN(index)) {
                return message.reply('Sorry but ' + index + 'is not a number.');
            }
            return printFile(file, 'User contributed', message, index);
        }
        if (/add/gi.test(msg)) {
            addMessage(msg, message);
            return;
        }
        if (/remove/gi.test(msg)) {
            removeMessage(msg, message);
            return;
        }
        if (/good bot/gi.test(msg)) {
            message.react('😄');
            return;
        }
        if (/bad bot/gi.test(msg)) {
            message.react('🖕');
            message.react('👍');
            message.channel.send(bad_bot[getRandomInt(0, bad_bot.length)]);
            return;
        }
        if (/bad boy/gi.test(msg)) {
            message.channel.send(bad_boy[getRandomInt(0, bad_boy.length)]);
            message.react('😉');
            return;
        }
    }
    if (/do you know what they say/gi.test(msg) && message.mentions.users.size > 0) {
        message.channel.send("It ezz what it ezz. <@!" + userId + ">");
        return;
    }
    if (/hol up/gi.test(msg) && message.mentions.users.size > 0) {
        message.channel.send("<@!" + userId + ">", { files: ["https://cdn.discordapp.com/attachments/687126062173388829/750787089662214225/tenor.gif"] });
        return;
    }
    if (/needs a hug/gi.test(msg) && message.mentions.users.size > 0) {
        message.channel.send("<@!" + userId + ">", { files: ["https://cdn.discordapp.com/attachments/687122238541135934/756597682641961041/tenor.gif"] });
        return;
    }
    itEzz('hold up', { files: ["https://res.cloudinary.com/teepublic/image/private/s--hW40K4hS--/t_Preview/b_rgb:191919,c_lpad,f_jpg,h_630,q_90,w_1200/v1494300021/production/designs/1586070_1.jpg"] }, msg, message);
    itEzz('i need a hug', { files: ["https://cdn.discordapp.com/attachments/687122238541135934/756597682641961041/tenor.gif"] }, msg, message);
    if (!(/hold up/gi.test(msg))) itEzz('hol up', { files: ["https://cdn.discordapp.com/attachments/687126062173388829/750787089662214225/tenor.gif"] }, msg, message);
    itEzz('you know what they say', "It ezz what it ezz.", msg, message);
    itEzz('fucking bullshit', "straight facts B.", msg, message);
    itEzz('ducking', "Excuse me, you meant fucking.", msg, message);
    if (!(/ducking/gi.test(msg))) itEzz('duck', "Excuse me, you meant fuck.", msg, message);
    if (isEqualIgnoreCase(msg, "sus")) {
        itEzz('sus', { files: ["https://cdn.discordapp.com/attachments/687125195106156547/750482664821358653/image0.jpg"] }, msg, message);
        return;
    }
    itEzz('get the bleach', { files: ["https://cdn.discordapp.com/attachments/709939039033098272/765958054612172800/image0.png"] }, msg, message);
    itEzz('why just why', { files: ["https://cdn.discordapp.com/attachments/709939039033098272/765958408222146600/image0.jpg"] }, msg, message);
    let strs = msg.split(" ");
    for (i = 0; i < strs.length; i++) {
        if (isEqualIgnoreCase(strs[i], "sus")) {
            itEzz('sus', { files: ["https://cdn.discordapp.com/attachments/687125195106156547/750482664821358653/image0.jpg"] }, msg, message);
            return;
        } else if (isEqualIgnoreCase(strs[i], "damn")) {
            itEzz('damn', { files: ["https://cdn.discordapp.com/attachments/738539415843897435/754052901965660330/IMG-20200910-WA0000.jpg"] }, msg, message);
            return;
        }
    }
    fs.readFile(file, 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Help me\n' + err)
            return
        }
        obj = JSON.parse(data);
        for (server in obj.servers) {
            if (!isEqualIgnoreCase(server, message.guild.id)) {
                continue;
            }
            for (m in obj.servers[server]) {
                if (!(obj.servers[server][m])) {
                    continue;
                }
                if (obj.servers[server][m].trigger && obj.servers[server][m].reply && obj.servers[server][m].requestor) {
                    itEzzMessage(obj.servers[server][m].trigger, obj.servers[server][m].reply, msg, message);
                }
            }
        }
    });
});

function itEzz(pattern, reply, msg, message) {
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

function addMessage(msg, message) {
    args = msg.split(',');
    if (args.length === 3) {
        phrase = args[1].split(' ');
        if (args[2].length < 1)
            return message.channel.send('I need some kind of reply for ' + args[1]);
        if (phrase.length > 1) {
            fs.readFile(file, 'ascii', function (err, data) {
                if (err) {
                    return message.channel.send('Error:\n' + err);
                }
                var obj = JSON.parse(data);
                var serverFound = 0;
                for (server in obj.servers) {
                    if (!isEqualIgnoreCase(server, message.guild.id)) {
                        continue;
                    } else {
                        var json = `[{
                        "server_id": ${message.guild.id},
                        "trigger": "${args[1].trim()}",
                        "reply": "${args[2].trim()}",
                        "requestor": "${message.author.tag}"
                    }]`;
                        obj.servers[server].push(JSON.parse(json));
                        serverFound = 1;
                    }
                }
                if (!serverFound) {
                    console.log("server not found adding to " + file)
                    var id = message.guild.id + '';
                    var json = `[{
                        "server_id": ${message.guild.id},
                        "trigger": "${args[1].trim()}",
                        "reply": "${args[2].trim()}",
                        "requestor": "${message.author.tag}"
                    }]`;
                    obj.servers[id] = JSON.parse(json);
                }
                fs.writeFile(file, JSON.stringify(obj), 'ascii', function (err) {
                    if (err) return console.log(err);
                });
            });
            message.channel.send('saved I think. Test it out');
        }
        else {
            message.channel.send("phrase means at least two words...")
        }
    } else {
        message.channel.send({ files: ['https://cdn.discordapp.com/attachments/709939039033098272/771480694483976192/chris.gif'] });
    }
}

function removeMessage(msg, message) {
    phrase = msg.split(',');
    var found = 0;
    if (phrase.length = 2) {
        fs.readFile(file, 'ascii', function (err, data) {
            if (err) {
                message.channel.send('Help me\n' + err)
                return
            }
            var obj = JSON.parse(data);
            for (server in obj.servers) {
                if (!isEqualIgnoreCase(server, message.guild.id)) {
                    continue;
                }
                for (m in obj.servers[server]) {
                    if (isEqualIgnoreCase(obj.servers[server][m].trigger, phrase[1])) {
                        rmEntry = {
                            server_id: message.guild.id,
                            trigger: obj.servers[server][m].trigger,
                            reply: obj.servers[server][m].reply,
                            requestor: message.author.tag
                        }
                        fs.readFile(rmFile, 'ascii', function (err, rmData) {
                            if (err) {
                                return message.channel.send('Help me\n' + err);;
                            }
                            var rmObj = JSON.parse(rmData);
                            if (rmObj.servers[server]) {
                                rmObj.servers[server].push(rmEntry);
                            } else {
                                console.log("server not found adding to " + rmFile)
                                var id = message.guild.id + '';
                                var json = `[{
                                    "server_id": ${message.guild.id},
                                    "trigger": "${obj.servers[server][m].trigger}",
                                    "reply": "${obj.servers[server][m].reply}",
                                    "requestor": "${message.author.tag}"
                                }]`;
                                rmObj.servers[id] = JSON.parse(json);
                            }
                            console.log(JSON.stringify(obj));
                            delete obj.servers[server][m];
                            console.log('\n')
                            console.log(JSON.stringify(obj));
                            fs.writeFile(rmFile, JSON.stringify(rmObj), 'ascii', function (err) {
                                if (err) return message.channel.send('Help me\n' + err);
                            })
                        });
                        found = 1;
                        break;
                    }
                }
            }
            if (found) {
                console.log(JSON.stringify(obj));
                fs.writeFile(file, JSON.stringify(obj), 'ascii', function (err) {
                    if (err) return console.log(err);
                });
                message.channel.send('Found it and removed!');
            } else {
                message.channel.send('You did something wrong because ' + phrase[1] + ' was not found...');
            }
        });
    } else {
        message.channel.send({ files: ['https://cdn.discordapp.com/attachments/738539415843897435/771594423213621248/wtf.gif'] });
    }
}

function printFile(f, type, message, index) {
    fs.readFile(f, 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Error:\n' + err)
            return
        }

        obj = JSON.parse(data);

        const embedMessage = new Discord.MessageEmbed().setColor('#ff00ff').setTitle(type);
        for (server in obj.servers) {
            if (!isEqualIgnoreCase(server, message.guild.id)) {
                continue;
            }
            for (m in obj.servers[server]) {
                if (obj.servers[server][m] === undefined) break;
                if (obj.servers[server][m].trigger && obj.servers[server][m].reply && obj.servers[server][m].requestor) {
                    name = 'Trigger: ' + obj.servers[server][m].trigger + '\nReply: ' + obj.servers[server][m].reply;
                    value = 'Requested by: ' + obj.servers[server][m].requestor;
                    embedMessage.addFields({
                        name: name,
                        value: value
                    });
                }
            }
        }
        message.channel.send(embedMessage);
    });
}
async function TTSTime(message, speak, language) {
    var temp = message.content.split(speak);
    temp.shift();
    var speech = temp.join(speak);
    if (message.member.voice.channel) {
        if (message.member.voice.selfDeaf || message.member.voice.serverDeaf) {
            message.channel.send('You won\'t hear me though :sob:');
            return;
        }
        const serverQueue = queue.get(message.guild.id);
        //var speech = message.content.slice((bot + speak).length + 1);
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
    } else {
        message.channel.send(speak + ' ' + speech + ' where?:rolling_eyes:')
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
    if (message.member.voice.channel) {
        serverQueue = queue.get(message.guild.id);
        if (serverQueue) {
            serverQueue.voiceCh.leave();
            for (i = 0; i < serverQueue.speeches.length; i++) {
                fs.unlink(serverQueue.speeches[i], (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
            }
            queue.delete(message.guild.id);
        }
    } else {
        message.reply('You are not in a voice channel');
    }
    return;
}

client.login(token.token);