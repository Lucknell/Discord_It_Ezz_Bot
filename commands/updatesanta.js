const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');

const cassandra = require('cassandra-driver');

const replies = ["Christmas is ruined because you ran the commands out of order.", "Hold your horses, you can't hear Mariah Carey's singing just yet..."]

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updatesanta')
        .setDescription('Fix that time of year again')
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
                await confirmation.update({ content: `Updated Secret Santa List. \nUse \`/myrecipient\` to see who you got`, components: [] });
            }
        } catch (e) {
            console.log(e);
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
        array = Array.from(valid_users);
        the_table = `table_${interaction.guildId}.santa`
        users = [];
        query = `SELECT * FROM ${the_table} where guild_id='${interaction.guildId}'`
        var resultSelectWhere = await cassie.execute(query).catch((err) => {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        });
        if (resultSelectWhere.rows.length === 0) {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        }
        user_entry = resultSelectWhere.rows[0];
        var arr1 = array;
        var arr2 = array.slice();
        var arr3 = array.slice();
        arr3 = arr3.concat(user_entry.users)
        arr1.sort(function () { return 0.5 - Math.random(); });
        arr2.sort(function () { return 0.5 - Math.random(); });
        while (arr1.length) {
            var name1 = arr1.pop(),
                name2 = arr2[0] == name1 ? arr2.pop() : arr2.shift();
            var tsv = name1 + "\t" + name2
            users.push(tsv);
        }
        users = users.concat(user_entry.pairs)
        const cqlshList = elem => ` '${elem}' `;
        console.log(user_entry.users, arr3)
        console.log(user_entry.pairs, users)
        query = `UPDATE ${the_table} SET "users" = [${arr3.map(cqlshList)}], "pairs" = [${users.map(cqlshList)}] where guild_id = '${interaction.guildId}'`;
        await cassie.execute(query);
    },
};
