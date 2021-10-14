const queue = new Map();
const gTTS = require('gtts');

function TTSTime(message, speak, language) {
    return message.channel.send("This account is hacked you know how to keep in touch");
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
    var filename = 'config/' + message.guild.id + '/voice' + message.author.id + date + '.mp3'

    gtts.save(filename, function (err, result) {
        if (err) { 
            message.channel.send("LOL look at this\n" + err);
            return disconnect(message);
        }
    });
    if (!serverQueue) {
        const queueConstruct = {
            textCh: message.channel,
            voiceCh: message.member.voice.channel,
            connection: null,
            speeches: [],
            playing: true
        };
        queueConstruct.speeches.push(filename);
        try {
            connection = message.member.voice.channel.join();
            queueConstruct.connection = connection;
            queue.set(message.guild.id, queueConstruct);
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
module.exports = { TTSTime, disconnect }