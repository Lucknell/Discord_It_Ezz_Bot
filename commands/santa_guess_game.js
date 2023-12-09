const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const { DateTime } = require("luxon");

const cassandra = require('cassandra-driver');

const util = require('../util.js');

const cassie = new cassandra.Client({
    contactPoints: ['192.168.1.107'],
    localDataCenter: 'datacenter1'
});

const replies = ["Christmas is ruined because you ran the commands out of order.", "Hold your horses, you can't hear Mariah Carey's singing just yet..."]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('santaguessgame')
        .setDescription('Let\'s play a game of who got who')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
    async execute(interaction) {
    const checkGuess = new ButtonBuilder()
        .setCustomId('secret_santa_guess_game')
        .setLabel('Check')
        .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder()
        .addComponents(checkGuess);
    var embedMessage = new EmbedBuilder().setColor('#ff00ff').setTitle("Secret Santa Guessing Game").setFooter({ text: "Remember this is optional" })
    embedMessage.addFields({
            name: "Secret Santa Guessing Game Rule",
            value: "The object of this game is to run `/guess` so that you submit your guess and **then** click the button below to see if you are correct. \nGood luck!"
        });
    response = await interaction.reply({ embeds: [embedMessage], components: [row] });
    },
};
