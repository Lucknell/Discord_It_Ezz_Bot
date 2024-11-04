const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

const { DateTime } = require("luxon");

const fs = require('fs');

const cassandra = require('cassandra-driver');

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('secretsanta')
        .setDescription('It\'s that time of year again')
        .addStringOption(option =>
            option.setName('limit')
                .setDescription('Set a limit like $20')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('What channel am I looking for?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reaction')
                .setDescription('What emoji am I looking for?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('What message am I looking for?')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        channel = interaction.options.getChannel('channel')
        let msgid = interaction.options.getString('message_id')
        const msg = await channel.messages.fetch(msgid)
        roleName = 'Santa\'s little helper ' + DateTime.now().setZone("America/Los_Angeles").year
                interaction.guild.roles.create({
                      name: roleName
                  }).then(console.log)
                  .catch(console.error);
        var listOfUserIDS = [];
        interaction.reply(`Created Secret Santa List. \nUse \`/myrecipient\` to see who you got`)
        msg.reactions.cache.forEach(async (reaction) => {
            const userEmoji = interaction.options.getString("reaction").trim()
            const emojiName = reaction._emoji.name
            const emojiCount = reaction.count
            if (emojiName.codePointAt(0).toString(16) === userEmoji.codePointAt(0).toString(16)) {
                console.log(` ${userEmoji} ${emojiName} ${emojiCount}`)
                reactionUsers = await reaction.users.fetch();
                await reactionUsers.forEach(async user => {
                    listOfUserIDS.push(`${user.id}`);
                })
                the_table = `table_${interaction.guildId}.santa`
                query = `CREATE TABLE IF NOT EXISTS ${the_table} (guild_id text PRIMARY KEY, creator text, users list<text>, pairs list<text>, received list<text>, sent list<text>, year int, price_limit text)`;
                await cassie.execute(query);
                let pairs = shuffle_users(listOfUserIDS);
                const cqlshList = elem => ` '${elem}' `;
                query = `INSERT INTO ${the_table} ("guild_id", "creator" , "users", "pairs", "year", "price_limit", "sent", "received") VALUES ('${interaction.guildId}', '${interaction.user.id}', [${listOfUserIDS.map(cqlshList)}], [${pairs.map(cqlshList)}], ${DateTime.now().setZone("America/Los_Angeles").year}, '${interaction.options.getString('limit')}', null, null)`;
                await cassie.execute(query);
                const role = interaction.guild.roles.cache.find(role => role.name === roleName);
                listOfUserIDS.forEach(async userId =>{
                    const member = interaction.guild.members.cache.get(userId);
                    member.roles.add(role);
                })

            }
        });
    },
};

function shuffle_users(array) {
    users = [];
    var arr1 = array.slice();
    var arr2 = array.slice();
    arr1.sort(function () { return 0.5 - Math.random(); });
    arr2.sort(function () { return 0.5 - Math.random(); });
    while (arr1.length) {
        var name1 = arr1.pop(),
            name2 = arr2[0] == name1 ? arr2.pop() : arr2.shift();
        var tsv = name1 + "\t" + name2
        users.push(tsv);
    }
    if (name1 === name2) {
        console.log("Bad shuffle. reshuffling.");
        return shuffle_users(array);
    }
    return users;
}