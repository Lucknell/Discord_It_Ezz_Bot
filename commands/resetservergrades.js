const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const grades = require('../grades.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resetallgrades')
		.setDescription('100x big bang Kamehameha')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers),
	async execute(interaction) {
		await grades.goodbyeTien(interaction);
	},
};
