const { SlashCommandBuilder } = require('discord.js');
const grades = require('../grades.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resetgrades')
		.setDescription('Restart your failure!'),
	async execute(interaction) {
		await grades.resetGrades(interaction);
	},
};
