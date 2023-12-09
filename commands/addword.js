const { SlashCommandBuilder } = require('discord.js');
const messageHandler = require('../message.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Add a phrase!')
		.addStringOption(option =>
			option.setName('trigger')
				.setDescription('Get them good with it')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reply')
				.setDescription('\"witty remark\"')
				.setRequired(true)),
	async execute(interaction) {
		await messageHandler.addMessage(interaction)
	},
};
