const token = require('./token.js');

const util = require('./util.js');

const fs = require('fs');

const path = require('path');

const speak = require('./speak.js');

const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
]
});

const { EmbedBuilder } = require('discord.js');

const { REST } = require('@discordjs/rest');

const { Routes } = require('discord.js');

var bot = '';

const bad_boy = ['harder daddy', 'Say it for the people in the back', 'only for you daddy', 'you are suppose to only say that in the bedroom'];

const bad_bot = ['Oh yea? well fuck you too', 'fucking bullshit', 'everyone look, this guy thought I would care.', 'Error:ID10T fuck not found', 'too bad for you to handle'];

const replies = ["Christmas is ruined because you ran the commands out of order.", "Hold your horses, you can't hear Mariah Carey's singing just yet..."]

const helpMessage = new EmbedBuilder()
    .setColor('#aa99ff')
    .setTitle('by lucknell')
    .setURL('https://lucknell.github.io')
    .setDescription('I am a bot that says things and post pictures. I can also speak now')
    .setTimestamp()
    .setFooter({ text: 'send help plz\nI was last restarted' })

const commands = [{ name: 'help', description: 'get some help' }];
const rest = new REST({ version: '10' }).setToken(token.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        client.commands = new Collection();
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            // Set a new item in the Collection
            // With the key as the command name and the value as the exported module
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            console.log(command.data.name)
        }

        await rest.put(
            Routes.applicationCommands(util.clientID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
    client.login(token.token);
})();

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        util.process_button_interaction(interaction);
    }
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'help')
        return await interaction.reply({ embeds: [helpMessage] });

    const command = client.commands.get(interaction.commandName);
    
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }


});

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
        value: '/help'
    }, {
        name: 'What triggers me',
        value: 'Check out my slash commands'
    })
    avatar = "https://cdn.discordapp.com/attachments/687125195106156547/749283650033680895/image0.png"
    client.user.setAvatar(avatar).catch((err) => { console.log("avatar is being updated too often") });
    //util.resurrection(client);
    //util.migrate(client);
    setTimeout(function () {
		util.sendFutureBirthdayMessage(client);
        var dayMillseconds = 1000 * 60;
        setInterval(function () {
			util.sendFutureBirthdayMessage(client);
        }, dayMillseconds)
    }, 10000);
});

client.on('guildCreate', guild => {
    guild.systemChannel.send({ embeds: [helpMessage] });
    util.createServerFile(guild.id);
});

client.on('uncaughtException', function(err) {
           console.error(err)
});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    let file = "config/" + message.guild.id + "/grades.json";
    const msg = message.content;
    //return util.random_message(message);

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
