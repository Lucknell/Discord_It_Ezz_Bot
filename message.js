const Discord = require('discord.js');

const fs = require('fs');

const utf8 = require('utf8');

const util = require('./util.js');

function removeEmojis(str) {
    let regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g
    return String(str).replaceAll(regex, '');
}

function validJSONString(str) {
    let regex = /^[a-zA-Z0-9$@$!%*?&#<>^\-:/_., +]+$/g;
    return regex.test(str);
}

function addMessage(msg, message) {
    msg = util.encode(msg);
    let arg = removeEmojis(msg).trim();
    if (!validJSONString(utf8.encode(arg))) {
        return message.channel.send("Invalid characters are detected. I am sorry I cannot add that")
    }
    let args = arg.split(',');
    if (args.length === 4 && util.isEqualIgnoreCase("birthday", args[1])) {
        return addBirthday(message, args);
    }
    if (args.length !== 3 || args[1].length < 1) {
        return message.channel.send('https://cdn.discordapp.com/attachments/709939039033098272/771480694483976192/chris.gif');
    }
    if (args[2].length < 1) {
        return message.channel.send('I need some kind of reply for ' + args[1]);
    }
    phrase = args[1].trim().split(' ');
    if (phrase.length < 2) {
        return addWord(message, args);
    }
    return addPhrase(message, args);
}

function addBirthday(message, args) {
    if (!(args[3].includes("/"))) {
        return message.channel.send("Please add a valid date");
    }
    date = args[3].split("/");
    if (isNaN(date[0]) || isNaN(date[1])) {
        return message.channel.send("Please provide valid numbers for the date.")
    }
    if (!(DateTime.fromObject({ month: parseInt(date[0]), day: parseInt(date[1]) }).isValid)) {
        return message.channel.send("Please add a valid date in the format MM/DD");
    }
    message.guild.members.fetch(args[2].trim().replaceAll("<", "").replaceAll("@", "").replaceAll("!", "").replaceAll(">", "")).catch((error) => {
        return message.channel.send("invalid user id given");
    });
    fs.readFile("config/" + message.guoild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            return message.channel.send(err);
        }
        var obj = JSON.parse(data);

        if (!obj.birthday) {
            obj.birthday = [];
        }
        message.guild.members.fetch(args[2].trim().replaceAll("<", "").replaceAll("@", "").replaceAll("!", "").replaceAll(">", "")).then((member => {
            for (i in obj.birthday) {
                record = obj.birthday[i];
                if (util.isEqualIgnoreCase(record.user, member.user.tag)) {
                    return message.channel.send("Birthday is already stored please remove.");
                }
            }
            var json = {
                user: member.user.tag,
                user_id: member.user.id,
                birthday: args[3].trim(),
                requestor: message.author.id
            };
            obj.birthday.push(json);
            JSON.parse(JSON.stringify(obj));
            fs.writeFile("config/" + message.guild.id + ".json", JSON.stringify(obj), 'ascii', function (err) {
                if (err) return console.log(err);
            });
            message.channel.send('Saved.');
        }));
    });
}

