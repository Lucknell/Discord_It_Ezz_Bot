const fs = require('fs');

const { DateTime } = require("luxon");

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
    return string.replaceAll("’", "&#39").replaceAll("'", "&#39").replaceAll("!", "&#33").replaceAll("?", "&#63").replaceAll("\"", "&#34").replaceAll("%", "&#37").replaceAll("-", "&#45").replaceAll("=", "&#61").replaceAll(":", "&#58").replaceAll("\n", "\\n").replaceAll("\r", "")
}
function decode(string) {
    return string.replaceAll("&#39", "'").replaceAll("&#33", "!").replaceAll("&#63", "?").replaceAll("&#34", "\"").replaceAll("&#37", "%").replaceAll("&#45", "-").replaceAll("&#61", "=").replaceAll("&#58", ":").replaceAll("\\n", "\n")
}

function process_messages(message) {
    let dir = "config/" + message.guild.id + "/";
    let file = dir + "grades.json";
    let msg = encode(message.content);
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
                words.push(encode(strings[index].toUpperCase()))
            } 
            for (index in obj.word) {
                word = obj.word[index];
                if (words.indexOf(word.trigger.toUpperCase()) >= 0) {
                    itEzzMessage(word.trigger, decode(word.reply), msg, message);
                }
            }
        }
        for (i in obj.itezz) {
            item = obj.itezz[i]
            itEzzMessage(item.trigger, decode(item.reply), encode(msg), message);
        }
    });
    if (!fs.existsSync(dir)) {
        fs.mkdir(dir, (err) => {
            if (err) {
                throw err;
            }
            console.log("Directory is created.");
        });
    }
    if (!fs.existsSync(file)) {
        let obj = {};
        obj.grades = [];
        var json = {
            score: 0,
            Math: 0,
            English: 0,
            Reading: 0,
            History: 0,
            Science: 0,
            Music: 0,
            requestor: message.author.id
        };
        obj.grades.push(json);
        fs.writeFile(file, JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });
    }
    let data = fs.readFileSync(file, 'ascii');
    obj = JSON.parse(data);
    if (!obj.grades) {
        obj.grades = [];
        var json = {
            score: 0,
            Math: 0,
            English: 0,
            Reading: 0,
            History: 0,
            Science: 0,
            Music: 0,
            requestor: message.author.id
        };
        obj.grades.push(json);
        fs.writeFileSync(file, JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });
        return;
    }
    if (obj.grades.length == 0) {
        var json = {
            score: 0,
            Math: 0,
            English: 0,
            Reading: 0,
            History: 0,
            Science: 0,
            Music: 0,
            requestor: message.author.id
        };
        obj.grades.push(json);
        fs.writeFileSync(file, JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });
    }
    for (i in obj.grades) {
        item = obj.grades[i];
        if (isEqualIgnoreCase(item.requestor, message.author.id)) {
            item.score += 1;
            break;
        }
    }
    if (!(isEqualIgnoreCase(obj.grades[i].requestor, message.author.id))) {
        var json = {
            score: 0,
            Math: 0,
            English: 0,
            Reading: 0,
            History: 0,
            Science: 0,
            Music: 0,
            requestor: message.author.id
        };
        obj.grades.push(json);
    }
    fs.writeFileSync(file, JSON.stringify(obj), 'ascii', function (err) {
        if (err) return console.log(err);
    });
}

function createServerFile(id) {
    phrases = ['you know what they say']
    replies = ['It ezz what it ezz']
    let obj = {};
    obj.itezz = [];
    obj.word = [];
    obj.remove = [];
    obj.birthday = [];
    for (index in phrases) {
        var json = {
            trigger: phrases[index].trim(),
            reply: replies[index].trim(),
            requestor: client.user.tag
        };

        if (phrases[index].trim().split(" ").length > 1) {
            obj.itezz.push(json);
        } else {
            obj.word.push(json);
        }
    }
    fs.writeFile("config/" + id + ".json", JSON.stringify(obj), 'ascii', function (err) {
        if (err) return console.log(err);
    });
    let dir = "config/" + id + "/";
    if (!fs.existsSync(dir)) {
        fs.mkdir(dir, (err) => {
            if (err) {
                throw err;
            }
            console.log("Directory is created.");
        });
    }
    let file = dir + "grades.json"
    fs.readFile(file, 'ascii', function (err, data) {
        if (err) {
            console.log('grades have an issue in \n' + id + err)
            return
        }
        obj = JSON.parse(data);
        if (!obj.grades) {
            obj.grades = [];
        }
        fs.writeFile(file, JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });
    });
}
function leftToEight() {
    var d = new Date();
    return (-d + d.setHours(8, 0, 0, 0));
}

function sendMessage() {
    fs.readdir("config/", (err, files) => {
        if (err)
            console.log(err);
        else {
            let day = DateTime.now().setZone("America/Los_Angeles").day;
            let month = DateTime.now().setZone("America/Los_Angeles").month;
            let year = DateTime.now().setZone("America/Los_Angeles").year;
            console.log("Today is " + month + "/" + day)
            files.forEach(file => {
                if (!file.endsWith(".json")) {
                    return; // the same as continue
                }
                fs.readFile("config/" + file, 'ascii', function (err, data) {
                    if (err) {
                        return message.channel.send(err);
                    }
                    var obj = JSON.parse(data);
                    for (i in obj.birthday) {
                        record = obj.birthday[i];
                        dates = record.birthday.split("/");
                        guild_id = file.replaceAll(".json", "");
                        if (day === parseInt(dates[1]) && month === parseInt(dates[0])) {
                            let guild = client.guilds.cache.get(guild_id);
                            let channel = guild.channels.cache.find(channel => channel.name.toLowerCase() === "general");
                            if (guild && channel && record.year !== year) {
                                channel.send("Happy Birthday <@!" + record.user_id + ">");
                                record.year = year;
                                fs.writeFile("config/" + file, JSON.stringify(obj), 'ascii', function (err) {
                                    if (err) return console.log(err);
                                });
                            }
                        }
                    }
                }
                )

            })
        }
    });
}

module.exports = { getRandomInt, isEqualIgnoreCase, itEzzMessage, itEzzReply, process_messages, createServerFile, leftToEight, sendMessage, encode, decode}