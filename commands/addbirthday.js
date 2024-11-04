const { SlashCommandBuilder } = require('discord.js');
const messageHandler = require('../message.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addbirthday')
		.setDescription('Add a birthday!')
		.addStringOption(option =>
			option.setName('date')
				.setDescription('Valid date only please')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('user')
				.setDescription('Pick 1')),
	async execute(interaction) {
		await messageHandler.addBirthday(interaction)
	},
};