function addPhrase(message, args) {
    fs.readFile("config/" + message.guild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            return message.channel.send(err);
        }
        var obj = JSON.parse(data);
        for (i in obj.itezz) {
            item = obj.itezz[i];
            if (util.isEqualIgnoreCase(item.trigger, args[1].trim())) {
                return message.channel.send("Phrase is already stored please remove.");
            }
        }
        var json = {
            trigger: args[1].trim(),
            reply: args[2].trim(),
            requestor: message.author.id
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
            requestor: message.author.id
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
            if (util.isEqualIgnoreCase(item.trigger, args[1].trim())) {
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
    phrase = util.encode(msg).split(',');
    var found = false;
    if (phrase.length === 3 && util.isEqualIgnoreCase(phrase[1], "birthday")) {
        return removeBirthday(message);
    }
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
            if (util.isEqualIgnoreCase(obj.itezz[i].trigger, phrase[1].trim())) {
                rmEntry = {
                    trigger: obj.itezz[i].trigger,
                    reply: obj.itezz[i].reply,
                    requestor: message.author.id
                }
                if (obj.remove) {
                    obj.remove.push(rmEntry);
                } else {
                    console.log("server not found adding to server")
                    var json = {
                        trigger: obj.itezz[i].trigger,
                        reply: obj.itezz[i].reply,
                        requestor: message.author.id
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
            if (util.isEqualIgnoreCase(obj.word[i].trigger, phrase[1].trim())) {
                rmEntry = {
                    trigger: obj.word[i].trigger,
                    reply: obj.word[i].reply,
                    requestor: message.author.id
                }
                if (obj.remove) {
                    obj.remove.push(rmEntry);
                } else {
                    console.log("server not found adding to server")
                    var json = `{
                                "trigger": "${obj.word[i].trigger}",
                                "reply": "${obj.word[i].reply}",
                                "requestor": "${message.author.id}"
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
            message.channel.send('You did something wrong because \'' + phrase[1] + '\' was not found...');
        }
    });
}

function removeBirthday(message) {
    fs.readFile("config/" + message.guild.id + ".json", 'ascii', function (err, data) {
        if (err) {
            message.channel.send('Help me\n' + err)
            return
        }
        var found = false;
        var obj = JSON.parse(data);
        var args = message.content.split(",");
        message.guild.members.fetch(args[2].trim().replaceAll("<", "").replaceAll("@", "").replaceAll("!", "").replaceAll(">", "")).then((member => {
            for (i in obj.birthday) {
                record = obj.birthday[i];
                if (util.isEqualIgnoreCase(record.user, member.user.tag)) {
                    found = true;
                    obj.birthday.splice(i, 1);
                    //Write after removal to prevent a bug caused by a race condition.
                    fs.writeFile("config/" + message.guild.id + ".json", JSON.stringify(obj), 'ascii', function (err) {
                        if (err) return console.log(err);
                    });
                }
            }
            if (found) {
                message.channel.send('Found and removed!');
            } else {
                message.channel.send('You did something wrong because that birthday was not found...');
            }
        }));
    });
}

function printServerData(server, index) {
    const embedMessage = new Discord.MessageEmbed().setColor('#ff00ff')
    for (var j = 10 * index; j < 10 * (index + 1); j++) {
        if (server[j] === undefined) {
            continue;
        }
        if (server[j].trigger && server[j].reply && server[j].requestor) {
            name = 'Trigger: ' + util.decode(server[j].trigger) + '\nReply: ' + util.decode(server[j].reply);
            value = 'Requested by: ' + server[j].requestor;
            embedMessage.addFields({
                name: name,
                value: value
            });
        }
    }
    return embedMessage;
}

function printBirthday(server, index) {
    const embedMessage = new Discord.MessageEmbed().setColor('#ff33ff')
    for (var j = 10 * index; j < 10 * (index + 1); j++) {
        if (server[j] === undefined) {
            continue;
        }
        if (server[j].user && server[j].birthday && server[j].requestor) {
            name = 'User: ' + server[j].user + '\nBirthday: ' + server[j].birthday;
            value = '`added by:' + server[j].requestor + "`";
            embedMessage.addFields({
                name: name,
                value: value
            });
        }
    }
    return embedMessage;
}
function currPages(reaction, index, msg, type, pages) {
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
    embedMessage = null;
    if (!(type === '🎉 Birthdays 🎉')) {
        embedMessage = printServerData(server, index);
        embedMessage.setTitle(type);
        embedMessage.setFooter("Page " + (index + 1) + "/" + pages)
    } else {
        embedMessage = printBirthday(server, index);
        embedMessage.setTitle(type);
        embedMessage.setFooter("Page " + (index + 1) + "/" + pages)
    }
    msg.edit(embedMessage);
    return index;
}
function printFile(f, type, message, client) {
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
        } else if (type === '🎉 Birthdays 🎉') {
            server = obj.birthday;
        } else {
            server = obj.word;
        }
        if (!server) return message.channel.send("No data available.");
        if (server.length === 0) return message.channel.send("No data available.");
        let pages = Math.ceil(server.length / 10)
        if (index >= pages) {
            index = pages - 1;
        }
        embedMessage = null;
        if (!(type === '🎉 Birthdays 🎉')) {
            embedMessage = printServerData(server, index);
            embedMessage.setTitle(type);
            embedMessage.setFooter("Page " + (index + 1) + "/" + pages)
        } else {
            embedMessage = printBirthday(server, index);
            embedMessage.setTitle(type);
            embedMessage.setFooter("Page " + (index + 1) + "/" + pages)
        }
        message.channel.send(embedMessage).then(msg => {
            msg.react('⬅️');
            msg.react('➡️');
            const filter = (reaction, user) => {
                return (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') && user.id !== client.user.id;
            };

            const collector = msg.createReactionCollector(filter, { time: 30000, dispose: true });

            collector.on('collect', (reaction, user) => {
                index = currPages(reaction, index, msg, type, pages)
            });

            collector.on('remove', (reaction, user) => {
                index = currPages(reaction, index, msg, type, pages)
            });

            /*collector.on('end', collected => {
                msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
            });*/
        });
    });
}

module.exports = { addMessage, removeMessage, printFile }