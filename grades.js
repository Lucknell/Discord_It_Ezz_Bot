const util = require('./util.js');
const fs = require('fs');
const Discord = require('discord.js');

const grades = ["F", "E", "D", "C-", "C", "C+", "B-", "B", "B+", "A--", "A---", "A", ":poop:", "A+"];

function reportCard(f, message) {
    let dir = "config/" + message.guild.id + "/";
    let file = dir + "grades.json";
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
        fs.writeFileSync(file, JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });
    }
    let data = fs.readFileSync(f, 'ascii');
    var obj = JSON.parse(data);
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
        fs.writeFileSync(f, JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });

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
        fs.writeFileSync(f, JSON.stringify(obj), 'ascii', function (err) {
            if (err) return console.log(err);
        });
    }
    for (i in obj.grades) {
        item = obj.grades[i];
        if (util.isEqualIgnoreCase(item.requestor, message.author.id)) {
            //item.score += 1;
            break;
        }
    }
    if (!(util.isEqualIgnoreCase(obj.grades[i].requestor, message.author.id))) {
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
        const embedMessage = new Discord.MessageEmbed().setColor('#ff0000');
        embedMessage.setTitle("Report card for " + message.author.username + " in " + message.guild.name);
        embedMessage.addFields({ name: "Math", value: "F" });
        embedMessage.addFields({ name: "Reading", value: "F" });
        embedMessage.addFields({ name: "English", value: "F" });
        embedMessage.addFields({ name: "History", value: "F" });
        embedMessage.addFields({ name: "Science", value: "F" });
        embedMessage.addFields({ name: "Music", value: "F" });
        embedMessage.addFields({ name: "Score", value: obj.grades[i].score });
        message.channel.send(embedMessage);

    } else {
        const embedMessage = new Discord.MessageEmbed().setColor('#ff00ff');
        embedMessage.setTitle("Report card for " + message.author.username + " in " + message.guild.name);
        grade = grades[obj.grades[i].Math];
        embedMessage.addFields({ name: "Math", value: grade });
        grade = grades[obj.grades[i].Reading];
        embedMessage.addFields({ name: "Reading", value: grade });
        grade = grades[obj.grades[i].English];
        embedMessage.addFields({ name: "English", value: grade });
        grade = grades[obj.grades[i].History];
        embedMessage.addFields({ name: "History", value: grade });
        grade = grades[obj.grades[i].Science];
        embedMessage.addFields({ name: "Science", value: grade });
        grade = grades[obj.grades[i].Music];
        embedMessage.addFields({ name: "Music", value: grade });
        embedMessage.addFields({ name: "Score", value: obj.grades[i].score });
        message.channel.send(embedMessage);

    }
    fs.writeFileSync(f, JSON.stringify(obj), 'ascii', function (err) {
        if (err) return console.log(err);
    });
}

function turnIn(f, message) {
    let words = message.content.split(" ");
    if (words.length > 3) {
        return turnInGrades(f, message, words[3].toUpperCase());
    }
    let filter = m => m.author.id === message.author.id;
    message.channel.send("What grade do you want to update?").then(() => {
        message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
        })
            .then(message => {
                message = message.first()
                turnInGrades(f, message, message.content.toUpperCase());
            })
            .catch(collected => {
                message.channel.send('Timeout');
            });
    });
}

function turnInGrades(f, message, grade) {
    if (grade === 'MATH') {
        updateGrade(f, "Math", message);
    } else if (grade === 'READING') {
        updateGrade(f, "Reading", message);
    } else if (grade === 'ENGLISH') {
        updateGrade(f, "English", message);
    } else if (grade === 'HISTORY') {
        updateGrade(f, "History", message);
    } else if (grade === 'SCIENCE') {
        updateGrade(f, "Science", message);
    } else if (grade === 'MUSIC') {
        updateGrade(f, "Music", message);
    } else {
        message.channel.send(`Terminated: Invalid Response`)
    }
}

function maxOutGrades(f, message) {
    let filter = m => m.author.id === message.author.id;
    message.channel.send("What grade do you want to max out?").then(() => {
        message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
        })
            .then(message => {
                message = message.first()
                maxGrade(f, message, message.content.toUpperCase());
            })
            .catch(collected => {
                message.channel.send('Timeout\n'+collected);
            });
    });
    
}

