const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');

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
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const userSelect = new UserSelectMenuBuilder()
            .setCustomId('users')
            .setPlaceholder('Select multiple users.(Max 25)')
            .setMinValues(3)
            .setMaxValues(25);

        const row1 = new ActionRowBuilder()
            .addComponents(userSelect);

        const response = await interaction.reply({
            content: 'Select users:',
            components: [row1],
        });
        const collectorFilter = i => i.user.id === interaction.user.id;
        var valid_users = new Set();
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            if (confirmation.customId === 'users') {
                console.log(confirmation.users);
                confirmation.users.forEach(user => {
                    if (!user.bot) {
                        valid_users.add(user.id);
                    }
                });
                await confirmation.update({ content: `Created Secret Santa List. \nUse \`/myrecipient\` to see who you got`, components: [] });
            }
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
        array = Array.from(valid_users);
        the_table = `table_${interaction.guildId}.santa`
        query = `CREATE TABLE IF NOT EXISTS ${the_table} (guild_id text PRIMARY KEY, creator text, users list<text>, pairs list<text>, received list<text>, sent list<text>, year int, price_limit text)`;
        await cassie.execute(query);
        users = [];
        var arr1 = array;
        var arr2 = array.slice();
        var arr3 = array.slice();
        arr1.sort(function () { return 0.5 - Math.random(); });
        arr2.sort(function () { return 0.5 - Math.random(); });
        while (arr1.length) {
            var name1 = arr1.pop(),
                name2 = arr2[0] == name1 ? arr2.pop() : arr2.shift();
            var tsv = name1 + "\t" + name2
            users.push(tsv);
        }
        const cqlshList = elem => ` '${elem}' `;
        query = `INSERT INTO ${the_table} ("guild_id", "creator" , "users", "pairs", "year", "price_limit", "sent", "received") VALUES ('${interaction.guildId}', '${interaction.user.id}', [${arr3.map(cqlshList)}], [${users.map(cqlshList)}], ${DateTime.now().setZone("America/Los_Angeles").year}, '${interaction.options.getString('limit')}', null, null)`;
        await cassie.execute(query);
    },
};
