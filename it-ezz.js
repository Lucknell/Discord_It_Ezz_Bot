const Discord = require('discord.js');

const token = require('./token.js');

const util = require('./util.js');

const grades = require('./grades.js')

const m = require('./message.js')

const speak = require('./speak.js')

const client = new Discord.Client();

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
            bot + ' add,birthday,@user,mm/dd\n' + bot + ' report card\n' + bot + ' turn in\n' + bot + ' reset grades\n' +
            bot + ' remove,some phrase\n' + bot + ' word list\n' + bot + ' phrase list\n' + bot + ' remove list\n' + bot + ' say some wild shit\n' +
            bot + ' birthday\n' + bot + ' birthdays\n' +
            bot + ' parler omelette du fromage\n' + bot + ' hablar tengo un gato en mis pantalones\n' + bot + ' skazat медведь на одноколесном велосипеде\n' +
            bot + ' dc'
    })
    avatar = "https://cdn.discordapp.com/attachments/687125195106156547/749283650033680895/image0.png"
    client.user.setAvatar(avatar).catch((err) => { console.log("avatar is being updated too often") });
    setTimeout(function () { // in leftToEight() milliseconds run this:
        util.sendMessage(); // send the message once
        var dayMillseconds = 1000 * 60 * 60 * 6;
        setInterval(function () { // repeat this every 24 hours
            util.sendMessage();
        }, dayMillseconds)
    }, util.leftToEight())
});

client.on('guildCreate', guild => {
    guild.systemChannel.send(helpMessage);
    util.createServerFile(guild.id);

});

client.on('message', message => {
    if (message.author.bot) return;
    let file = "config/" + message.guild.id + "/grades.json";
    const msg = message.content;
    
    if (mention_bot(msg, 'say')) {
        return speak.TTSTime(message, 'say', 'en');
    }
    if (mention_bot(msg, 'parler')) {
        return speak.TTSTime(message, 'parler', 'fr');
    }
    if (mention_bot(msg, 'hablar')) {
        return speak.TTSTime(message, 'hablar', 'es');
    }
    if (mention_bot(msg, 'skazat')) {
        return speak.TTSTime(message, 'skazat', 'ru');
    }
    if (mention_bot(msg, 'dc')) {
        return speak.disconnect(message);
    }
    if (mention_bot(msg, 'help')) {
        return message.channel.send(helpMessage);
    }
    if (mention_bot(msg, 'removelist') || mention_bot(msg, 'remove list')) {
        return m.printFile("config/" + message.guild.id + ".json", 'Remove list', message, client);
    }
    if (mention_bot(msg, 'phraselist') || mention_bot(msg, 'phrase list')) {
        return m.printFile("config/" + message.guild.id + ".json", 'User contributed phrases', message, client);
    }
    if (mention_bot(msg, 'wordlist') || mention_bot(msg, 'word list')) {
        return m.printFile("config/" + message.guild.id + ".json", 'User contributed words', message, client);
    }
    if (mention_bot(msg, 'birthday') || mention_bot(msg, 'birthdays')) {
        return m.printFile("config/" + message.guild.id + ".json", '🎉 Birthdays 🎉', message, client);
    }

    if (mention_bot(msg, 'report card')) {
        return grades.reportCard(file, message);
    }

    if (mention_bot(msg, 'turn in')) {
        return grades.turnIn(file, message);
    }

    if (mention_bot(msg, "reset grades")) {
        return grades.resetGrades(file, message);
    }

    if (mention_bot(msg, "max out grades")) {
        return grades.maxOutGrades(file, message);
    }

    if (mention_bot(msg, 'add')) {
        m.addMessage(msg, message);
        return;
    }
    if (mention_bot(msg, 'remove')) {
        m.removeMessage(msg, message);
        return;
    }
    if (mention_bot(msg, "good bot")) {
        message.react('😄');
        return;
    }
    if (mention_bot(msg, "bad bot")) {
        message.react('🖕');
        message.react('👍');
        message.channel.send(bad_bot[util.getRandomInt(0, bad_bot.length)]);
        return;
    }
    if (mention_bot(msg, "bad boy")) {
        message.channel.send(bad_boy[util.getRandomInt(0, bad_boy.length)]);
        message.react('😉');
        return;
    }
    util.process_messages(message)
});

function mention_bot(msg, str) {
    return (msg.toLowerCase().startsWith(bot + " " + str) || msg.toLowerCase().startsWith(mbot + " " + str))
}

client.login(token.token);