function updateGrade(f, subject, message) {
    let data = fs.readFileSync(f, 'ascii');
    var obj = JSON.parse(data);
    for (i in obj.grades) {
        console.log(obj.grades[i])
        item = obj.grades[i];
        if (util.isEqualIgnoreCase(item.requestor, message.author.id)) {
            switch (subject) {
                case "Math":
                    list = checkGrade(item.Math, item.score, message);
                    item.Math = list[0];
                    item.score = list[1];
                    break;
                case "Reading":
                    list = checkGrade(item.Reading, item.score, message);
                    item.Reading = list[0];
                    item.score = list[1];
                    break;
                case "English":
                    list = checkGrade(item.English, item.score, message);
                    item.English = list[0];
                    item.score = list[1];
                    break;
                case "History":
                    list = checkGrade(item.History, item.score, message);
                    item.History = list[0];
                    item.score = list[1];
                    break;
                case "Science":
                    list = checkGrade(item.Science, item.score, message);
                    item.Science = list[0];
                    item.score = list[1];
                    break;
                case "Music":
                    list = checkGrade(item.Music, item.score, message);
                    item.Music = list[0];
                    item.score = list[1];
                    break;
                default:
                    message.channel.send("You really shouldn't be seeing this...");
                    return;
            }
            var str1 = "";
            try {
                str1 = JSON.stringify(obj);
            } catch (err) {
                return message.channel.send("An error occurred\n" + err);
            }
            fs.writeFileSync(f, str1, 'ascii', function (err) {
                if (err) message.channel.send("An error occurred\n" + err);
            });;
            reportCard(f, message);
        }
    }
}


function maxGrade(f, subject, message) {
    let data = fs.readFileSync(f, 'ascii');
    var obj = JSON.parse(data);
    for (i in obj.grades) {
        item = obj.grades[i];
        if (util.isEqualIgnoreCase(item.requestor, message.author.id)) {
            items = [-1, -1];
            switch (subject) {
                case "MATH":
                    list = checkGrade(item.Math, item.score, message);
                    while (list[0] !== items[0]&& list[1] !== items[1]) {
                        items[0] = list[0];
                        items[1] = list[1];
                        item.Math = list[0];
                        item.score = list[1];
                        list = checkGrade(item.Math, item.score, message);
                    }
                    break;
                case "READING":
                    list = checkGrade(item.Reading, item.score, message);
                    item.Reading = list[0];
                    item.score = list[1];
                    break;
                case "ENGLISH":
                    list = checkGrade(item.English, item.score, message);
                    item.English = list[0];
                    item.score = list[1];
                    break;
                case "HISTORY":
                    list = checkGrade(item.History, item.score, message);
                    item.History = list[0];
                    item.score = list[1];
                    break;
                case "SCIENCE":
                    list = checkGrade(item.Science, item.score, message);
                    item.Science = list[0];
                    item.score = list[1];
                    break;
                case "MUSIC":
                    list = checkGrade(item.Music, item.score, message);
                    item.Music = list[0];
                    item.score = list[1];
                    break;
                default:
                    message.channel.send("You really shouldn't be seeing this...");
                    return;
            }
            var str1 = "";
            try {
                str1 = JSON.stringify(obj);
            } catch (err) {
                return message.channel.send("An error occurred\n" + err);
            }
            fs.writeFileSync(f, str1, 'ascii', function (err) {
                if (err) message.channel.send("An error occurred\n" + err);
            });;
            reportCard(f, message);
        }
    }
}

function checkGrade(item, score, message) {
    if (item >= grades.length - 1) {
        message.channel.send("You are already maxed out");
        return [item, score];
    }
    if (score < ((item + 1) * 10)) {
        message.channel.send("Your score is too low.");
        return [item, score]
    }
    item += 1;
    score -= item * 10;
    return [item, score];
}

function resetGrades(f, message) {
    fs.readFile(f, 'ascii', function (err, data) {
        if (err) {
            return message.channel.send(err);
        }
        var obj = JSON.parse(data);
        for (i in obj.grades) {
            item = obj.grades[i];
            if (util.isEqualIgnoreCase(item.requestor, message.author.id)) {
                item.Math = 0;
                item.Reading = 0;
                item.English = 0;
                item.History = 0;
                item.Science = 0;
                item.Music = 0;
                message.channel.send("The deed is done");
                fs.writeFile(f, JSON.stringify(obj), 'ascii', function (err) {
                    if (err) return console.log(err);
                });
                break;
            }
        }
    });
}

module.exports = {reportCard, turnIn, resetGrades, maxOutGrades}