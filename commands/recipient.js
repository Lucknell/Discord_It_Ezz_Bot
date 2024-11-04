const { SlashCommandBuilder } = require('discord.js');

const { DateTime } = require("luxon");

const fs = require('fs');

const util = require('../util.js');

const replies = ["Christmas is ruined because you ran the commands out of order.", "Hold your horses, you can't hear Mariah Carey's singing just yet..."]

const cassandra = require('cassandra-driver');

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('myrecipient')
        .setDescription('It\'s that time of year again $$'),
    async execute(interaction) {
        the_table = `table_${interaction.guildId}.santa`
        query = `SELECT * FROM ${the_table} where guild_id='${interaction.guildId}'`
        var resultSelectWhere = await cassie.execute(query).catch((err) => {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        });
        if (resultSelectWhere.rows.length === 0) {
            return interaction.reply(replies[util.getRandomInt(0, replies.length)]);
        }
        user_entry = resultSelectWhere.rows[0];
        if (!user_entry.users.includes(interaction.user.id)) {
            return interaction.reply("LOOK THIS GUY IS NOT PART OF SECRET SANTA AND WANTED TO A GET A RECIPIENT :rofl::rofl::rofl:")
        }
        if (user_entry.year !== DateTime.now().setZone("America/Los_Angeles").year) {
            return interaction.reply("no secret santa for this year")
        }
        interaction.guild.members.fetch(user_entry.creator).then(user => {
            let starter = user.user.username
            user_entry.pairs.forEach(pair => {
                let user1 = pair.split('\t')[0];
                let user2 = pair.split('\t')[1];
                if (user1 === interaction.user.id) {
                    interaction.guild.members.fetch(user2).then(other_user => {
                        let recipient = other_user.user.username
                        var text = "Hi " + interaction.user.username +
                            ",\nIt appears that " + starter +
                            " has included you in secret santa and you were randomly given the user " +
                            recipient + ". The limit is " + user_entry.price_limit + ". Please buy them a gift and one for myself as well. \nThanks \n" +
                            "PS use `/sentgift` to let us know you sent a gift and `/received` to let the server know you got your gift!\n If you want " +
                            "to stay anonymous you can do `/sentgift ephemeral:true` and `/received ephemeral:true` so that the count will increase without telling everyone."
                        return interaction.reply({ content: text, ephemeral: true });
                    });
                }
            });
            
        });
    }
}