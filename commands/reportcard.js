const { SlashCommandBuilder } = require('discord.js');
const grades = require('../grades.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reportcard')
		.setDescription('Shows you your failure!'),
	async execute(interaction) {
		await grades.reportCard(interaction);
	},
};
